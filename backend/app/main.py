from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import products, categories, auth, profile, addresses, cart, orders

app = FastAPI(title="Accessory Shop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(addresses.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(products.router)
app.include_router(categories.router)

@app.get("/health")
def health():
    return {"status": "ok"}