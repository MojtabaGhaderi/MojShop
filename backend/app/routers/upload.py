import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Product, ProductImage
from app.services.image_service import process_product_image

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post("/{product_id}")
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > max_size:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    # Process image in thread pool
    try:
        result = await asyncio.to_thread(process_product_image, file, product_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image processing failed: {str(e)}")

    # Extract primary URL from result (handles dict e.g. {"primary": "..."} or {"url": "..."} or string)
    image_url = ""
    if isinstance(result, dict):
        image_url = (
            result.get("primary")
            or result.get("url")
            or result.get("original")
            or result.get("main")
            or next(iter(result.values()), "")
        )
    elif isinstance(result, (list, tuple)) and len(result) > 0:
        image_url = result[0] if isinstance(result[0], str) else result[0].get("url", "")
    elif isinstance(result, str):
        image_url = result

    # Check if this product has any existing images to determine is_primary
    existing_count = db.query(ProductImage).filter(ProductImage.product_id == product_id).count()
    is_primary = existing_count == 0

    # Insert into product_images table and commit
    new_image = ProductImage(
        product_id=product_id,
        url=image_url,
        alt_text=product.name,
        is_primary=is_primary,
        sort_order=existing_count,
    )
    db.add(new_image)
    db.commit()
    db.refresh(new_image)
    
    return {
        "product_id": product_id,
        "image_id": new_image.id,
        "url": new_image.url,
        "is_primary": new_image.is_primary,
        "raw_result": result,
    }