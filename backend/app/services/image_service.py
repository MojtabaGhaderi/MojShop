import os
import uuid
from pathlib import Path
from PIL import Image
from fastapi import UploadFile

# Base upload directory
UPLOAD_DIR = Path("uploads/products")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _generate_filename(original_filename: str) -> str:
    """Generate unique filename with UUID prefix."""
    ext = Path(original_filename).suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png"}:
        ext = ".jpg"
    return f"{uuid.uuid4().hex}{ext}"


def _save_original(file: UploadFile, product_id: int) -> Path:
    """Save uploaded file to disk."""
    product_dir = UPLOAD_DIR / str(product_id)
    product_dir.mkdir(parents=True, exist_ok=True)
    
    filename = _generate_filename(file.filename or "image.jpg")
    file_path = product_dir / f"original-{filename}"
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    return file_path


def _resize_crop(source_path: Path, size: int, suffix: str) -> Path:
    """Crop to square. For thumbnails."""
    with Image.open(source_path) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Center crop to square
        width, height = img.size
        min_dim = min(width, height)
        left = (width - min_dim) // 2
        top = (height - min_dim) // 2
        img = img.crop((left, top, left + min_dim, top + min_dim))
        
        # Resize
        img = img.resize((size, size), Image.Resampling.LANCZOS)
        
        output_path = source_path.parent / f"{suffix}-{source_path.name.replace('original-', '')}"
        img.save(output_path, "JPEG", quality=85, optimize=True)
        return output_path


def _resize_fit(source_path: Path, max_size: int, suffix: str) -> Path:
    """Fit within bounds, keep aspect ratio. For medium/large."""
    with Image.open(source_path) as img:
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize to fit within max_size, keeping aspect ratio
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        output_path = source_path.parent / f"{suffix}-{source_path.name.replace('original-', '')}"
        img.save(output_path, "JPEG", quality=85, optimize=True)
        return output_path

def process_product_image(file: UploadFile, product_id: int) -> dict:
    original_path = _save_original(file, product_id)
    
    # Thumb: square crop
    thumb = _resize_crop(original_path, 300, "thumb")
    # Medium: fit within 800x800
    medium = _resize_fit(original_path, 800, "medium")
    # Large: fit within 1600x1600
    large = _resize_fit(original_path, 1600, "large")
    
    def _url(path: Path) -> str:
        return f"/uploads/products/{product_id}/{path.name}"
    
    return {
        "original": _url(original_path),
        "thumb": _url(thumb),
        "medium": _url(medium),
        "large": _url(large),
    }