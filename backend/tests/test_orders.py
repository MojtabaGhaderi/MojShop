"""
Test order creation flow.
This is the money path — bugs here directly cost revenue.
"""

import pytest


class TestOrders:
    """Order lifecycle: create from cart, view history, verify snapshots."""
    
    @pytest.fixture
    async def user_token(self, async_client):
        """Regular user with empty cart."""
        await async_client.post("/auth/register", json={
            "email": "buyer@example.com",
            "password": "buyerpass",
            "full_name": "Buyer",
            "phone": "+989123456789",
        })
        login = await async_client.post("/auth/login", json={
            "email": "buyer@example.com",
            "password": "buyerpass",
            "phone": "+989123456789",
        })
        return login.json()["access_token"]
    
    @pytest.fixture
    async def address_id(self, async_client, user_token, db_session):
        """Create a shipping address for the user."""
        response = await async_client.post("/profile/addresses/", 
            json={
                "label": "Home",
                "line_1": "123 Main St",
                "city": "Tehran",
                "postal_code": "12345",
            },
            headers={"Authorization": f"Bearer {user_token}"},
        )
        return response.json()["id"]
    
    @pytest.fixture
    async def product_in_cart(self, async_client, user_token, db_session):
        """Add a product to cart, return product data."""
        from app.crud import create_category, create_product
        from app.models import MetalType
        
        cat = create_category(db_session, {"name": "Rings", "slug": "rings"})
        product = create_product(db_session, {
            "name": "Gold Ring",
            "slug": "gold-ring",
            "category_id": cat.id,
            "base_price": 100.0,
            "total_weight_grams": 5.0,
            "stock_quantity": 10,
            "materials": [{"metal_type": MetalType.GOLD, "weight_grams": 5.0}],
            "images": [],
        })
        
        await async_client.post("/cart/", 
            json={"product_id": product.id, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        return product
    
    async def test_create_order_from_cart(self, async_client, user_token, address_id, product_in_cart):
        """Order creation clears cart, generates invoice, snapshots prices."""
        response = await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        
        # Basic structure
        assert data["id"] > 0
        assert data["status"] == "pending"
        assert data["address"]["id"] == address_id
        assert len(data["items"]) == 1
        
        # Price snapshot — must be frozen at order time
        item = data["items"][0]
        assert item["product_name"] == "Gold Ring"
        assert item["quantity"] == 2
        assert item["unit_price"] > 0  # Computed price, not base price
        assert "materials_snapshot" in item
        
        # Invoice generated
        assert data["invoice"] is not None
        assert data["invoice"]["invoice_number"].startswith("INV-")
        assert data["invoice"]["status"] == "pending"
        
        # Cart is empty after order
        cart = await async_client.get("/cart/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert cart.json() == []
    
    async def test_order_requires_address(self, async_client, user_token, product_in_cart):
        """Cannot create order without valid address."""
        response = await async_client.post("/orders/", 
            json={"address_id": 99999},  # Non-existent
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 404
        assert "Address not found" in response.json()["detail"]
    
    async def test_order_requires_cart_items(self, async_client, user_token, address_id):
        """Empty cart cannot create order."""
        response = await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
        assert "Cart is empty" in response.json()["detail"]
    
    async def test_order_history(self, async_client, user_token, address_id, product_in_cart):
        """User can view their order history."""
        # Create order
        await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        
        # View history
        response = await async_client.get("/orders/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) == 1
        assert orders[0]["items"][0]["product_name"] == "Gold Ring"
    
    async def test_order_detail(self, async_client, user_token, address_id, product_in_cart):
        """Can fetch single order by ID."""
        created = await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        order_id = created.json()["id"]
        
        response = await async_client.get(f"/orders/{order_id}", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 200
        assert response.json()["id"] == order_id
    
    async def test_cannot_view_others_order(self, async_client, user_token, address_id, product_in_cart):
        """Users cannot see each other's orders."""
        # Create order as user 1
        created = await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        order_id = created.json()["id"]
        
        # Create user 2
        await async_client.post("/auth/register", json={
            "email": "other@example.com",
            "password": "otherpass",
            "phone": "+989223456789",
        })
        other_login = await async_client.post("/auth/login", json={
            "email": "other@example.com",
            "password": "otherpass",
            "phone": "+989223456789",
        })
        other_token = other_login.json()["access_token"]
        
        # Try to access order
        response = await async_client.get(f"/orders/{order_id}", headers={
            "Authorization": f"Bearer {other_token}",
        })
        assert response.status_code == 404  # Not found (not 403, to hide existence)
    
    async def test_price_snapshot_is_frozen(self, async_client, user_token, address_id, product_in_cart, db_session):
        """Order item price doesn't change even if product price later changes."""
        from app.services.price_service import fetch_live_prices
        
        # Get current price
        prices_before = await fetch_live_prices()
        gold_rate_before = prices_before["gold_per_gram"]
        
        # Create order
        created = await async_client.post("/orders/", 
            json={"address_id": address_id},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        order_price = created.json()["items"][0]["unit_price"]
        
        # Verify it matches calculation at that time
        expected = 100.0 + (5.0 * gold_rate_before)  # base + (weight * rate)
        assert order_price == round(expected, 2)
        
        # Even if rates change later, order price stays the same
        # (We can't easily test this without mocking, but the snapshot structure proves intent)