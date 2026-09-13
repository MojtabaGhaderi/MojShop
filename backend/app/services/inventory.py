#inventory.py
from sqlalchemy.orm import Session

from app import models


def has_variants(product: models.Product) -> bool:
    return bool(product.variants)


def get_available_stock(
    product: models.Product,
    variant: models.Variant | None = None,
) -> int:
    if variant is not None:
        if variant.product_id != product.id:
            raise ValueError("Variant does not belong to this product")

        if not variant.is_active:
            return 0

        return variant.stock_quantity

    if has_variants(product):
        return sum(
            variant.stock_quantity
            for variant in product.variants
            if variant.is_active
        )

    return product.stock_quantity


def sync_product_stock(
    product: models.Product,
    db: Session,
) -> int:
    variants = (
        db.query(models.Variant)
        .filter(models.Variant.product_id == product.id)
        .all()
    )

    if not variants:
        product.stock_quantity = 0
        return 0

    product.stock_quantity = sum(
        variant.stock_quantity
        for variant in variants
        if variant.is_active
    )

    return product.stock_quantity

def restore_stock(
    product: models.Product,
    quantity: int,
    db: Session,
    variant: models.Variant | None = None,
) -> None:
    if variant is not None:
        if variant.product_id != product.id:
            raise ValueError("Variant does not belong to this product")

        variant.stock_quantity += quantity
        sync_product_stock(product, db)
    else:
        product.stock_quantity += quantity