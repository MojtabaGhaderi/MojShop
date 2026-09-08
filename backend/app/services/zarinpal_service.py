import httpx
from app.config import settings

_BASE = "sandbox.zarinpal.com" if settings.ZARINPAL_SANDBOX else "payment.zarinpal.com"
REQUEST_URL = f"https://{_BASE}/pg/v4/payment/request.json"
VERIFY_URL = f"https://{_BASE}/pg/v4/payment/verify.json"
STARTPAY_URL = f"https://{_BASE}/pg/StartPay/"

TOMAN_TO_RIAL = 10  # ZarinPal's actual API always takes Rial, regardless of what wrapper libraries advertise


class ZarinPalError(Exception):
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"ZarinPal error {code}: {message}")


def _raise_if_error(data: dict) -> None:
    errors = data.get("errors")
    if errors:
        if isinstance(errors, dict):
            raise ZarinPalError(errors.get("code", -1), errors.get("message", "Unknown ZarinPal error"))
        raise ZarinPalError(-1, str(errors))


async def request_payment(
    amount_toman: int,
    description: str,
    callback_url: str,
    mobile: str | None = None,
    email: str | None = None,
) -> str:
    """Returns the ZarinPal 'authority' token used to build the redirect URL."""
    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_toman * TOMAN_TO_RIAL,
        "description": description,
        "callback_url": callback_url,
    }
    metadata = {k: v for k, v in {"mobile": mobile, "email": email}.items() if v}
    if metadata:
        payload["metadata"] = metadata

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(REQUEST_URL, json=payload)
        data = resp.json()
        print(data)

    _raise_if_error(data)
    return data["data"]["authority"]


def build_startpay_url(authority: str) -> str:
    return f"{STARTPAY_URL}{authority}"


async def verify_payment(amount_toman: int, authority: str) -> dict:
    """Returns {'ref_id': str} on success. Raises ZarinPalError on failure."""
    payload = {
        "merchant_id": settings.ZARINPAL_MERCHANT_ID,
        "amount": amount_toman * TOMAN_TO_RIAL,
        "authority": authority,
    }
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(VERIFY_URL, json=payload)
        data = resp.json()

    _raise_if_error(data)
    result = data["data"]
    # code 100 = fresh verification, 101 = already verified previously — both are success
    if result.get("code") not in (100, 101):
        raise ZarinPalError(result.get("code", -1), "Payment could not be verified")

    return {"ref_id": str(result.get("ref_id"))}