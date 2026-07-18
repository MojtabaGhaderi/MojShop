"""
Test shopping cart flow.
Cart is core revenue — bugs here directly cost sales.
"""

import pytest


class TestCart:
    """Cart endpoints require authentication."""
    
    @pytest.fixture
    async def user_token(self, async_client):
        """Register and login a regular user."""
        await async_client.post("/auth/register", json={
            "email": "shopper@example.com",
            "password": "shoppass",
            "full_name": "Shopper",
            "phone": "+989123456789",
        })
        login = await async_client.post("/auth/login", json={
            "email": "shopper@example.com",
            "password": "shoppass",
            "phone": "+989123456789",
        })
        return login.json()["access_token"]
    
    @pytest.fixture
    async def sample_product(self, async_client, db_session):
        """Create a product available for purchase."""
        from app.crud import create_category, create_product
        from app.models import MetalType
        
        cat = create_category(db_session, {"name": "Necklaces", "slug": "necklaces"})
        return create_product(db_session, {
            "name": "Silver Chain",
            "slug": "silver-chain",
            "category_id": cat.id,
            "base_price": 50.0,
            "total_weight_grams": 10.0,
            "stock_quantity": 5,
            "materials": [{"metal_type": MetalType.SILVER, "weight_grams": 10.0}],
            "images": [],
        })
    
    async def test_cart_empty_initially(self, async_client, user_token):
        """New user has empty cart."""
        response = await async_client.get("/cart/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 200
        assert response.json() == []
    
    async def test_add_to_cart(self, async_client, user_token, sample_product):
        """Can add product to cart."""
        response = await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["quantity"] == 2
        assert data["product"]["name"] == "Silver Chain"
        assert "current_price" in data["product"]
    
    async def test_add_same_product_increments_quantity(self, async_client, user_token, sample_product):
        """Adding same product again increments, not duplicates."""
        # First add
        await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        # Second add
        response = await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 201
        assert response.json()["quantity"] == 3  # 1 + 2
    
    async def test_add_to_cart_exceeds_stock(self, async_client, user_token, sample_product):
        """Cannot add more than available stock."""
        response = await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 999},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
        assert "stock" in response.json()["detail"].lower()
    
    async def test_add_inactive_product(self, async_client, user_token, db_session):
        """Cannot add discontinued product to cart."""
        from app.crud import create_category, create_product
        
        cat = create_category(db_session, {"name": "Old", "slug": "old"})
        product = create_product(db_session, {
            "name": "Discontinued",
            "slug": "discontinued",
            "category_id": cat.id,
            "base_price": 10.0,
            "stock_quantity": 5,
            "is_active": False,
            "materials": [],
            "images": [],
        })
        
        response = await async_client.post("/cart/", 
            json={"product_id": product.id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 400
        assert "not available" in response.json()["detail"].lower()
    
    async def test_update_cart_quantity(self, async_client, user_token, sample_product):
        """Can change quantity of item in cart."""
        # Add first
        await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        # Update
        response = await async_client.put(f"/cart/{sample_product.id}", 
            json={"quantity": 3},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        assert response.status_code == 200
        assert response.json()["quantity"] == 3
    
    async def test_remove_from_cart(self, async_client, user_token, sample_product):
        """Can remove single item from cart."""
        # Add
        await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 1},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        # Remove
        response = await async_client.delete(f"/cart/{sample_product.id}", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 204
        
        # Verify empty
        cart = await async_client.get("/cart/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert cart.json() == []
    
    async def test_clear_cart(self, async_client, user_token, sample_product):
        """Can clear entire cart at once."""
        # Add multiple
        await async_client.post("/cart/", 
            json={"product_id": sample_product.id, "quantity": 2},
            headers={"Authorization": f"Bearer {user_token}"},
        )
        # Clear
        response = await async_client.delete("/cart/", headers={
            "Authorization": f"Bearer {user_token}",
        })
        assert response.status_code == 204