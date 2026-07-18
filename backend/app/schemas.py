from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime

from app.models import MetalType, OrderStatus, InvoiceStatus


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


class ProductCreate(ProductBase):
    materials: List[ProductMaterialCreate] = []
    images: List[ProductImageCreate] = []


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


class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse] = None
    materials: List[ProductMaterialResponse]
    images: List[ProductImageResponse]
    current_price: float = 0.0
    created_at: datetime

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
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# --- CartItem schemas ---

class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product: ProductResponse
    quantity: int
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
    pass


class OrderResponse(BaseModel):
    id: int
    user_id: int
    address: AddressResponse
    status: OrderStatus
    items: List[OrderItemResponse]
    invoice: Optional[InvoiceResponse] = None
    subtotal: float
    shipping_cost: float
    tax: float
    total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Auth schemas ---

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None