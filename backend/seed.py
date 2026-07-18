from sqlalchemy.orm import Session
from app.database import engine
from app.models import Category, Product, ProductMaterial, ProductImage, MetalType


def seed():
    with Session(engine) as db:
        # Clear existing data
        db.query(ProductImage).delete()
        db.query(ProductMaterial).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()

        # Categories
        necklaces = Category(name="Necklaces", slug="necklaces", description="Elegant necklaces for every occasion")
        rings = Category(name="Rings", slug="rings", description="Handcrafted rings in precious metals")
        bracelets = Category(name="Bracelets", slug="bracelets", description="Timeless bracelet designs")

        db.add_all([necklaces, rings, bracelets])
        db.commit()

        # Products
        gold_chain = Product(
            name="Gold Chain Necklace",
            slug="gold-chain-necklace",
            description="A classic 18k gold chain, polished to a mirror finish. Perfect for layering or wearing alone.",
            category=necklaces,
            base_price=150.0,
            total_weight_grams=12.5,
            stock_quantity=5,
            is_active=True,
        )

        silver_ring = Product(
            name="Silver Signet Ring",
            slug="silver-signet-ring",
            description="Minimalist sterling silver signet ring with a brushed matte finish.",
            category=rings,
            base_price=80.0,
            total_weight_grams=8.0,
            stock_quantity=2,
            is_active=True,
        )

        leather_bracelet = Product(
            name="Leather Wrap Bracelet",
            slug="leather-wrap-bracelet",
            description="Hand-stitched Italian leather with a sterling silver clasp.",
            category=bracelets,
            base_price=45.0,
            total_weight_grams=25.0,
            stock_quantity=12,
            is_active=True,
        )

        mixed_ring = Product(
            name="Gold & Silver Band",
            slug="gold-silver-band",
            description="Two-tone wedding band featuring intertwined gold and silver strands.",
            category=rings,
            base_price=200.0,
            total_weight_grams=10.0,
            stock_quantity=3,
            is_active=True,
        )

        db.add_all([gold_chain, silver_ring, leather_bracelet, mixed_ring])
        db.commit()

        # Materials
        materials = [
            ProductMaterial(product=gold_chain, metal_type=MetalType.GOLD, weight_grams=10.5, display_name="18k Gold"),
            ProductMaterial(product=silver_ring, metal_type=MetalType.SILVER, weight_grams=7.0, display_name="Sterling Silver"),
            ProductMaterial(product=leather_bracelet, metal_type=MetalType.NONE, weight_grams=0.0, display_name="Italian Leather"),
            ProductMaterial(product=leather_bracelet, metal_type=MetalType.SILVER, weight_grams=2.0, display_name="Sterling Silver Clasp"),
            ProductMaterial(product=mixed_ring, metal_type=MetalType.GOLD, weight_grams=5.0, display_name="14k Gold"),
            ProductMaterial(product=mixed_ring, metal_type=MetalType.SILVER, weight_grams=4.0, display_name="Sterling Silver"),
        ]

        db.add_all(materials)
        db.commit()

        # Images
        images = [
            ProductImage(product=gold_chain, url="https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=800", alt_text="Gold chain necklace on black background", is_primary=True, sort_order=0),
            ProductImage(product=silver_ring, url="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt_text="Silver signet ring close up", is_primary=True, sort_order=0),
            ProductImage(product=leather_bracelet, url="https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800", alt_text="Brown leather wrap bracelet", is_primary=True, sort_order=0),
            ProductImage(product=mixed_ring, url="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800", alt_text="Two-tone gold and silver band", is_primary=True, sort_order=0),
        ]

        db.add_all(images)
        db.commit()

        print("Seeded 4 products, 3 categories, 6 materials, 4 images.")


if __name__ == "__main__":
    seed()