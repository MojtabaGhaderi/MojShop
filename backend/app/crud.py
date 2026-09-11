from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_

from app import models

from fastapi import HTTPException, status
from app.services.pricing import compute_current_price


from datetime import datetime, timedelta
from app.services.promo_service import find_valid_promo
from app.services.shipping_service import calculate_shipping_cost
from app.services.inventory import restore_stock

from app.services.inventory import sync_product_stock
RESERVATION_MINUTES = 15


# --- Categories ---

def get_categories(db: Session):
    return db.query(models.Category).filter(models.Category.is_active == True).all()


def get_category_by_slug(db: Session, slug: str):
    return db.query(models.Category).filter(models.Category.slug == slug).first()


def create_category(db: Session, category_data: dict):
    db_category = models.Category(**category_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category: models.Category, update_data: dict):
    for field, value in update_data.items():
        if value is not None:
            setattr(category, field, value)
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: models.Category):
    db.query(models.Product).filter(
        models.Product.category_id == category.id
    ).update({"category_id": None})
    
    db.delete(category)
    db.commit()
    return category


# --- Products ---

def get_products(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Product)
        .options(
            joinedload(models.Product.category),
            joinedload(models.Product.materials),
            joinedload(models.Product.images),
            joinedload(models.Product.tags),
            joinedload(models.Product.variants),
        )
        .filter(models.Product.is_active == True)
        .offset(skip)
        .limit(limit)
        .all()
    )
    


def get_products_filtered(
    db: Session,
    category_slug: str | None = None,
    metal_type: str | None = None,
    search: str | None = None,
    tags: str | None = None,
    skip: int = 0,
    limit: int = 100,
):
    query = (
        db.query(models.Product)
        .options(
            joinedload(models.Product.category),
            joinedload(models.Product.materials),
            joinedload(models.Product.images),
            joinedload(models.Product.tags),
            joinedload(models.Product.variants),
        )
        .filter(models.Product.is_active == True)
    )
    
    if category_slug:
        query = query.join(models.Category).filter(
            models.Category.slug == category_slug
        )
    
    if metal_type:
        query = query.join(models.ProductMaterial).filter(
            models.ProductMaterial.metal_type == metal_type
        )
    
    if tags:
        tag_slugs = [t.strip() for t in tags.split(",") if t.strip()]

        if tag_slugs:
            query = (
                query
                .join(models.Product.tags)
                .filter(models.Tag.slug.in_(tag_slugs))
            )

    query = _apply_search_filter(query, search)

    query = query.distinct()

    query = _apply_search_filter(query, search)
    if search:
        query = query.order_by(func.similarity(models.Product.name, search).desc())
    
    return query.offset(skip).limit(limit).all()


def get_products_count(
    db: Session,
    category_slug: str | None = None,
    metal_type: str | None = None,
    search: str | None = None,
    tags: str | None = None,
) -> int:
    query = db.query(models.Product).filter(models.Product.is_active == True)

    if category_slug:
        query = query.join(models.Category).filter(
            models.Category.slug == category_slug
        )

    if metal_type:
        query = query.join(models.ProductMaterial).filter(
            models.ProductMaterial.metal_type == metal_type
        )
    if tags:
        tag_slugs = [t.strip() for t in tags.split(",") if t.strip()]

        if tag_slugs:
            query = (
                query
                .join(models.Product.tags)
                .filter(models.Tag.slug.in_(tag_slugs))
            )

    query = _apply_search_filter(query, search)

    return query.distinct().count()

def get_product_review_stats(db: Session, product_id: int) -> tuple[float, int]:
    avg, count = db.query(
        func.coalesce(func.avg(models.Review.rating), 0.0),
        func.count(models.Review.id),
    ).filter(models.Review.product_id == product_id).first()
    return (round(avg, 1) if avg else 0.0, count or 0)

def get_product_by_slug(db: Session, slug: str):
    return (
        db.query(models.Product)
        .options(
            joinedload(models.Product.category),
            joinedload(models.Product.materials),
            joinedload(models.Product.images),
            joinedload(models.Product.tags),
            joinedload(models.Product.variants),
        )
        .filter(
            models.Product.slug == slug,
            models.Product.is_active == True,
        )
        .first()
    )


def create_product(db: Session, product_data: dict):
    materials_data = product_data.pop("materials", [])
    images_data = product_data.pop("images", [])
    
    db_product = models.Product(**product_data)
    db.add(db_product)
    db.flush()
    
    for mat in materials_data:
        db.add(models.ProductMaterial(product_id=db_product.id, **mat))
    
    for img in images_data:
        db.add(models.ProductImage(product_id=db_product.id, **img))
    
    db.commit()
    db.refresh(db_product)
    return db_product


