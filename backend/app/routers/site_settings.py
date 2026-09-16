from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.dependencies import get_current_admin
from app.models import SiteInfo, FooterSection, User
from app.schemas import SiteInfoUpdate, FooterConfigPayload, SiteInfoResponse

router = APIRouter(prefix="/site-settings", tags=["site-settings"])

def get_or_create_info(db: Session) -> SiteInfo:
    info = db.query(SiteInfo).first()
    if not info:
        info = SiteInfo(
            site_title="موج",
            tagline="گالری نقره دست‌ساز",
            bio="طراحی و ساخت زیورآلات معاصر نقره با تضمین عیار ۹۲۵ استرلینگ و ضمانت همیشگی اصالت.",
            phone="۰۲۱-۱۲۳۴۵۶۷۸",
            whatsapp="۰۹۱۲۱۲۳۴۵۶۷",
            email="info@mowjgallery.com",
            instagram="mowj.silver",
            copyright_text="تمامی حقوق مادی و معنوی برای گالری موج محفوظ است.",
        )
        db.add(info)
        db.commit()
        db.refresh(info)
    return info

@router.get("/footer", response_model=FooterConfigPayload)
def get_footer_data(db: Session = Depends(get_db)):
    """Public unified endpoint: returns brand info + all active footer link columns in one call."""
    info = get_or_create_info(db)
    sections = (
        db.query(FooterSection)
        .filter(FooterSection.is_active == True)
        .options(joinedload(FooterSection.links))
        .order_by(FooterSection.sort_order.asc())
        .all()
    )
    return {
        "info": info,
        "sections": sections,
    }

@router.patch("/info", response_model=SiteInfoResponse)
def update_site_info(
    data: SiteInfoUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    info = get_or_create_info(db)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(info, key, val)
    db.commit()
    db.refresh(info)
    return info