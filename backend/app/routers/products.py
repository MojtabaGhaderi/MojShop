from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas, models
from app.database import get_db
from app.services.price_service import fetch_live_prices

from app.dependencies import get_current_admin



router = APIRouter(prefix="/products", tags=["products"])


def _compute_current_price(product, prices: dict) -> float:
    metal_value = 0.0
    for material in product.materials:
        if material.metal_type.value != "none":
            rate = prices.get(f"{material.metal_type.value}_per_gram", 0)
            metal_value += material.weight_grams * rate
    return round(product.base_price + metal_value, 2)


def _product_to_response(product, prices: dict) -> schemas.ProductResponse:
    data = {
        "id": product.id,
        "name": product.name,
        "slug": product.slug,
        "description": product.description,
        "base_price": product.base_price,
        "total_weight_grams": product.total_weight_grams,
        "stock_quantity": product.stock_quantity,
        "is_active": product.is_active,
        "created_at": product.created_at,
        "category": product.category,
        "materials": product.materials,
        "images": product.images,
        "current_price": _compute_current_price(product, prices),
    }
    return schemas.ProductResponse.model_validate(data)


@router.get("/", response_model=List[schemas.ProductResponse])
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category slug"),
    metal: Optional[str] = Query(None, description="Filter by metal type"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    db: Session = Depends(get_db),
):
    prices = await fetch_live_prices()
    products = crud.get_products_filtered(db, category_slug=category, metal_type=metal, search=search)
    return [_product_to_response(p, prices) for p in products]


@router.get("/{slug}", response_model=schemas.ProductResponse)
async def get_product(slug: str, db: Session = Depends(get_db)):
    product = crud.get_product_by_slug(db, slug)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    prices = await fetch_live_prices()
    return _product_to_response(product, prices)


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