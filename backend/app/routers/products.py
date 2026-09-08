from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas, models
from app.database import get_db
from app.services.price_service import fetch_live_prices

from app.dependencies import get_current_admin
from app.services.pricing import compute_current_price, serialize_product

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/")
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    metal: Optional[str] = Query(None, description="Filter by metal type"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
):
    prices = await fetch_live_prices()
    products = crud.get_products_filtered(
        db, category_slug=category, metal_type=metal, search=search, skip=skip, limit=limit
    )
    total = crud.get_products_count(db, category_slug=category, metal_type=metal, search=search)
    
    return {
        "items": [serialize_product(p, prices) for p in products],
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.get("/{slug}", response_model=schemas.ProductResponse)
async def get_product(slug: str, db: Session = Depends(get_db)):
    product = crud.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    prices = await fetch_live_prices()
    return serialize_product(product, prices)

@router.post("/", response_model=schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    existing = crud.get_product_by_slug(db, product.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Product with this slug already exists")

    category = db.query(models.Category).filter(models.Category.id == product.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    product_dict = product.model_dump()
    db_product = crud.create_product(db, product_dict)
    db.refresh(db_product)

    prices = await fetch_live_prices()
    return _product_to_response(db_product, prices)

@router.put("/{slug}", response_model=schemas.ProductResponse)
async def update_product(
    slug: str,
    product: schemas.ProductUpdate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    db_product = crud.get_product_by_slug(db, slug)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_dict = {k: v for k, v in product.model_dump().items() if v is not None}

    if "category_id" in update_dict:
        category = db.query(models.Category).filter(
            models.Category.id == update_dict["category_id"]
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    updated = crud.update_product(db, db_product, update_dict)
    prices = await fetch_live_prices()
    return _product_to_response(updated, prices)

@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    slug: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    db_product = crud.get_product_by_slug(db, slug)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")

    crud.delete_product(db, db_product)
    return None