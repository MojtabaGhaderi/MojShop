from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

from app.models import MetalType, OrderStatus, InvoiceStatus, PromoType


# --- Category schemas ---

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- ProductMaterial schemas ---

class ProductMaterialCreate(BaseModel):
    metal_type: MetalType
    weight_grams: float = 0.0
    display_name: Optional[str] = None


class ProductMaterialResponse(BaseModel):
    id: int
    metal_type: MetalType
    weight_grams: float
    display_name: Optional[str] = None

    class Config:
        from_attributes = True


# --- ProductImage schemas ---

class ProductImageCreate(BaseModel):
    url: str
    alt_text: Optional[str] = None
    is_primary: bool = False
    sort_order: int = 0


class ProductImageResponse(BaseModel):
    id: int
    url: str
    alt_text: Optional[str] = None
    is_primary: bool
    sort_order: int

    class Config:
        from_attributes = True


# --- Product schemas ---

class ProductBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    base_price: float = Field(..., ge=0)
    total_weight_grams: float = 0.0
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True

class VariantCreate(BaseModel):
    variant_name: str
    sku: Optional[str] = None
    price_adjustment: float = 0.0
    stock_quantity: int = Field(default=0, ge=0)
    is_active: bool = True

class VariantUpdate(BaseModel):
    variant_name: Optional[str] = None
    sku: Optional[str] = None
    price_adjustment: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None

class VariantResponse(BaseModel):
    id: int
    variant_name: str
    sku: Optional[str] = None
    price_adjustment: float
    stock_quantity: int
    is_active: bool
    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    materials: List[ProductMaterialCreate] = []
    images: List[ProductImageCreate] = []
    variants: List[VariantCreate] = []
    tag_ids: List[int] = []



class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    base_price: Optional[float] = None
    total_weight_grams: Optional[float] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None
    materials: Optional[List[ProductMaterialCreate]] = None
    images: Optional[List[ProductImageCreate]] = None
    variants: Optional[List[VariantCreate]] = None
    tag_ids: Optional[List[int]] = None


class TagCreate(BaseModel):
    name: str
    slug: str

class TagResponse(BaseModel):
    id: int
    name: str
    slug: str
    class Config:
        from_attributes = True

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None
    materials: List[ProductMaterialResponse]
    images: List[ProductImageResponse]
    current_price: float = 0.0
    created_at: datetime
    variants: List[VariantResponse] = []
    average_rating: float = 0.0
    review_count: int = 0  
    tags: List[TagResponse] = []

    class Config:
        from_attributes = True


# --- User schemas ---

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=72)
    phone: str = Field(..., min_length=10, max_length=20)



class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(None, min_length=6, max_length=72)


class UserResponse(UserBase):
    id: int
    phone: Optional[str] = None
    is_admin: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# --- Address schemas ---

class AddressBase(BaseModel):
    label: Optional[str] = None
    line_1: str
    line_2: Optional[str] = None
    city: str
    postal_code: str
    country: str = "Iran"
    is_default: bool = False


class AddressCreate(AddressBase):
    pass


class AddressUpdate(BaseModel):
    label: Optional[str] = None
    line_1: Optional[str] = None
    line_2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    is_default: Optional[bool] = None


class AddressResponse(AddressBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- CartItem schemas ---

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemCreate(CartItemBase):
    variant_id: Optional[int] = None



class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product: ProductResponse
    variant: Optional[VariantResponse] = None
    quantity: int
    unit_price: float
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True


# --- OrderItem schemas ---

class OrderItemResponse(BaseModel):
    id: int
    product_name: str
    product_slug: str
    unit_price: float
    quantity: int
    materials_snapshot: Optional[list|dict] = None
    image_url: Optional[str] = None
    variant_name: Optional[str] = None


    class Config:
        from_attributes = True



# --- Invoice schemas ---

class InvoiceResponse(BaseModel):
    id: int
    order_id: int
    invoice_number: str
    pdf_url: Optional[str] = None
    status: InvoiceStatus
    created_at: datetime

    class Config:
        from_attributes = True



# --- Order schemas ---

class OrderBase(BaseModel):
    address_id: int


class OrderCreate(OrderBase):
    promo_code: Optional[str] = None


class OrderResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    address: AddressResponse
    status: OrderStatus
    items: List[OrderItemResponse]
    invoice: Optional[InvoiceResponse] = None
    subtotal: float
    discount_amount: float = 0.0
    shipping_cost: float
    tax: float
    total: float
    created_at: datetime
    updated_at: datetime
    class Config:
        from_attributes = True



# --- Guest checkout schemas ---

class GuestAddressInput(BaseModel):
    label: Optional[str] = None
    line_1: str
    line_2: Optional[str] = None
    city: str
    postal_code: str
    country: str = "Iran"


class GuestOrderItemInput(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = Field(..., ge=1)


class GuestOrderCreate(BaseModel):
    guest_email: EmailStr
    guest_name: str
    address: GuestAddressInput
    items: List[GuestOrderItemInput] = Field(..., min_length=1)
    promo_code: Optional[str] = None
    
# --- Admin schemas ---

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class PaginatedOrders(BaseModel):
    total: int
    items: List[OrderResponse]


class ProductStockResponse(BaseModel):
    id: int
    name: str
    slug: str
    stock_quantity: int

    class Config:
        from_attributes = True


class AdminAnalytics(BaseModel):
    revenue_today: float
    revenue_week: float
    revenue_month: float
    pending_orders: int
    total_customers: int
    low_stock_products: List[ProductStockResponse]
    low_stock_threshold: int


class ShippingRateCreate(BaseModel):
    city: str
    cost: float = Field(..., ge=0)

class ShippingRateResponse(BaseModel):
    id: int
    city: str
    cost: float
    class Config:
        from_attributes = True

# --- Auth schemas ---

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


# --- Payment schemas ---

class PaymentCreateRequest(BaseModel):
    order_id: int


class PaymentCreateResponse(BaseModel):
    payment_url: str
    authority: str


class PaymentVerifyRequest(BaseModel):
    order_id: int
    authority: str


class PaymentVerifyResponse(BaseModel):
    status: str  # "success" | "failed"
    ref_id: Optional[str] = None
    order_status: OrderStatus
    message: Optional[str] = None


# --- Promo schemas ---

class PromoCodeCreate(BaseModel):
    code: str
    type: PromoType
    amount: float = Field(..., gt=0)
    expires_at: Optional[datetime] = None
    usage_limit: Optional[int] = Field(None, gt=0)


class PromoCodeResponse(BaseModel):
    id: int
    code: str
    type: PromoType
    amount: float
    expires_at: Optional[datetime] = None
    usage_limit: Optional[int] = None
    used_count: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PromoValidateRequest(BaseModel):
    code: str
    subtotal: float = Field(..., ge=0)


class PromoValidateResponse(BaseModel):
    valid: bool
    discount_amount: float = 0.0
    message: Optional[str] = None
# --- Reviews ---

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None

class ReviewUserResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    class Config:
        from_attributes = True

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user: ReviewUserResponse
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# --- Wishlist ---

class WishlistAdd(BaseModel):
    product_id: int

class WishlistItemResponse(BaseModel):
    id: int
    product: ProductResponse
    created_at: datetime
    class Config:
        from_attributes = True


class StockNotifyRequest(BaseModel):
    email: EmailStr
