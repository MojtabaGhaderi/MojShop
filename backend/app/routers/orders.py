from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])



@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    
    address = crud.get_address_by_id(db, order.address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    cart_items = crud.get_cart_items(db, current_user.id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    db_order = await crud.create_order(db, current_user.id, order.address_id, cart_items)
    
    # Re-fetch with relationships loaded
    db_order = crud.get_order_by_id(db, db_order.id, current_user.id)
    
    return db_order

@router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    return crud.get_orders_by_user(db, current_user.id)


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    order = crud.get_order_by_id(db, order_id, current_user.id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order