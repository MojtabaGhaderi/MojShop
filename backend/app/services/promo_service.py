from datetime import datetime
from app import models


def find_valid_promo(db, code: str, subtotal: float):
    """Returns (promo, discount_amount, error_message). promo is None on any failure."""
    promo = db.query(models.PromoCode).filter(models.PromoCode.code == code, models.PromoCode.is_active == True).first()
    if not promo:
        return None, 0.0, "کد تخفیف نامعتبر است"
    if promo.expires_at and promo.expires_at < datetime.utcnow():
        return None, 0.0, "کد تخفیف منقضی شده است"
    if promo.usage_limit is not None and promo.used_count >= promo.usage_limit:
        return None, 0.0, "ظرفیت این کد تخفیف تمام شده است"

    if promo.type.value == "percent":
        discount = round(subtotal * (promo.amount / 100), 0)
    else:
        discount = min(promo.amount, subtotal)
    return promo, discount, None