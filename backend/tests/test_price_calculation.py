"""
Test dynamic price calculation — the core business logic.
Wrong prices = angry customers and potential legal issues.
"""

import pytest
from app.models import Product, ProductMaterial, MetalType
from app.routers.products import _compute_current_price


class TestPriceCalculation:
    """Unit tests for price calculation logic."""
    
    def test_gold_product_simple(self, sample_prices):
        """Gold chain: base $100 + 5g gold @ $100/g = $600."""
        product = Product(base_price=100.0)
        product.materials = [ProductMaterial(metal_type=MetalType.GOLD, weight_grams=5.0)]
        
        result = _compute_current_price(product, sample_prices)
        assert result == 600.0  # 100 + (5 * 100)
    
    def test_silver_product(self, sample_prices):
        """Silver ring: base $50 + 3g silver @ $10/g = $80."""
        product = Product(base_price=50.0)
        product.materials = [ProductMaterial(metal_type=MetalType.SILVER, weight_grams=3.0)]
        
        result = _compute_current_price(product, sample_prices)
        assert result == 80.0
    
    def test_mixed_metals(self, sample_prices):
        """Two-tone band: base $200 + 2g gold + 3g silver = $200 + $200 + $30 = $430."""
        product = Product(base_price=200.0)
        product.materials = [
            ProductMaterial(metal_type=MetalType.GOLD, weight_grams=2.0),
            ProductMaterial(metal_type=MetalType.SILVER, weight_grams=3.0),
        ]
        
        result = _compute_current_price(product, sample_prices)
        assert result == 430.0
    
    def test_no_metal(self, sample_prices):
        """Leather bracelet with no precious metal: base price only."""
        product = Product(base_price=45.0)
        product.materials = [ProductMaterial(metal_type=MetalType.NONE, weight_grams=10.0)]
        
        result = _compute_current_price(product, sample_prices)
        assert result == 45.0
    
    def test_zero_weight_metal(self, sample_prices):
        """Edge case: metal declared but 0g weight should add $0."""
        product = Product(base_price=100.0)
        product.materials = [ProductMaterial(metal_type=MetalType.GOLD, weight_grams=0.0)]
        
        result = _compute_current_price(product, sample_prices)
        assert result == 100.0
    
    def test_unknown_metal_rate(self, sample_prices):
        """If metal rate missing from prices dict, treat as $0 (don't crash)."""
        product = Product(base_price=100.0)
        product.materials = [ProductMaterial(metal_type=MetalType.PLATINUM, weight_grams=2.0)]
        
        # Remove platinum from prices
        prices_without_platinum = {k: v for k, v in sample_prices.items() if "platinum" not in k}
        
        result = _compute_current_price(product, prices_without_platinum)
        assert result == 100.0  # platinum ignored, no crash
    
    def test_empty_materials(self, sample_prices):
        """Product with no materials list should return base price only."""
        product = Product(base_price=75.0)
        product.materials = []
        
        result = _compute_current_price(product, sample_prices)
        assert result == 75.0
    
    def test_rounding(self, sample_prices):
        """Prices with many decimals should round to 2 places."""
        product = Product(base_price=100.0)
        product.materials = [ProductMaterial(metal_type=MetalType.GOLD, weight_grams=1.333)]
        
        result = _compute_current_price(product, sample_prices)
        # 100 + (1.333 * 100) = 233.3 → 233.3
        assert result == 233.3