def update_product(db: Session, product: models.Product, update_data: dict):
    materials_data = update_data.pop("materials", None)
    images_data = update_data.pop("images", None)
    
    for field, value in update_data.items():
        if value is not None:
            setattr(product, field, value)
    
    if materials_data is not None:
        db.query(models.ProductMaterial).filter(
            models.ProductMaterial.product_id == product.id
        ).delete()
        for mat in materials_data:
            db.add(models.ProductMaterial(product_id=product.id, **mat))
    
    if images_data is not None:
        db.query(models.ProductImage).filter(
            models.ProductImage.product_id == product.id
        ).delete()
        for img in images_data:
            db.add(models.ProductImage(product_id=product.id, **img))
    
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: models.Product):
    product.is_active = False
    db.commit()
    db.refresh(product)
    return product


# --- Users ---

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user: models.User, update_data: dict):
    for field, value in update_data.items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


# --- Addresses ---

def get_addresses_by_user(db: Session, user_id: int):
    return db.query(models.Address).filter(models.Address.user_id == user_id).all()


def get_address_by_id(db: Session, address_id: int, user_id: int):
    return db.query(models.Address).filter(
        models.Address.id == address_id,
        models.Address.user_id == user_id
    ).first()


def create_address(db: Session, user_id: int, address_data: dict):
    if address_data.get("is_default"):
        db.query(models.Address).filter(
            models.Address.user_id == user_id
        ).update({"is_default": False})
    
    db_address = models.Address(user_id=user_id, **address_data)
    db.add(db_address)
    db.commit()
    db.refresh(db_address)
    return db_address


def update_address(db: Session, address: models.Address, update_data: dict):
    if update_data.get("is_default"):
        db.query(models.Address).filter(
            models.Address.user_id == address.user_id,
            models.Address.id != address.id
        ).update({"is_default": False})
    
    for field, value in update_data.items():
        if value is not None:
            setattr(address, field, value)
    db.commit()
    db.refresh(address)
    return address


def delete_address(db: Session, address: models.Address):
    db.delete(address)
    db.commit()
    return address


# --- Cart Items ---

def get_cart_items(db: Session, user_id: int):
    return (
        db.query(models.CartItem)
        .options(
            joinedload(models.CartItem.product).joinedload(
                models.Product.images
            ),
            joinedload(models.CartItem.product).joinedload(
                models.Product.materials
            ),
            joinedload(models.CartItem.variant),
        )
        .filter(models.CartItem.user_id == user_id)
        .all()
    )

def get_cart_item_by_id(db: Session, user_id: int, cart_item_id: int):
    return db.query(models.CartItem).filter(
        models.CartItem.id == cart_item_id,
        models.CartItem.user_id == user_id,
    ).first()

def _find_existing_cart_line(db: Session, user_id: int, product_id: int, variant_id: int | None):
    """Internal only — used by add_to_cart to decide merge-vs-create. Never exposed as a route param."""
    return db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == product_id,
        models.CartItem.variant_id == variant_id,
    ).first()

def get_cart_item_by_product(db: Session, user_id: int, product_id: int):
    return db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == product_id
    ).first()


