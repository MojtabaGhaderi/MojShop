from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.services.price_service import fetch_live_prices
from app.services.pricing import serialize_product

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import Category, Order, OrderStatus, Product, ProductImage, ProductMaterial, User, Variant, CartItem, Tag
from app.schemas import (
    AdminAnalytics,
    AdminUserUpdate,
    CategoryCreate,
    CategoryResponse,
    CategoryUpdate,
    OrderResponse,
    OrderStatusUpdate,
    PaginatedOrders,
    ProductCreate,
    ProductResponse,
    ProductStockResponse,
    ProductUpdate,
    UserResponse,
    ShippingRateResponse,
    ShippingRateCreate,
    VariantCreate,
    VariantUpdate,
    VariantResponse,
    TagCreate,
    TagResponse,
)

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)],  # every route below requires an admin
)

# Explicit allow-list of status transitions. Anything not listed is rejected.
ORDER_TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),   # terminal
    OrderStatus.CANCELLED: set(),   # terminal
}


# ============================== PRODUCTS ==============================


@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    products = (
        db.query(Product)
        .options(
            joinedload(Product.category),
            joinedload(Product.materials),
            joinedload(Product.images),
            joinedload(Product.variants),
            joinedload(Product.tags)
        )
        .order_by(Product.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    prices = await fetch_live_prices()
    return [serialize_product(p, prices) for p in products]


@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.query(Product).filter(Product.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="A product with this slug already exists")

    data = payload.model_dump(exclude={"materials", "images", "variants", "tag_ids"})
    product = Product(**data)
    product.materials = [ProductMaterial(**m.model_dump()) for m in payload.materials]
    product.images = [ProductImage(**i.model_dump()) for i in payload.images]

    if payload.tag_ids:
        product.tags = db.query(Tag).filter(Tag.id.in_(payload.tag_ids)).all() 

    db.add(product)
    db.commit()
    db.refresh(product)
    prices = await fetch_live_prices()
    return serialize_product(product, prices)


@router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = payload.model_dump(exclude_unset=True, exclude={"materials", "images", "variants", "tag_ids"})
    for field, value in update_data.items():
        setattr(product, field, value)

    if payload.materials is not None:
        product.materials = [ProductMaterial(**m.model_dump()) for m in payload.materials]
    if payload.images is not None:
        product.images = [ProductImage(**i.model_dump()) for i in payload.images]
    if payload.tag_ids is not None:
        product.tags = db.query(Tag).filter(Tag.id.in_(payload.tag_ids)).all()

    db.commit()
    db.refresh(product)
    prices = await fetch_live_prices()
    return serialize_product(product, prices)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_product(product_id: int, db: Session = Depends(get_db)):
    """Soft delete — flips is_active off. Order history references product data
    via OrderItem snapshots, not live FKs, so this is safe either way, but keeping
    the row lets you reactivate a seasonal product later without recreating it."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return None


@router.get("/tags", response_model=List[TagResponse])
def list_tags_admin(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()

@router.post("/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(payload: TagCreate, db: Session = Depends(get_db)):
    if db.query(Tag).filter(Tag.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="این برچسب از قبل وجود دارد")
    tag = Tag(**payload.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag

@router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    db.delete(tag)  # removing a Tag auto-clears its product_tags rows via the association table, no manual cleanup needed
    db.commit()
    return None

# ============================== CATEGORIES ==============================

@router.get("/categories", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.name).all()


@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    if db.query(Category).filter(Category.slug == payload.slug).first():
        raise HTTPException(status_code=400, detail="A category with this slug already exists")
    category = Category(**payload.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, payload: CategoryUpdate, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "slug" in update_data:
        clash = (
            db.query(Category)
            .filter(Category.slug == update_data["slug"], Category.id != category_id)
            .first()
        )
        if clash:
            raise HTTPException(status_code=400, detail="A category with this slug already exists")

    for field, value in update_data.items():
        setattr(category, field, value)

    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    in_use = db.query(Product).filter(Product.category_id == category_id).count()
    if in_use:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot delete: {in_use} product(s) still use this category. Reassign them first.",
        )

    db.delete(category)
    db.commit()
    return None


# ============================== ORDERS ==============================

@router.get("/orders", response_model=PaginatedOrders)
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    order_status: Optional[OrderStatus] = Query(None, alias="status"),
    user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Order).options(
        joinedload(Order.items), joinedload(Order.address), joinedload(Order.invoice)
    )
    if order_status:
        query = query.filter(Order.status == order_status)
    if user_id:                              
        query = query.filter(Order.user_id == user_id)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": orders}

@router.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items), joinedload(Order.address), joinedload(Order.invoice))
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, payload: OrderStatusUpdate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if payload.status != order.status:
        allowed_next = ORDER_TRANSITIONS.get(order.status, set())
        if payload.status not in allowed_next:
            allowed_str = ", ".join(s.value for s in allowed_next) or "none (terminal state)"
            raise HTTPException(
                status_code=400,
                detail=f"Cannot go from '{order.status.value}' to '{payload.status.value}'. "
                       f"Allowed next: {allowed_str}",
            )

    order.status = payload.status
    db.commit()
    db.refresh(order)
    return order

@router.get("/shipping-rates", response_model=List[ShippingRateResponse])
def list_shipping_rates(db: Session = Depends(get_db)):
    return db.query(ShippingRate).order_by(ShippingRate.city).all()

@router.post("/shipping-rates", response_model=ShippingRateResponse, status_code=status.HTTP_201_CREATED)
def create_shipping_rate(payload: ShippingRateCreate, db: Session = Depends(get_db)):
    if db.query(ShippingRate).filter(ShippingRate.city == payload.city).first():
        raise HTTPException(status_code=400, detail="نرخ ارسال برای این شهر قبلاً ثبت شده")
    rate = ShippingRate(**payload.model_dump())
    db.add(rate)
    db.commit()
    db.refresh(rate)
    return rate

@router.delete("/shipping-rates/{rate_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipping_rate(rate_id: int, db: Session = Depends(get_db)):
    rate = db.query(ShippingRate).filter(ShippingRate.id == rate_id).first()
    if not rate:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(rate)
    db.commit()
    return None


# ============================== USERS ==============================

@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
):
    return db.query(User).order_by(User.id.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_flags(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    if user_id == current_admin.id:
        if payload.is_admin is False:
            raise HTTPException(status_code=400, detail="You cannot remove your own admin access")
        if payload.is_active is False:
            raise HTTPException(status_code=400, detail="You cannot deactivate your own account")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


# ============================== ANALYTICS ==============================

@router.get("/analytics", response_model=AdminAnalytics)
def get_analytics(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    week_start = today_start - timedelta(days=today_start.weekday())
    month_start = datetime(now.year, now.month, 1)
    paid_statuses = [OrderStatus.PAID, OrderStatus.SHIPPED, OrderStatus.DELIVERED]

    def revenue_since(start: datetime) -> float:
        return (
            db.query(func.coalesce(func.sum(Order.total), 0.0))
            .filter(Order.status.in_(paid_statuses), Order.created_at >= start)
            .scalar()
        )

    low_stock_threshold = 5
    low_stock_products = (
        db.query(Product)
        .filter(Product.is_active == True, Product.stock_quantity <= low_stock_threshold)
        .order_by(Product.stock_quantity.asc())
        .limit(20)
        .all()
    )

    return {
        "revenue_today": revenue_since(today_start),
        "revenue_week": revenue_since(week_start),
        "revenue_month": revenue_since(month_start),
        "pending_orders": db.query(func.count(Order.id)).filter(Order.status == OrderStatus.PENDING).scalar(),
        "total_customers": db.query(func.count(User.id)).filter(User.is_admin == False).scalar(),
        "low_stock_products": low_stock_products,
        "low_stock_threshold": low_stock_threshold,
    }

@router.post("/products/{product_id}/variants", response_model=VariantResponse, status_code=status.HTTP_201_CREATED)
def create_variant(product_id: int, payload: VariantCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    variant = Variant(product_id=product_id, **payload.model_dump())
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.put("/variants/{variant_id}", response_model=VariantResponse)
def update_variant(variant_id: int, payload: VariantUpdate, db: Session = Depends(get_db)):
    variant = db.query(Variant).filter(Variant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)
    db.commit()
    db.refresh(variant)
    return variant


@router.delete("/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_variant(variant_id: int, db: Session = Depends(get_db)):
    variant = db.query(Variant).filter(Variant.id == variant_id).first()
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")

    # Cart lines referencing this variant would otherwise violate the FK constraint,
    # or (if we nulled variant_id instead) silently mis-price the item back to base.
    # Removing the stale cart line is the least-wrong option of the three.
    db.query(CartItem).filter(CartItem.variant_id == variant_id).delete()

    db.delete(variant)
    db.commit()
    return None