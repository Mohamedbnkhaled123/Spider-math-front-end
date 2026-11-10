#!/usr/bin/env python3
"""
Spider Math — High-Performance Image Compression & WebP Optimization Pipeline
Converts raw images into ultra-lightweight WebP assets with smart Lanczos resampling,
supporting responsive variants (desktop 512px + mobile 320px) to maximize Lighthouse score.

Usage:
    npm run compress:images                              # Compresses all 4 curriculum card mascots
    python scripts/compress-images.py                    # Same as above
    python scripts/compress-images.py <image_path>      # Compresses a specific image to WebP
    python scripts/compress-images.py <dir_path>        # Compresses all images in a folder
    python scripts/compress-images.py <path> --responsive # Generates standard and -sm.webp variants
"""

import os
import sys
import argparse
from pathlib import Path
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SCRIPT_DIR.parent
BRANDING_DIR = PROJECT_DIR / "src" / "assets" / "branding"
RAW_MASCOTS_DIR = BRANDING_DIR / "raw"

# Canonical curricula raw source files (stored locally in the repo for 100% reproducibility)
LOCAL_CURRICULA_SOURCES = {
    "egyptian": RAW_MASCOTS_DIR / "curriculum-egyptian.jpg",
    "gulf": RAW_MASCOTS_DIR / "curriculum-gulf.jpg",
    "sat": RAW_MASCOTS_DIR / "curriculum-sat.jpg",
    "british": RAW_MASCOTS_DIR / "curriculum-british.jpg",
}

# Fallback brain paths in case local directory hasn't been populated
FALLBACK_CURRICULA_SOURCES = {
    "egyptian": Path(r"C:\Users\A&M\.gemini\antigravity\brain\7884e37f-b482-4770-8151-7e858c83638b\.user_uploaded\media_1794330056641_cb3fd8a6.jpg"),
    "gulf": Path(r"C:\Users\A&M\.gemini\antigravity\brain\7884e37f-b482-4770-8151-7e858c83638b\.user_uploaded\media_1794330170081_20d26b60.jpg"),
    "sat": Path(r"C:\Users\A&M\.gemini\antigravity\brain\7884e37f-b482-4770-8151-7e858c83638b\.user_uploaded\media_1794330222247_55059f12.jpg"),
    "british": Path(r"C:\Users\A&M\.gemini\antigravity\brain\c2ade586-1c70-4fd1-a5ca-d9208c2b223e\british_mascot_1794330688428.jpg"),
}


