from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, CartItem, Product, Order, OrderItem, Address, OrderStatus

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



@router.post("/checkout")
def mock_checkout(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Get user's cart items
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    # 2. Get user's shipping address (prefer default, otherwise first available)
    address = db.query(Address).filter(
        Address.user_id == current_user.id, 
        Address.is_default == True
    ).first()
    
    if not address:
        address = db.query(Address).filter(Address.user_id == current_user.id).first()
        
    if not address:
        raise HTTPException(status_code=400, detail="Please add a shipping address before checkout")

    subtotal = 0.0
    
    # 3. Validate stock and calculate subtotal
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock_quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")
        
        # Deduct stock
        product.stock_quantity -= item.quantity
        subtotal += product.base_price * item.quantity

    # 4. Create Order
    new_order = Order(
        user_id=current_user.id,
        address_id=address.id,
        status=OrderStatus.PAID,  # Mocked as paid
        subtotal=subtotal,
        shipping_cost=0.0,
        tax=0.0,
        total=subtotal
    )
    db.add(new_order)
    db.flush()  # Flush to generate new_order.id before creating OrderItems

    # 5. Create Order Items (Snapshot data)
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        # Get primary image URL if available
        primary_image = next((img.url for img in product.images if img.is_primary), None)
        
        # Snapshot materials for the order record
        materials_snapshot = [
            {"metal_type": m.metal_type.value, "weight_grams": m.weight_grams, "display_name": m.display_name} 
            for m in product.materials
        ] if product.materials else None

        order_item = OrderItem(
            order_id=new_order.id,
            product_name=product.name,
            product_slug=product.slug,
            unit_price=product.base_price,
            quantity=item.quantity,
            materials_snapshot=materials_snapshot,
            image_url=primary_image
        )
        db.add(order_item)

    # 6. Clear Cart
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    
    db.commit()
    db.refresh(new_order)
    
    return {"message": "Order completed successfully", "order_id": new_order.id}