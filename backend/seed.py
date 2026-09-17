import qrcode
from qrcode.image.svg import SvgPathImage

url = "https://mowj.gallery/q"

qr = qrcode.QRCode(
    version=5,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=20,
    border=6,
)

qr.add_data(url)
qr.make(fit=True)

img = qr.make_image(image_factory=SvgPathImage)

with open("mowj_qr_print.svg", "wb") as f:
    img.save(f)

print("Created mowj_qr_print.svg")