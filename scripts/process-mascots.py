#!/usr/bin/env python3
"""
Spider Math - Mascot Background Removal & WebP Optimization Pipeline
Extracts 3D mascots rendered against black background into clean transparent RGBA
assets without dark fringes or black halos, generating responsive variants for
desktop and mobile.
"""

import sys
from pathlib import Path
from collections import deque
from PIL import Image

def remove_black_background(src_path: Path) -> Image.Image:
    """
    Studio-grade matte extraction for 3D CGI subjects on black background.
    Preserves character details (eyes, pupils, shadows) while cleanly excising
    both outer background and negative-space pockets between limbs.
    Performs un-premultiplication along anti-aliased edges to eliminate dark fringes.
    """
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    pixels = img.load()

    # Step 1: Outer flood fill from canvas borders with threshold T=20
    bg_mask = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if max(pixels[x, y]) <= 20 and not bg_mask[y * w + x]:
                bg_mask[y * w + x] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if max(pixels[x, y]) <= 20 and not bg_mask[y * w + x]:
                bg_mask[y * w + x] = 1
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not bg_mask[nidx] and max(pixels[nx, ny]) <= 20:
                    bg_mask[nidx] = 1
                    q.append((nx, ny))

    # Step 2: Detect enclosed negative space pockets between limbs
    # Background pockets have true black floors (min_c <= 10, avg_c <= 16.5, sz >= 15)
    # Character features (like eye pupils with min_c >= 11 or facial shadows) are preserved.
    visited = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if not bg_mask[idx] and not visited[idx] and max(pixels[x, y]) <= 20:
                comp = []
                cq = deque([(x, y)])
                visited[idx] = 1
                while cq:
                    px_c, py_c = cq.popleft()
                    comp.append((px_c, py_c))
                    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                        nx, ny = px_c + dx, py_c + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            nidx = ny * w + nx
                            if not bg_mask[nidx] and not visited[nidx] and max(pixels[nx, ny]) <= 20:
                                visited[nidx] = 1
                                cq.append((nx, ny))
                sz = len(comp)
                min_c = min(max(pixels[p]) for p in comp)
                avg_c = sum(max(pixels[p]) for p in comp) / sz
                if sz >= 15 and min_c <= 10 and avg_c <= 16.5:
                    for p in comp:
                        bg_mask[p[1] * w + p[0]] = 1

    # Step 3: Expand background by swallowing residual DCT ringing noise (<= 16)
    q = deque()
    for y in range(h):
        for x in range(w):
            if bg_mask[y * w + x] == 1:
                q.append((x, y))
    while q:
        cx, cy = q.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not bg_mask[nidx] and max(pixels[nx, ny]) <= 16:
                    bg_mask[nidx] = 1
                    q.append((nx, ny))

    # Step 4: Multi-pixel transition zone un-premultiplication (radius 2)
    dist_to_bg = [255] * (w * h)
    edge_q = deque()
    for y in range(h):
        for x in range(w):
            if bg_mask[y * w + x] == 1:
                dist_to_bg[y * w + x] = 0
            else:
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, -1), (-1, 1), (1, 1)):
                    nx, ny = x + dx, y + dy
                    if 0 <= nx < w and 0 <= ny < h and bg_mask[ny * w + nx] == 1:
                        dist_to_bg[y * w + x] = 1
                        edge_q.append((x, y))
                        break

    while edge_q:
        cx, cy = edge_q.popleft()
        cd = dist_to_bg[cy * w + cx]
        if cd >= 2:
            continue
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = cx + dx, cy + dy
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if dist_to_bg[nidx] > cd + 1:
                    dist_to_bg[nidx] = cd + 1
                    edge_q.append((nx, ny))

    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    out_pixels = out.load()

    for y in range(h):
        for x in range(w):
            idx = y * w + x
            d = dist_to_bg[idx]
            if d == 0:
                continue
            r, g, b = pixels[x, y]
            if d > 2:
                out_pixels[x, y] = (r, g, b, 255)
            else:
                fg_samples = []
                for dy in range(-4, 5):
                    for dx in range(-4, 5):
                        nx, ny = x + dx, y + dy
                        if 0 <= nx < w and 0 <= ny < h:
                            if dist_to_bg[ny * w + nx] > 2:
                                fg_samples.append(pixels[nx, ny])
                if fg_samples:
                    avg_fr = sum(c[0] for c in fg_samples) / len(fg_samples)
                    avg_fg = sum(c[1] for c in fg_samples) / len(fg_samples)
                    avg_fb = sum(c[2] for c in fg_samples) / len(fg_samples)
                    max_f = max(avg_fr, avg_fg, avg_fb, 30.0)
                else:
                    max_f = max(r, g, b, 30.0)

                max_c = max(r, g, b)
                alpha = min(1.0, max(0.0, max_c / max_f))
                alpha_int = int(round(alpha * 255))

                if alpha_int <= 15:
                    out_pixels[x, y] = (0, 0, 0, 0)
                else:
                    unmult_r = min(255, int(round(r / alpha)))
                    unmult_g = min(255, int(round(g / alpha)))
                    unmult_b = min(255, int(round(b / alpha)))
                    out_pixels[x, y] = (unmult_r, unmult_g, unmult_b, alpha_int)

    return out


