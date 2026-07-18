from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas, models
from app.database import get_db
from app.dependencies import get_current_admin

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("/", response_model=List[schemas.CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return crud.get_categories(db)


@router.post("/", response_model=schemas.CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    existing = crud.get_category_by_slug(db, category.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Category with this slug already exists")
    return crud.create_category(db, category.model_dump())


@router.put("/{slug}", response_model=schemas.CategoryResponse)
def update_category(
    slug: str,
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    db_category = crud.get_category_by_slug(db, slug)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if category.slug != slug:
        existing = crud.get_category_by_slug(db, category.slug)
        if existing:
            raise HTTPException(status_code=400, detail="Category with this slug already exists")
    
    return crud.update_category(db, db_category, category.model_dump())


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    slug: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(get_current_admin),
):
    db_category = crud.get_category_by_slug(db, slug)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    crud.delete_category(db, db_category)
    return None