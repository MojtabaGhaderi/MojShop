# backend/app/services/pricing.py
from app import schemas

def compute_metal_value(materials, prices: dict, weight_factor: float = 1.0) -> float:
    metal_value = 0.0
    for material in materials:
        metal_key = f"{material.metal_type.value}_per_gram"
        rate = prices.get(metal_key, 0)
        # Apply variant weight factor if applicable
        metal_value += (material.weight_grams * weight_factor) * rate
    return metal_value

def compute_current_price(product, prices: dict, variant=None) -> float:
    base = product.base_price
    weight_factor = 1.0
    variant_adj = 0.0

    if variant:
        variant_adj = variant.price_adjustment or 0.0
        # If the variant specifies an explicit weight multiplier or override
        if getattr(variant, "weight_factor", None):
            weight_factor = variant.weight_factor

    metal_value = compute_metal_value(product.materials, prices, weight_factor)
    return round(base + metal_value + variant_adj, 2)

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
        "tags": product.tags,
    }
    return schemas.ProductResponse.model_validate(data)