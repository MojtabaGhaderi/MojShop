from app import models

DEFAULT_SHIPPING_COST = 50000  # Toman — fallback for any city with no configured rate


def calculate_shipping_cost(db, city: str) -> float:
    rate = db.query(models.ShippingRate).filter(models.ShippingRate.city == city).first()
    return rate.cost if rate else DEFAULT_SHIPPING_COST