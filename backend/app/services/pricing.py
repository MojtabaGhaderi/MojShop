# backend/app/services/pricing.py — new file
from app import schemas


def compute_current_price(product, prices: dict) -> float:
    metal_value = 0.0
    for material in product.materials:
        if material.metal_type.value != "none":
            rate = prices.get(f"{material.metal_type.value}_per_gram", 0)
            metal_value += material.weight_grams * rate
    return round(product.base_price + metal_value, 2)


def serialize_product(product, prices: dict) -> schemas.ProductResponse:
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
        "current_price": compute_current_price(product, prices),
        "variants": product.variants,
    }
    return schemas.ProductResponse.model_validate(data)