import asyncio
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import User, Product
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
    
    return {
        "product_id": product_id,
        "urls": result,
    }