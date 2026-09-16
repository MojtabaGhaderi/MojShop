from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database import get_db
from app.dependencies import get_current_admin
from app.models import (
    HomeSection,
    HomeSectionType,
    Product,
    ProductMaterial,
    MetalType,
    Category,
    Tag,
    User,
)
from app.schemas import (
    HomeSectionCreate,
    HomeSectionUpdate,
    HomeSectionResponse,
    HomeSectionFeedItem,
)

router = APIRouter(prefix="/home-sections", tags=["home-sections"])

def resolve_section_products(section: HomeSection, db: Session):
    query = (
        db.query(Product)
        .filter(Product.is_active == True)
        .options(
            joinedload(Product.images),
            joinedload(Product.category),
            joinedload(Product.materials),
            joinedload(Product.variants),
        )
    )

    if section.section_type == HomeSectionType.NEWEST:
        query = query.order_by(Product.created_at.desc())

    elif section.section_type == HomeSectionType.SILVER:
        query = (
            query.join(Product.materials)
            .filter(ProductMaterial.metal_type == MetalType.SILVER)
            .order_by(Product.created_at.desc())
        )

    elif section.section_type == HomeSectionType.CATEGORY:
        if section.filter_value:
            query = (
                query.join(Product.category)
                .filter(Category.slug == section.filter_value)
                .order_by(Product.created_at.desc())
            )

    elif section.section_type == HomeSectionType.TAG:
        if section.filter_value:
            query = (
                query.join(Product.tags)
                .filter(Tag.slug == section.filter_value)
                .order_by(Product.created_at.desc())
            )

    return query.limit(section.display_limit).all()

@router.get("/feed", response_model=List[HomeSectionFeedItem])
def get_home_feed(db: Session = Depends(get_db)):
    """Public endpoint: Returns active sections sorted by sort_order with hydrated products."""
    sections = (
        db.query(HomeSection)
        .filter(HomeSection.is_active == True)
        .order_by(HomeSection.sort_order.asc())
        .all()
    )

    feed = []
    for sec in sections:
        items = resolve_section_products(sec, db)
        if items:
            feed.append({
                "id": sec.id,
                "title": sec.title,
                "subtitle": sec.subtitle,
                "view_all_href": sec.view_all_href,
                "products": items,
            })
    return feed

# --- Admin CRUD ---

@router.get("/", response_model=List[HomeSectionResponse])
def list_sections(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    return db.query(HomeSection).order_by(HomeSection.sort_order.asc()).all()

@router.post("/", response_model=HomeSectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(data: HomeSectionCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    section = HomeSection(**data.model_dump())
    db.add(section)
    db.commit()
    db.refresh(section)
    return section

@router.patch("/{section_id}", response_model=HomeSectionResponse)
def update_section(section_id: int, data: HomeSectionUpdate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    section = db.query(HomeSection).filter(HomeSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(section, key, value)
    
    db.commit()
    db.refresh(section)
    return section

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):
    section = db.query(HomeSection).filter(HomeSection.id == section_id).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    db.delete(section)
    db.commit()
    return None