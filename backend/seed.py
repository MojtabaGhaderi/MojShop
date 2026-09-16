from app.database import SessionLocal
from app.models import FooterSection, FooterLink

db = SessionLocal()
if db.query(FooterSection).count() == 0:
    sec1 = FooterSection(title="مجموعه‌ها", sort_order=0)
    sec2 = FooterSection(title="خدمات و قوانین", sort_order=1)
    db.add_all([sec1, sec2])
    db.flush()

    links = [
        FooterLink(section_id=sec1.id, label="همه محصولات", href="/products", sort_order=0),
        FooterLink(section_id=sec1.id, label="انگشتر نقره", href="/products?category=rings", sort_order=1),
        FooterLink(section_id=sec1.id, label="گردنبند و آویز", href="/products?category=necklaces", sort_order=2),
        FooterLink(section_id=sec1.id, label="دستبند", href="/products?category=bracelets", sort_order=3),
        FooterLink(section_id=sec2.id, label="راهنمای تعیین سایز", href="/sizing-guide", sort_order=0),
        FooterLink(section_id=sec2.id, label="شرایط ارسال و بازگشت", href="/shipping-returns", sort_order=1),
        FooterLink(section_id=sec2.id, label="اصالت و نگهداری نقره", href="/silver-care", sort_order=2),
        FooterLink(section_id=sec2.id, label="درباره موج", href="/about", sort_order=3),
    ]
    db.add_all(links)
    db.commit()
db.close()