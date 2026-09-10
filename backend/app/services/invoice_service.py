import os
from weasyprint import HTML
from app import models

INVOICE_DIR = "uploads/invoices"
os.makedirs(INVOICE_DIR, exist_ok=True)
FONT_PATH = os.path.abspath("app/static/fonts/Vazirmatn-Regular.ttf")

INVOICE_TEMPLATE = """
<html dir="rtl" lang="fa">
<head>
<meta charset="utf-8">
<style>
  @font-face {{ font-family: 'Vazirmatn'; src: url('file://{font_path}'); }}
  body {{ font-family: 'Vazirmatn', sans-serif; padding: 40px; color: #1a1a1a; }}
  h1 {{ font-size: 20px; margin-bottom: 4px; }}
  .muted {{ color: #666; font-size: 12px; }}
  table {{ width: 100%; border-collapse: collapse; margin-top: 24px; }}
  th, td {{ text-align: right; padding: 8px; border-bottom: 1px solid #ddd; font-size: 13px; }}
  .totals {{ margin-top: 16px; width: 260px; margin-inline-start: auto; }}
  .totals div {{ display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }}
  .totals .total {{ font-weight: bold; font-size: 15px; border-top: 1px solid #333; margin-top: 6px; padding-top: 8px; }}
</style>
</head>
<body>
  <h1>موج گالری</h1>
  <p class="muted">فاکتور شماره {invoice_number} — سفارش #{order_id}</p>
  <p class="muted">تاریخ: {date}</p>
  <p><strong>مشتری:</strong> {customer_name} — {customer_email}</p>
  <p><strong>آدرس تحویل:</strong> {address_line}، {city}، {postal_code}</p>
  <table>
    <thead><tr><th>کالا</th><th>تعداد</th><th>قیمت واحد</th><th>جمع</th></tr></thead>
    <tbody>{rows}</tbody>
  </table>
  <div class="totals">
    <div><span>جمع جزء</span><span>{subtotal}</span></div>
    <div><span>تخفیف</span><span>-{discount}</span></div>
    <div><span>هزینه ارسال</span><span>{shipping}</span></div>
    <div class="total"><span>مبلغ کل</span><span>{total}</span></div>
  </div>
</body>
</html>
"""


def _fmt(n: float) -> str:
    return f"{n:,.0f} تومان"


def generate_invoice_pdf(order: models.Order) -> str:
    rows = "".join(
        f"<tr><td>{item.product_name}{' — ' + item.variant_name if item.variant_name else ''}</td>"
        f"<td>{item.quantity}</td><td>{_fmt(item.unit_price)}</td><td>{_fmt(item.unit_price * item.quantity)}</td></tr>"
        for item in order.items
    )
    customer_name = order.user.full_name if order.user else (order.guest_name or "مهمان")
    customer_email = order.user.email if order.user else (order.guest_email or "-")

    html_content = INVOICE_TEMPLATE.format(
        font_path=FONT_PATH,
        invoice_number=order.invoice.invoice_number,
        order_id=order.id,
        date=order.created_at.strftime("%Y-%m-%d"),
        customer_name=customer_name,
        customer_email=customer_email,
        address_line=order.address.line_1,
        city=order.address.city,
        postal_code=order.address.postal_code,
        rows=rows,
        subtotal=_fmt(order.subtotal),
        discount=_fmt(order.discount_amount),
        shipping=_fmt(order.shipping_cost),
        total=_fmt(order.total),
    )

    filename = f"{order.invoice.invoice_number}.pdf"
    filepath = os.path.join(INVOICE_DIR, filename)
    HTML(string=html_content).write_pdf(filepath)
    return f"/uploads/invoices/{filename}"