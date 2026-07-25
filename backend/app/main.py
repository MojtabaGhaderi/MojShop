from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routers import products, categories, auth, profile, addresses, cart, orders, upload

app = FastAPI(title="Accessory Shop API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images statically
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# API routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(addresses.router)
app.include_router(cart.router)
app.include_router(orders.router)
app.include_router(upload.router)
app.include_router(products.router)
app.include_router(categories.router)

@app.get("/health")
def health():
    return {"status": "ok"}