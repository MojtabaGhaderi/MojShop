from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user
from app.services.price_service import fetch_live_prices

router = APIRouter(prefix="/cart", tags=["cart"])


def _compute_current_price(product, prices: dict) -> float:
    metal_value = 0.0
    for material in product.materials:
        if material.metal_type.value != "none":
            rate = prices.get(f"{material.metal_type.value}_per_gram", 0)
            metal_value += material.weight_grams * rate
    return round(product.base_price + metal_value, 2)


def _cart_item_to_response(cart_item: models.CartItem, prices: dict) -> dict:
    product = cart_item.product
    variant = cart_item.variant
    base_price = _compute_current_price(product, prices)
    unit_price = round(base_price + (variant.price_adjustment if variant else 0.0), 2)

    return {
        "id": cart_item.id,
        "user_id": cart_item.user_id,
        "quantity": cart_item.quantity,
        "unit_price": unit_price,
        "variant": variant,
        "created_at": cart_item.created_at,
        "updated_at": cart_item.updated_at,
        "product": {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "base_price": product.base_price,
            "total_weight_grams": product.total_weight_grams,
            "stock_quantity": product.stock_quantity,
            "is_active": product.is_active,
            "current_price": base_price,
            "created_at": product.created_at,
            "category": product.category,
            "materials": product.materials,
            "images": product.images,
        }
    }

@router.get("/", response_model=list[schemas.CartItemResponse])
async def get_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    cart_items = crud.get_cart_items(db, current_user.id)
    prices = await fetch_live_prices()
    
    result = []
    for item in cart_items:
        data = _cart_item_to_response(item, prices)
        result.append(schemas.CartItemResponse.model_validate(data))
    
    return result


@router.post("/", response_model=schemas.CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item: schemas.CartItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not product.is_active:
        raise HTTPException(status_code=400, detail="Product is not available")

    variant = None
    if item.variant_id is not None:
        variant = db.query(models.Variant).filter(
            models.Variant.id == item.variant_id, models.Variant.product_id == item.product_id
        ).first()
        if not variant or not variant.is_active:
            raise HTTPException(status_code=404, detail="Variant not found")

    available_stock = variant.stock_quantity if variant else product.stock_quantity
    if available_stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    cart_item = crud.add_to_cart(db, current_user.id, item.product_id, item.quantity, item.variant_id)
    prices = await fetch_live_prices()
    return schemas.CartItemResponse.model_validate(_cart_item_to_response(cart_item, prices))



@router.put("/items/{cart_item_id}", response_model=schemas.CartItemResponse)
async def update_cart_item(
    cart_item_id: int,
    item: schemas.CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    cart_item = crud.get_cart_item_by_id(db, current_user.id, cart_item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")

    available_stock = cart_item.variant.stock_quantity if cart_item.variant else cart_item.product.stock_quantity
    if available_stock < item.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")

    updated = crud.update_cart_item(db, cart_item, item.quantity)
    prices = await fetch_live_prices()
    return schemas.CartItemResponse.model_validate(_cart_item_to_response(updated, prices))


@router.delete("/items/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_cart(
    cart_item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    cart_item = crud.get_cart_item_by_id(db, current_user.id, cart_item_id)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not in cart")
    crud.delete_cart_item(db, cart_item)
    return None

@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
def clear_cart(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    crud.clear_cart(db, current_user.id)
    return None