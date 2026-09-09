import datetime
import enum

from sqlalchemy import ForeignKey, String, Text, Float, Integer, Boolean, DateTime, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MetalType(str, enum.Enum):
    GOLD = "gold"
    SILVER = "silver"
    PLATINUM = "platinum"
    PALLADIUM = "palladium"
    NONE = "none"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class InvoiceStatus(str, enum.Enum):
    PENDING = "pending"
    GENERATED = "generated"
    SENT = "sent"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    
    category_id: Mapped[int | None] = mapped_column(ForeignKey("categories.id"), nullable=True)
    category: Mapped["Category"] = relationship(back_populates="products")
    
    base_price: Mapped[float] = mapped_column(Float, nullable=False)
    total_weight_grams: Mapped[float] = mapped_column(default=0.0)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    variants: Mapped[list["Variant"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    
    materials: Mapped[list["ProductMaterial"]] = relationship(back_populates="product", cascade="all, delete-orphan")
    images: Mapped[list["ProductImage"]] = relationship(back_populates="product", cascade="all, delete-orphan")


class ProductMaterial(Base):
    __tablename__ = "product_materials"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product: Mapped["Product"] = relationship(back_populates="materials")
    
    metal_type: Mapped[MetalType] = mapped_column(Enum(MetalType), default=MetalType.NONE)
    weight_grams: Mapped[float] = mapped_column(default=0.0)
    display_name: Mapped[str | None] = mapped_column(String(100))


class ProductImage(Base):
    __tablename__ = "product_images"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product: Mapped["Product"] = relationship(back_populates="images")
    
    url: Mapped[str] = mapped_column(String(500), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(255))
    is_primary: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(20))
    is_admin: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    addresses: Mapped[list["Address"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    cart_items: Mapped[list["CartItem"]] = relationship(back_populates="user", cascade="all, delete-orphan")

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
    back_populates="user", cascade="all, delete-orphan")

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

    # Store only the hash of the opaque token
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    revoked_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    # For rotation chain / reuse detection
    replaced_by_id: Mapped[int | None] = mapped_column(ForeignKey("refresh_tokens.id"), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    # Optional metadata
    user_agent: Mapped[str | None] = mapped_column(String(255))
    ip_address: Mapped[str | None] = mapped_column(String(45))

class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="addresses")
    
    label: Mapped[str | None] = mapped_column(String(50))
    line_1: Mapped[str] = mapped_column(String(255), nullable=False)
    line_2: Mapped[str | None] = mapped_column(String(255))
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="Iran")
    is_default: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship(back_populates="cart_items")
    
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product: Mapped["Product"] = relationship()
    
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    variant_id: Mapped[int | None] = mapped_column(ForeignKey("variants.id"), nullable=True)
    variant: Mapped["Variant"] = relationship()

class Variant(Base):
    __tablename__ = "variants"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    product: Mapped["Product"] = relationship(back_populates="variants")

    variant_name: Mapped[str] = mapped_column(String(100), nullable=False)
    sku: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    price_adjustment: Mapped[float] = mapped_column(Float, default=0.0)
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    user: Mapped["User"] = relationship(back_populates="orders")

    guest_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    guest_name: Mapped[str | None] = mapped_column(String(100), nullable=True) 
    
    address_id: Mapped[int] = mapped_column(ForeignKey("addresses.id"))
    address: Mapped["Address"] = relationship()
    
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    shipping_cost: Mapped[float] = mapped_column(Float, default=0.0)
    tax: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    invoice: Mapped["Invoice"] = relationship(back_populates="order", uselist=False, cascade="all, delete-orphan")

    promo_code_id: Mapped[int | None] = mapped_column(ForeignKey("promo_codes.id"), nullable=True)
    promo_code: Mapped["PromoCode"] = relationship()
    discount_amount: Mapped[float] = mapped_column(Float, default=0.0)

    payment: Mapped["Payment"] = relationship(back_populates="order", uselist=False, cascade="all, delete-orphan")

    reserved_until: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    order: Mapped["Order"] = relationship(back_populates="items")
    
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_slug: Mapped[str] = mapped_column(String(255), nullable=False)
    unit_price: Mapped[float] = mapped_column(Float, nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    materials_snapshot: Mapped[dict | None] = mapped_column(JSON)
    image_url: Mapped[str | None] = mapped_column(String(500))

    variant_name: Mapped[str | None] = mapped_column(String(100), nullable=True)


class Invoice(Base):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"), unique=True)
    order: Mapped["Order"] = relationship(back_populates="invoice")
    
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    pdf_url: Mapped[str | None] = mapped_column(String(500))
    status: Mapped[InvoiceStatus] = mapped_column(Enum(InvoiceStatus), default=InvoiceStatus.PENDING)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"


class PromoType(str, enum.Enum):
    PERCENT = "percent"
    FIXED = "fixed"


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id"))
    order: Mapped["Order"] = relationship(back_populates="payment")

    gateway: Mapped[str] = mapped_column(String(50), default="zarinpal")
    authority: Mapped[str | None] = mapped_column(String(100), unique=True, index=True, nullable=True)
    ref_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)  # Toman, matches Order.total
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    verified_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    type: Mapped[PromoType] = mapped_column(Enum(PromoType), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)  # percent (0-100) or fixed Toman amount
    expires_at: Mapped[datetime.datetime | None] = mapped_column(DateTime, nullable=True)
    usage_limit: Mapped[int | None] = mapped_column(Integer, nullable=True)
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class ShippingRate(Base):
    __tablename__ = "shipping_rates"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    city: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)