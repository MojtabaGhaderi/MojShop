import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime

from app.config import settings

logger = logging.getLogger("email_service")

SENT_EMAILS_DIR = "sent_emails"
os.makedirs(SENT_EMAILS_DIR, exist_ok=True)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Sends via real SMTP if configured; otherwise writes the rendered email to
    sent_emails/*.html (dev mode) — open the file directly in a browser to see
    exactly what would have been sent, no fake console text to squint at."""
    if _smtp_configured():
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to
            msg.attach(MIMEText(html_body, "html", "utf-8"))
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to], msg.as_string())
            logger.info(f"Email sent to {to}: {subject}")
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {to}: {e}")
            _dump_to_file(to, subject, html_body)  # don't silently lose it — fall back to file
            return False
    else:
        logger.info(f"[DEV MODE — no SMTP configured] Email to {to}: {subject}")
        _dump_to_file(to, subject, html_body)
        return True


def _dump_to_file(to: str, subject: str, html_body: str) -> None:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    safe_subject = "".join(c if c.isalnum() else "_" for c in subject)[:50]
    filename = f"{SENT_EMAILS_DIR}/{timestamp}_{safe_subject}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(f"<!-- To: {to} | Subject: {subject} -->\n{html_body}")


def _wrap_template(body_html: str) -> str:
    return f"""
    <html dir="rtl" lang="fa">
    <head><meta charset="utf-8"></head>
    <body style="font-family: Tahoma, sans-serif; background:#f7f7f7; padding:24px; color:#1a1a1a;">
      <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;">
        <h2 style="margin-top:0;">موج گالری</h2>
        {body_html}
        <p style="margin-top:24px;font-size:12px;color:#999;">این ایمیل به صورت خودکار ارسال شده است.</p>
      </div>
    </body>
    </html>
    """


def build_order_confirmation_email(order) -> tuple[str, str]:
    subject = f"تایید سفارش #{order.id} — موج گالری"
    items_html = "".join(
        f"<li>{item.product_name}{' — ' + item.variant_name if item.variant_name else ''} × {item.quantity}</li>"
        for item in order.items
    )
    body = f"""
      <p>سفارش شما با موفقیت پرداخت شد.</p>
      <p><strong>شماره سفارش:</strong> {order.id}</p>
      <ul>{items_html}</ul>
      <p><strong>مبلغ کل:</strong> {order.total:,.0f} تومان</p>
    """
    return subject, _wrap_template(body)


def build_shipping_notification_email(order) -> tuple[str, str]:
    subject = f"سفارش #{order.id} ارسال شد — موج گالری"
    # tracking_number doesn't exist on Order yet — that's Day 12. Using getattr
    # so this silently starts including it once that column lands, with zero
    # changes needed here.
    tracking_line = ""
    if getattr(order, "tracking_number", None):
        tracking_line = f"<p><strong>کد رهگیری:</strong> {order.tracking_number}</p>"
    body = f"""
      <p>سفارش شما ارسال شد و به‌زودی به دستتان می‌رسد.</p>
      <p><strong>شماره سفارش:</strong> {order.id}</p>
      {tracking_line}
    """
    return subject, _wrap_template(body)


def build_stock_notification_email(product_name: str, product_url: str) -> tuple[str, str]:
    subject = f"«{product_name}» دوباره موجود شد"
    body = f"""
      <p>محصولی که منتظرش بودید دوباره موجود شد:</p>
      <p><strong>{product_name}</strong></p>
      <p><a href="{product_url}">مشاهده محصول</a></p>
    """
    return subject, _wrap_template(body)


def build_password_reset_email(reset_url: str) -> tuple[str, str]:
    subject = "بازیابی رمز عبور — موج گالری"
    body = f"""
      <p>برای بازیابی رمز عبور خود، روی لینک زیر کلیک کنید. این لینک تا ۱ ساعت معتبر است.</p>
      <p><a href="{reset_url}">بازیابی رمز عبور</a></p>
      <p>اگر این درخواست را شما نداده‌اید، این ایمیل را نادیده بگیرید.</p>
    """
    return subject, _wrap_template(body)