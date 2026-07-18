"""
Test product filtering and search.
Broken filters = customers can't find products = lost sales.
"""

import pytest


class TestProductFilters:
    """Filter by category, metal type, text search."""
    
    @pytest.fixture
    def seeded_products(self, db_session):
        """Create products across categories and metals."""
        from app.crud import create_category, create_product
        from app.models import MetalType
        
        necklaces = create_category(db_session, {"name": "Necklaces", "slug": "necklaces"})
        rings = create_category(db_session, {"name": "Rings", "slug": "rings"})
        
        # Gold necklace
        create_product(db_session, {
            "name": "Gold Chain",
            "slug": "gold-chain",
            "category_id": necklaces.id,
            "base_price": 100.0,
            "stock_quantity": 5,
            "materials": [{"metal_type": MetalType.GOLD, "weight_grams": 10.0}],
            "images": [],
        })
        
        # Silver ring
        create_product(db_session, {
            "name": "Silver Band",
            "slug": "silver-band",
            "category_id": rings.id,
            "base_price": 50.0,
            "stock_quantity": 3,
            "materials": [{"metal_type": MetalType.SILVER, "weight_grams": 5.0}],
            "images": [],
        })
        
        # Platinum ring
        create_product(db_session, {
            "name": "Platinum Ring",
            "slug": "platinum-ring",
            "category_id": rings.id,
            "base_price": 200.0,
            "stock_quantity": 2,
            "materials": [{"metal_type": MetalType.PLATINUM, "weight_grams": 8.0}],
            "images": [],
        })
        
        # Mixed: gold + silver
        create_product(db_session, {
            "name": "Two Tone Ring",
            "slug": "two-tone-ring",
            "category_id": rings.id,
            "base_price": 150.0,
            "stock_quantity": 1,
            "materials": [
                {"metal_type": MetalType.GOLD, "weight_grams": 3.0},
                {"metal_type": MetalType.SILVER, "weight_grams": 2.0},
            ],
            "images": [],
        })
    
    async def test_filter_by_category(self, async_client, seeded_products):
        """?category=rings returns only rings."""
        response = await async_client.get("/products/?category=rings")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 3
        for p in products:
            assert p["category"]["slug"] == "rings"
    
    async def test_filter_by_metal(self, async_client, seeded_products):
        """?metal=gold returns products containing gold."""
        response = await async_client.get("/products/?metal=gold")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 2  # Gold chain + Two tone ring
        
        slugs = {p["slug"] for p in products}
        assert "gold-chain" in slugs
        assert "two-tone-ring" in slugs
    
    async def test_filter_by_category_and_metal(self, async_client, seeded_products):
        """Combine filters: rings with gold."""
        response = await async_client.get("/products/?category=rings&metal=gold")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 1
        assert products[0]["slug"] == "two-tone-ring"
    
    async def test_search_by_name(self, async_client, seeded_products):
        """?search=ring finds products with 'ring' in name."""
        response = await async_client.get("/products/?search=ring")
        assert response.status_code == 200
        products = response.json()
        assert len(products) == 2  # Platinum Ring, Two Tone Ring
        
        for p in products:
            assert "ring" in p["name"].lower() or "ring" in p["slug"].lower()
    
    async def test_search_by_description(self, async_client, seeded_products):
        """Search also checks description field."""
        # This test would need products with descriptions
        # For now, verify search param doesn't crash
        response = await async_client.get("/products/?search=nonexistent")
        assert response.status_code == 200
        assert response.json() == []
    
    async def test_filter_no_results(self, async_client, seeded_products):
        """Filter with no matches returns empty list, not error."""
        response = await async_client.get("/products/?category=bracelets")
        assert response.status_code == 200
        assert response.json() == []
    
    async def test_inactive_products_hidden(self, async_client, seeded_products, db_session):
        """Inactive products never appear in public listings."""
        from app.crud import get_product_by_slug
        
        product = get_product_by_slug(db_session, "silver-band")
        product.is_active = False
        db_session.commit()
        
        response = await async_client.get("/products/")
        products = response.json()
        slugs = {p["slug"] for p in products}
        assert "silver-band" not in slugs