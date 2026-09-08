import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user_optional
from app.models import Order, OrderStatus, Payment, PaymentStatus, User
from app.schemas import PaymentCreateRequest, PaymentCreateResponse, PaymentVerifyRequest, PaymentVerifyResponse
from app.services import zarinpal_service
from app.crud import release_expired_reservations

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create", response_model=PaymentCreateResponse)
async def create_payment(
    payload: PaymentCreateRequest,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),  # was: User = Depends(get_current_user)
):
    release_expired_reservations(db)
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id is not None:
        if current_user is None or order.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="This order does not belong to you")
    # else: guest order — payable by whoever holds this order_id from their own checkout flow.

    if order.status != OrderStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Order is '{order.status.value}', not payable")
    if order.total <= 0:
        raise HTTPException(status_code=400, detail="Order total must be greater than zero")

    callback_url = f"{settings.FRONTEND_URL}/callback?order_id={order.id}"
    if order.user_id is None and order.guest_email:
        callback_url += f"&guest_email={order.guest_email}"

    try:
        authority = await zarinpal_service.request_payment(
            amount_toman=int(order.total),
            description=f"سفارش #{order.id} — موج گالری",
            callback_url=callback_url,
            mobile=current_user.phone if current_user else None,
            email=current_user.email if current_user else order.guest_email,
        )
    except zarinpal_service.ZarinPalError as e:
        raise HTTPException(status_code=502, detail=f"خطا در اتصال به درگاه پرداخت: {e.message}")

    payment = Payment(order_id=order.id, gateway="zarinpal", authority=authority, amount=order.total, status=PaymentStatus.PENDING)
    db.add(payment)
    db.commit()
    return PaymentCreateResponse(payment_url=zarinpal_service.build_startpay_url(authority), authority=authority)

@router.post("/verify", response_model=PaymentVerifyResponse)
async def verify_payment(payload: PaymentVerifyRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == payload.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = (
        db.query(Payment)
        .filter(Payment.order_id == order.id, Payment.authority == payload.authority)
        .order_by(Payment.id.desc())
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # Idempotent — a browser refresh on the callback page shouldn't re-verify or double-charge.
    if payment.status == PaymentStatus.SUCCESS:
        return PaymentVerifyResponse(status="success", ref_id=payment.ref_id, order_status=order.status)

    try:
        result = await zarinpal_service.verify_payment(amount_toman=int(payment.amount), authority=payment.authority)
    except zarinpal_service.ZarinPalError as e:
        payment.status = PaymentStatus.FAILED
        db.commit()
        return PaymentVerifyResponse(status="failed", ref_id=None, order_status=order.status, message=e.message)

    payment.status = PaymentStatus.SUCCESS
    payment.ref_id = result["ref_id"]
    payment.verified_at = datetime.datetime.utcnow()
    order.status = OrderStatus.PAID
    db.commit()

    return PaymentVerifyResponse(status="success", ref_id=payment.ref_id, order_status=order.status)