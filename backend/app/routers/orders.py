#orders.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user

from app.services.invoice_service import generate_invoice_pdf
from app.models import InvoiceStatus
from app.crud import get_order_by_id
from app import crud

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("/", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order: schemas.OrderCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    address = crud.get_address_by_id(db, order.address_id, current_user.id)
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    cart_items = crud.get_cart_items(db, current_user.id)
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    try:
        db_order = await crud.create_order(db, current_user.id, order.address_id, cart_items, promo_code=order.promo_code)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return db_order

@router.post("/guest", response_model=schemas.OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_guest_order_endpoint(payload: schemas.GuestOrderCreate, db: Session = Depends(get_db)):
    try:
        db_order = await crud.create_guest_order(
            db,
            guest_email=payload.guest_email,
            guest_name=payload.guest_name,
            address_data=payload.address.model_dump(),
            items=[item.model_dump() for item in payload.items],
            promo_code=payload.promo_code,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return db_order


@router.get("/guest/{order_id}", response_model=schemas.OrderResponse)
def get_guest_order_endpoint(
    order_id: int,
    email: str = Query(..., description="The guest_email used at checkout"),
    db: Session = Depends(get_db),
):
    order = crud.get_guest_order(db, order_id, email)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
    
@router.get("/", response_model=list[schemas.OrderResponse])
def get_orders(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.get_orders_by_user(db, current_user.id)


@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    order = get_order_by_id(db, order_id, current_user.id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post(
    "/{order_id}/cancel",
    response_model=schemas.OrderResponse,
)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return crud.cancel_order(
        db=db,
        order_id=order_id,
        user_id=current_user.id,
    )

@router.get("/{order_id}/invoice")
def get_invoice(order_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = get_order_by_id(db, order_id, current_user.id)
    if not order or not order.invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not order.invoice.pdf_url:
        order.invoice.pdf_url = generate_invoice_pdf(order)
        order.invoice.status = InvoiceStatus.GENERATED
        db.commit()

    return {"pdf_url": order.invoice.pdf_url}


@router.get("/guest/{order_id}/invoice")
def get_guest_invoice(order_id: int, email: str = Query(...), db: Session = Depends(get_db)):
    order = crud.get_guest_order(db, order_id, email)
    if not order or not order.invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if not order.invoice.pdf_url:
        order.invoice.pdf_url = generate_invoice_pdf(order)
        order.invoice.status = InvoiceStatus.GENERATED
        db.commit()

    return {"pdf_url": order.invoice.pdf_url}