def compress_image(src_path: Path, dest_path: Path, max_dim: int = 512, quality: int = 80) -> int:
    """Compress and convert an image to WebP with smart Lanczos resizing."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src_path) as img:
        has_alpha = img.mode in ("RGBA", "LA") or (img.mode == "P" and "transparency" in img.info)
        mode = "RGBA" if has_alpha else "RGB"
        img = img.convert(mode)
        
        # Calculate proportional bounding box
        w, h = img.size
        if max(w, h) > max_dim:
            if w >= h:
                new_w = max_dim
                new_h = int(round(h * (max_dim / w)))
            else:
                new_h = max_dim
                new_w = int(round(w * (max_dim / h)))
            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
        img.save(dest_path, "WEBP", quality=quality, method=6, optimize=True)
        
    return dest_path.stat().st_size


def resolve_source(key: str) -> Path | None:
    """Find source image from local repo first, then fallback."""
    local = LOCAL_CURRICULA_SOURCES.get(key)
    if local and local.exists():
        return local
    fallback = FALLBACK_CURRICULA_SOURCES.get(key)
    if fallback and fallback.exists():
        return fallback
    return None


def compress_curricula_mascots():
    print("=" * 68)
    print("Spider Math: Compressing Curriculum Card Background Mascots to WebP")
    print("=" * 68)
    
    BRANDING_DIR.mkdir(parents=True, exist_ok=True)
    total_orig = 0
    total_comp = 0
    
    for key in ("egyptian", "gulf", "sat", "british"):
        src_path = resolve_source(key)
        if not src_path or not src_path.exists():
            print(f"[ERROR] Source file missing for {key}")
            continue
            
        orig_size = src_path.stat().st_size
        total_orig += orig_size
        
        # Desktop / Retina standard (512x512)
        std_out = BRANDING_DIR / f"curriculum-card-{key}.webp"
        std_size = compress_image(src_path, std_out, max_dim=512, quality=80)
        
        # Mobile compact (320x320)
        sm_out = BRANDING_DIR / f"curriculum-card-{key}-sm.webp"
        sm_size = compress_image(src_path, sm_out, max_dim=320, quality=78)
        
        total_comp += (std_size + sm_size)
        savings = (1 - (std_size / orig_size)) * 100 if orig_size > 0 else 0
        print(f"✓ [{key.upper()}] (Source: {src_path.name})")
        print(f"    Original : {orig_size / 1024:.1f} KB")
        print(f"    Standard : {std_size / 1024:.1f} KB (512px WebP, -{savings:.1f}%) -> {std_out.name}")
        print(f"    Mobile   : {sm_size / 1024:.1f} KB (320px WebP) -> {sm_out.name}")
        
    print("-" * 68)
    print(f"Total Original Sources   : {total_orig / 1024:.1f} KB")
    print(f"Total Output (all variants): {total_comp / 1024:.1f} KB")
    pct_total = (1 - (total_comp / (total_orig * 2))) * 100 if total_orig > 0 else 0
    print(f"Overall Bandwidth Savings : -{pct_total:.1f}%")
    print(f"Assets written to: {BRANDING_DIR}")
    print("=" * 68)


def process_custom_path(path_str: str, quality: int, max_dim: int, responsive: bool = False, out_dir: str | None = None):
    target = Path(path_str)
    if not target.exists():
        print(f"[ERROR] File or directory does not exist: {target}")
        sys.exit(1)
        
    files = []
    if target.is_file():
        files.append(target)
    else:
        for ext in ("*.png", "*.jpg", "*.jpeg"):
            files.extend(target.rglob(ext))
            
    print(f"Found {len(files)} image(s) to optimize...")
    dest_folder = Path(out_dir) if out_dir else None
    
    for f in files:
        if f.name.endswith("-sm.webp"):
            continue  # Skip existing mobile variants
            
        orig_size = f.stat().st_size
        out_base = dest_folder if dest_folder else f.parent
        out_f = out_base / f"{f.stem}.webp"
        
        new_size = compress_image(f, out_f, max_dim=max_dim, quality=quality)
        pct = (1 - (new_size / orig_size)) * 100 if orig_size > 0 else 0
        print(f"✓ {f.name} -> {out_f.name} ({orig_size/1024:.1f}KB -> {new_size/1024:.1f}KB, -{pct:.1f}%)")
        
        if responsive:
            sm_f = out_base / f"{f.stem}-sm.webp"
            sm_dim = int(round(max_dim * 0.625))  # e.g., 512 -> 320
            sm_size = compress_image(f, sm_f, max_dim=sm_dim, quality=max(60, quality - 2))
            print(f"    + Responsive Mobile: {sm_f.name} ({sm_size/1024:.1f}KB)")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Spider Math Image Compression Pipeline")
    parser.add_argument("path", nargs="?", default=None, help="Optional path to image or directory to compress")
    parser.add_argument("--curricula", action="store_true", help="Process the 4 canonical curricula mascots")
    parser.add_argument("--quality", type=int, default=80, help="WebP compression quality (1-100, default: 80)")
    parser.add_argument("--max-dim", type=int, default=512, help="Max dimension in pixels (default: 512)")
    parser.add_argument("--responsive", action="store_true", help="Also generate compact mobile variant (-sm.webp)")
    parser.add_argument("--out", type=str, default=None, help="Optional output directory for compressed files")
    
    args = parser.parse_args()
    if args.path:
        process_custom_path(args.path, quality=args.quality, max_dim=args.max_dim, responsive=args.responsive, out_dir=args.out)
    else:
        compress_curricula_mascots()