def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int, variant_id: int | None = None):
    existing = _find_existing_cart_line(db, user_id, product_id, variant_id)
    if existing:
        existing.quantity += quantity
        db.commit()
        db.refresh(existing)
        return existing

    db_item = models.CartItem(user_id=user_id, product_id=product_id, quantity=quantity, variant_id=variant_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item



def update_cart_item(db: Session, cart_item: models.CartItem, quantity: int):
    cart_item.quantity = quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


def delete_cart_item(db: Session, cart_item: models.CartItem):
    db.delete(cart_item)
    db.commit()
    return cart_item


def clear_cart(db: Session, user_id: int):
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    db.commit()


# --- Orders ---

def _build_order_items(
    entries: list[tuple],
    prices: dict,
    db: Session,
):
    """
    entries: list of (product, variant, quantity) tuples.

    For products with variants, variant stock is authoritative.
    For products without variants, product stock is authoritative.
    """
    subtotal = 0.0
    order_items_data = []
    affected_products = {}

    for product, variant, quantity in entries:
        if not product or not product.is_active:
            raise ValueError(
                f"Product unavailable: {getattr(product, 'id', '?')}"
            )

        # Variant validation
        if variant is not None:
            if variant.product_id != product.id:
                raise ValueError(
                    f"Variant does not belong to product {product.id}"
                )

            if not variant.is_active:
                raise ValueError(
                    f"Variant unavailable: {variant.variant_name}"
                )

            if variant.stock_quantity < quantity:
                raise ValueError(
                    f"Insufficient stock for {product.name} "
                    f"({variant.variant_name})"
                )

        # Non-variant product
        elif product.variants:
            raise ValueError(
                f"Variant selection required for {product.name}"
            )

        else:
            if product.stock_quantity < quantity:
                raise ValueError(
                    f"Insufficient stock for {product.name}"
                )

        # Base product price + variant adjustment
        unit_price = compute_current_price(product, prices)

        if variant is not None:
            unit_price = round(
                unit_price + variant.price_adjustment,
                2,
            )

        subtotal += unit_price * quantity

        materials_snapshot = [
            {
                "metal_type": m.metal_type.value,
                "weight_grams": m.weight_grams,
                "display_name": m.display_name,
            }
            for m in product.materials
        ]

        primary_image = next(
            (img.url for img in product.images if img.is_primary),
            None,
        )

        if primary_image is None and product.images:
            primary_image = product.images[0].url

        order_items_data.append({
            "product_name": product.name,
            "product_slug": product.slug,
            "unit_price": unit_price,
            "quantity": quantity,
            "materials_snapshot": materials_snapshot,
            "image_url": primary_image,
            "variant_id": variant.id if variant else None,
            "variant_name": variant.variant_name if variant else None,
        })

        # Deduct from the authoritative inventory source.
        if variant is not None:
            variant.stock_quantity -= quantity
            affected_products[product.id] = product
        else:
            product.stock_quantity -= quantity

    # Keep Product.stock_quantity synchronized with variant stock.
    for product in affected_products.values():
        sync_product_stock(product, db)

    return order_items_data, round(subtotal, 2)

def release_expired_reservations(db: Session):
    """
    Lazy sweep — call this at the start of any endpoint where a stale hold
    would otherwise block a real customer.

    Restores stock to the correct inventory source and cancels the order.
    """

    expired = (
        db.query(models.Order)
        .options(joinedload(models.Order.items))
        .filter(
            models.Order.status == models.OrderStatus.PENDING,
            models.Order.reserved_until < datetime.utcnow(),
        )
        .all()
    )

    for order in expired:
        for item in order.items:
            product = (
                db.query(models.Product)
                .filter(
                    models.Product.slug == item.product_slug
                )
                .first()
            )

            if not product:
                continue

            variant = None

            if item.variant_id is not None:
                variant = (
                    db.query(models.Variant)
                    .filter(
                        models.Variant.id == item.variant_id
                    )
                    .first()
                )

            restore_stock(
                product=product,
                quantity=item.quantity,
                db=db,
                variant=variant,
            )

        order.status = models.OrderStatus.CANCELLED

    if expired:
        db.commit()

async def create_order(db: Session, user_id: int, address_id: int, cart_items: list, promo_code: str | None = None):
    from app.services.price_service import fetch_live_prices
    release_expired_reservations(db)

    address = db.query(models.Address).filter(models.Address.id == address_id).first()
    prices = await fetch_live_prices()
    entries = [
    (item.product, item.variant, item.quantity)
    for item in cart_items
    ]

    order_items_data, subtotal = _build_order_items(entries, prices,db)

    shipping_cost = calculate_shipping_cost(db, address.city)

    promo, discount_amount, promo_error = (None, 0.0, None)
    if promo_code:
        promo, discount_amount, promo_error = find_valid_promo(db, promo_code, subtotal)
        if promo_error:
            raise ValueError(promo_error)

    tax = 0.0
    total = max(subtotal + shipping_cost + tax - discount_amount, 0.0)

    db_order = models.Order(
        user_id=user_id, address_id=address_id, status=models.OrderStatus.PENDING,
        subtotal=subtotal, shipping_cost=shipping_cost, tax=tax,
        discount_amount=discount_amount, promo_code_id=promo.id if promo else None,
        total=round(total, 2),
        reserved_until=datetime.utcnow() + timedelta(minutes=RESERVATION_MINUTES),
    )
    db.add(db_order)
    db.flush()
    for item_data in order_items_data:
        db.add(models.OrderItem(order_id=db_order.id, **item_data))
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    db.add(models.Invoice(order_id=db_order.id, invoice_number=f"INV-{db_order.id:06d}", status=models.InvoiceStatus.PENDING))
    if promo:
        promo.used_count += 1
    db.commit()

    return (
        db.query(models.Order)
        .options(joinedload(models.Order.address), joinedload(models.Order.items), joinedload(models.Order.invoice))
        .filter(models.Order.id == db_order.id)
        .first()
    )


async def create_guest_order(db: Session, guest_email: str, guest_name: str, address_data: dict, items: list[dict], promo_code: str | None = None):
    from app.services.price_service import fetch_live_prices
    release_expired_reservations(db)

    prices = await fetch_live_prices()
    entries = []

    for entry in items:
        product = (
            db.query(models.Product)
            .options(
                joinedload(models.Product.materials),
                joinedload(models.Product.images),
            )
            .filter(models.Product.id == entry["product_id"])
            .first()
        )

        variant = None

        if entry.get("variant_id") is not None:
            variant = (
                db.query(models.Variant)
                .filter(
                    models.Variant.id == entry["variant_id"],
                    models.Variant.product_id == entry["product_id"],
                )
                .first()
            )

            if not variant:
                raise ValueError(
                    f"Variant not found: {entry['variant_id']}"
                )

        entries.append(
            (product, variant, entry["quantity"])
        )

    order_items_data, subtotal = _build_order_items(entries, prices)
    shipping_cost = calculate_shipping_cost(db, address_data["city"])

    promo, discount_amount, promo_error = (None, 0.0, None)
    if promo_code:
        promo, discount_amount, promo_error = find_valid_promo(db, promo_code, subtotal)
        if promo_error:
            raise ValueError(promo_error)

    tax = 0.0
    total = max(subtotal + shipping_cost + tax - discount_amount, 0.0)

    address = models.Address(user_id=None, **address_data)
    db.add(address)
    db.flush()

    db_order = models.Order(
        user_id=None, address_id=address.id, guest_email=guest_email, guest_name=guest_name,
        status=models.OrderStatus.PENDING, subtotal=subtotal, shipping_cost=shipping_cost, tax=tax,
        discount_amount=discount_amount, promo_code_id=promo.id if promo else None,
        total=round(total, 2),
        reserved_until=datetime.utcnow() + timedelta(minutes=RESERVATION_MINUTES),
    )
    db.add(db_order)
    db.flush()
    for item_data in order_items_data:
        db.add(models.OrderItem(order_id=db_order.id, **item_data))
    db.add(models.Invoice(order_id=db_order.id, invoice_number=f"INV-{db_order.id:06d}", status=models.InvoiceStatus.PENDING))
    if promo:
        promo.used_count += 1
    db.commit()

    return (
        db.query(models.Order)
        .options(joinedload(models.Order.address), joinedload(models.Order.items), joinedload(models.Order.invoice))
        .filter(models.Order.id == db_order.id)
        .first()
    )

def get_guest_order(db: Session, order_id: int, guest_email: str):
    return (
        db.query(models.Order)
        .options(joinedload(models.Order.address), joinedload(models.Order.items), joinedload(models.Order.invoice))
        .filter(models.Order.id == order_id, models.Order.guest_email == guest_email)
        .first()
    )

def cancel_order(db: Session, order_id: int, user_id: int):
    """
    Cancel order and restore stock. Users can cancel pending orders.
    """
    order = db.query(models.Order).filter(
        models.Order.id == order_id,
        models.Order.user_id == user_id,
        models.Order.status == models.OrderStatus.PENDING
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found or cannot be cancelled"
        )
    
    # Restore stock
    variant = None

    if item.variant_id is not None:
        variant = (
            db.query(models.Variant)
            .filter(models.Variant.id == item.variant_id)
            .first()
        )

    restore_stock(
        product=product,
        quantity=item.quantity,
        variant=variant,
        db=db,
    )
    
    order.status = models.OrderStatus.CANCELLED
    db.commit()
    db.refresh(order)
    return order


def get_orders_by_user(db: Session, user_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.address),
            joinedload(models.Order.items),
            joinedload(models.Order.invoice),
        )
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )


def get_order_by_id(db: Session, order_id: int, user_id: int):
    return (
        db.query(models.Order)
        .options(
            joinedload(models.Order.address),
            joinedload(models.Order.items),
            joinedload(models.Order.invoice),
        )
        .filter(models.Order.id == order_id, models.Order.user_id == user_id)
        .first()
    )

def _apply_search_filter(query, search: str | None):
    """Shared by get_products_filtered and get_products_count so they can never drift
    out of sync with each other (the earlier admin-price-bug class of mistake)."""
    if not search:
        return query
    terms = search.split()
    conditions = []
    for term in terms:
        term_ilike = f"%{term}%"
        conditions.append(
            or_(
                models.Product.name.ilike(term_ilike),
                models.Product.description.ilike(term_ilike),
                func.similarity(models.Product.name, term) > 0.2,
                func.similarity(models.Product.description, term) > 0.2,
            )
        )
    return query.filter(*conditions)  # every word must match somewhere — real multi-word search