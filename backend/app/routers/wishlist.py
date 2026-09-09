from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.database import get_db
from app.dependencies import get_current_user
from app.services.price_service import fetch_live_prices
from app.services.pricing import serialize_product

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.get("/", response_model=list[schemas.WishlistItemResponse])
async def get_wishlist(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    items = (
        db.query(models.WishlistItem)
        .options(
            joinedload(models.WishlistItem.product).joinedload(models.Product.category),
            joinedload(models.WishlistItem.product).joinedload(models.Product.materials),
            joinedload(models.WishlistItem.product).joinedload(models.Product.images),
            joinedload(models.WishlistItem.product).joinedload(models.Product.variants),
        )
        .filter(models.WishlistItem.user_id == current_user.id)
        .order_by(models.WishlistItem.created_at.desc())
        .all()
    )
    prices = await fetch_live_prices()
    return [
        {"id": i.id, "product": serialize_product(i.product, prices), "created_at": i.created_at}
        for i in items
    ]


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=schemas.WishlistItemResponse)
async def add_to_wishlist(
    payload: schemas.WishlistAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    product = db.query(models.Product).filter(models.Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    prices = await fetch_live_prices()
    existing = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current_user.id, models.WishlistItem.product_id == payload.product_id
    ).first()
    if existing:
        return {"id": existing.id, "product": serialize_product(product, prices), "created_at": existing.created_at}

    item = models.WishlistItem(user_id=current_user.id, product_id=payload.product_id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "product": serialize_product(product, prices), "created_at": item.created_at}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    item = db.query(models.WishlistItem).filter(
        models.WishlistItem.user_id == current_user.id, models.WishlistItem.product_id == product_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not in wishlist")
    db.delete(item)
    db.commit()
    return None