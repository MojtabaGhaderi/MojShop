from sqlalchemy.orm import Session
from app import models
from app.services.email_service import send_email, build_stock_notification_email
from app.config import settings


def notify_stock_subscribers(product: models.Product, db: Session) -> None:
    """Safe to call unconditionally after any stock-affecting update — it's a
    no-op when stock is still 0 or nobody's waiting. Doesn't try to detect the
    exact 0→positive transition; if stock is positive and someone's un-notified,
    they get notified, which is simpler and self-healing if this was ever
    missed on a prior update."""
    if product.stock_quantity <= 0:
        return

    pending = (
        db.query(models.StockNotification)
        .filter(models.StockNotification.product_id == product.id, models.StockNotification.notified == False)
        .all()
    )
    if not pending:
        return

    product_url = f"{settings.FRONTEND_URL}/products/{product.slug}"
    subject, html = build_stock_notification_email(product.name, product_url)
    for sub in pending:
        send_email(sub.email, subject, html)
        sub.notified = True
    db.commit()