def save_variants(rgba_img: Image.Image, output_specs: list[dict]):
    """
    Save multiple WebP/PNG variants using Lanczos resampling.
    output_specs: list of dicts with:
      'path': Path, 'size': (w, h), 'format': 'WEBP'|'PNG', 'quality': int
    """
    for spec in output_specs:
        target_path: Path = spec['path']
        target_path.parent.mkdir(parents=True, exist_ok=True)
        size = spec['size']
        fmt = spec.get('format', 'WEBP')
        quality = spec.get('quality', 85)

        if rgba_img.size != size:
            resized = rgba_img.resize(size, Image.Resampling.LANCZOS)
        else:
            resized = rgba_img

        if fmt == 'WEBP':
            resized.save(target_path, 'WEBP', quality=quality, method=6, optimize=True)
        elif fmt == 'PNG':
            resized.save(target_path, 'PNG', optimize=True)
        else:
            raise ValueError(f"Unsupported format: {fmt}")

        file_kb = target_path.stat().st_size / 1024
        print(f"  -> Saved {target_path.name} ({size[0]}x{size[1]}, {fmt}, {file_kb:.1f} KB)")


def main():
    project_root = Path(__file__).resolve().parent.parent
    branding_dir = project_root / 'src' / 'assets' / 'branding'
    raw_dir = branding_dir / 'raw'
    raw_dir.mkdir(parents=True, exist_ok=True)

    # Source 1: Curricula mascot (hands up, smiling)
    src_curricula = Path(r"C:\Users\A&M\.gemini\antigravity\brain\7884e37f-b482-4770-8151-7e858c83638b\.user_uploaded\media_1794333110569_1bb7de14.jpg")
    # Source 2: English hero mascot (looking left)
    src_hero_en = Path(r"C:\Users\A&M\.gemini\antigravity\brain\7884e37f-b482-4770-8151-7e858c83638b\.user_uploaded\media_1794333114089_f77c1f40.jpg")

    # Copy raw sources locally for reproducibility
    local_raw_curricula = raw_dir / "spider-mascot-curricula.jpg"
    local_raw_hero_en = raw_dir / "spider-mascot-hero-en.jpg"

    if src_curricula.exists():
        import shutil
        shutil.copy2(src_curricula, local_raw_curricula)
        print(f"Copied raw curricula source to {local_raw_curricula.name}")
    if src_hero_en.exists():
        import shutil
        shutil.copy2(src_hero_en, local_raw_hero_en)
        print(f"Copied raw hero EN source to {local_raw_hero_en.name}")

    print("\n=======================================================")
    print("1. Processing Curricula Mascot...")
    print("=======================================================")
    curricula_rgba = remove_black_background(local_raw_curricula if local_raw_curricula.exists() else src_curricula)
    save_variants(curricula_rgba, [
        {'path': branding_dir / 'spider-mascot-curricula-v3.webp', 'size': (480, 480), 'format': 'WEBP', 'quality': 85},
        {'path': branding_dir / 'spider-mascot-curricula-sm-v3.webp', 'size': (364, 364), 'format': 'WEBP', 'quality': 82},
        {'path': branding_dir / 'spider-mascot-curricula.webp', 'size': (480, 480), 'format': 'WEBP', 'quality': 85},
        {'path': branding_dir / 'spider-mascot-curricula-v3.png', 'size': (480, 480), 'format': 'PNG'},
        {'path': branding_dir / 'spider-mascot-curricula.png', 'size': (480, 480), 'format': 'PNG'},
    ])

    print("\n=======================================================")
    print("2. Processing English Hero Section Mascot...")
    print("=======================================================")
    hero_en_rgba = remove_black_background(local_raw_hero_en if local_raw_hero_en.exists() else src_hero_en)
    save_variants(hero_en_rgba, [
        {'path': branding_dir / 'spider-mascot-hero-book-v3.webp', 'size': (640, 640), 'format': 'WEBP', 'quality': 85},
        {'path': branding_dir / 'spider-mascot-hero-book-sm-v3.webp', 'size': (480, 480), 'format': 'WEBP', 'quality': 82},
        {'path': branding_dir / 'spider-mascot-hero-book-v3.png', 'size': (640, 640), 'format': 'PNG'},
        {'path': branding_dir / 'spider-mascot-hero-book.webp', 'size': (640, 640), 'format': 'WEBP', 'quality': 85},
        {'path': branding_dir / 'spider-mascot-book.webp', 'size': (640, 640), 'format': 'WEBP', 'quality': 85},
        {'path': branding_dir / 'spider-mascot-book.png', 'size': (640, 640), 'format': 'PNG'},
    ])

    print("\n✓ Mascot assets successfully generated and optimized!")

if __name__ == '__main__':
    main()
