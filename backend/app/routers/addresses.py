from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas, models
from app.database import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/profile/addresses", tags=["addresses"])


@router.get("/", response_model=list[schemas.AddressResponse])
def get_addresses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    return crud.get_addresses_by_user(db, current_user.id)


@router.post("/", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
def create_address(
    address: schemas.AddressCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    return crud.create_address(db, current_user.id, address.model_dump())


@router.put("/{address_id}", response_model=schemas.AddressResponse)
def update_address(
    address_id: int,
    address: schemas.AddressUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    
    db_address = crud.get_address_by_id(db, address_id, current_user.id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    return crud.update_address(db, db_address, address.model_dump(exclude_unset=True))


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    from app import crud
    
    db_address = crud.get_address_by_id(db, address_id, current_user.id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    
    crud.delete_address(db, db_address)
    return None