from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app import models


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
    skip: int = 0,
    limit: int = 100,
):
    query = (
        db.query(models.Product)
        .options(
            joinedload(models.Product.category),
            joinedload(models.Product.materials),
            joinedload(models.Product.images),
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
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            models.Product.name.ilike(search_term)
            | models.Product.description.ilike(search_term)
        )
    
    return query.offset(skip).limit(limit).all()


def get_product_by_slug(db: Session, slug: str):
    return (
        db.query(models.Product)
        .options(
            joinedload(models.Product.category),
            joinedload(models.Product.materials),
            joinedload(models.Product.images),
        )
        .filter(models.Product.slug == slug, models.Product.is_active == True)
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
        .options(joinedload(models.CartItem.product).joinedload(models.Product.images))
        .filter(models.CartItem.user_id == user_id)
        .all()
    )


def get_cart_item_by_product(db: Session, user_id: int, product_id: int):
    return db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id,
        models.CartItem.product_id == product_id
    ).first()


def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int):
    existing = get_cart_item_by_product(db, user_id, product_id)
    if existing:
        existing.quantity += quantity
        db.commit()
        db.refresh(existing)
        return existing
    
    db_item = models.CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
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

def create_order(db: Session, user_id: int, address_id: int, cart_items: list):
    # Calculate totals
    subtotal = 0.0
    order_items_data = []
    
    for item in cart_items:
        product = item.product
        # Get current price
        from app.services.price_service import fetch_live_prices
        import asyncio
        prices = asyncio.run(fetch_live_prices())
        
        current_price = product.base_price
        for mat in product.materials:
            if mat.metal_type.value != "none":
                rate = prices.get(f"{mat.metal_type.value}_per_gram", 0)
                current_price += mat.weight_grams * rate
        
        unit_price = round(current_price, 2)
        line_total = unit_price * item.quantity
        subtotal += line_total
        
        # Snapshot materials
        materials_snapshot = [
            {"metal_type": m.metal_type.value, "weight_grams": m.weight_grams, "display_name": m.display_name}
            for m in product.materials
        ]
        
        primary_image = next((img.url for img in product.images if img.is_primary), None)
        
        order_items_data.append({
            "product_name": product.name,
            "product_slug": product.slug,
            "unit_price": unit_price,
            "quantity": item.quantity,
            "materials_snapshot": materials_snapshot,
            "image_url": primary_image,
        })
    
    shipping_cost = 0.0  # TODO: calculate based on weight/destination
    tax = 0.0  # TODO: calculate tax
    total = subtotal + shipping_cost + tax
    
    db_order = models.Order(
        user_id=user_id,
        address_id=address_id,
        status=models.OrderStatus.PENDING,
        subtotal=round(subtotal, 2),
        shipping_cost=shipping_cost,
        tax=tax,
        total=round(total, 2),
    )
    db.add(db_order)
    db.flush()
    
    for item_data in order_items_data:
        db.add(models.OrderItem(order_id=db_order.id, **item_data))
    
    # Clear cart
    db.query(models.CartItem).filter(models.CartItem.user_id == user_id).delete()
    
    # Generate invoice number
    invoice_number = f"INV-{db_order.id:06d}"
    db.add(models.Invoice(
        order_id=db_order.id,
        invoice_number=invoice_number,
        status=models.InvoiceStatus.PENDING,
    ))
    
    db.commit()
    db.refresh(db_order)
    return db.query(models.Order).options(
        joinedload(models.Order.address),
        joinedload(models.Order.items),
        joinedload(models.Order.invoice),
    ).filter(models.Order.id == db_order.id).first()


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