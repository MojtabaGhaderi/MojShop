import asyncio


async def fetch_live_prices() -> dict:
    """
    Returns live metal prices in USD per gram.
    TODO: Replace with real API call to GoldAPI, Metals-API, etc.
    """
    # Simulate async work (API call)
    await asyncio.sleep(0)

    return {
        "gold_per_gram": 85.50,
        "silver_per_gram": 1.20,
        "platinum_per_gram": 45.00,
        "palladium_per_gram": 35.00,
        "updated_at": "2024-01-01T00:00:00",
    }