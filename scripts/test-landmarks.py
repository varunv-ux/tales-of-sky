#!/usr/bin/env python3
"""
Test Flux 2 Dev HQ with real city landmark names.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/test-landmarks.py
"""
import os, sys, json, urllib.request
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/test-landmarks-hq")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in watercolor style, soft edges, flowing colors, artistic, high detail, luminous atmosphere"

TESTS = [
    ("seattle-space-needle", f"Seattle Space Needle towering over the city skyline, cherry blossoms in spring, Puget Sound in background, clear blue sky, warm golden light, {STYLE}"),
    ("seattle-pike-place", f"Pike Place Market in Seattle on a rainy autumn evening, wet cobblestone streets reflecting neon signs, vendors with colorful produce, overcast moody grey sky, {STYLE}"),
    ("seattle-waterfront", f"Seattle waterfront with Great Wheel ferris wheel, Elliott Bay sparkling under summer sunset, sailboats on the water, Mount Rainier glowing pink in distance, {STYLE}"),
    ("seattle-gasworks", f"Gas Works Park Seattle overlooking Lake Union, industrial ruins covered in ivy, houseboats on the water, winter snow dusting the ground, cloudy sky, {STYLE}"),
    ("seattle-kerry-park", f"View from Kerry Park Seattle at night, city skyline with Space Needle illuminated, deep navy sky with stars, twinkling city lights, crisp winter air, {STYLE}"),
    ("ny-brooklyn-bridge", f"Brooklyn Bridge New York City in autumn rain, golden leaves falling, wet pavement reflections, yellow taxis crossing, Manhattan skyline behind fog, {STYLE}"),
    ("ny-central-park", f"Central Park New York City in spring, blooming cherry trees and tulips, Bow Bridge over the lake, Manhattan skyscrapers rising behind fresh green canopy, {STYLE}"),
    ("tokyo-shibuya", f"Shibuya Crossing Tokyo on a rainy night, neon lights reflecting on wet streets, crowds with umbrellas, electric atmosphere, towering billboards, {STYLE}"),
    ("paris-eiffel", f"Eiffel Tower Paris on a misty autumn morning, golden trees along the Seine, soft fog wrapping the iron lattice, warm amber and grey tones, {STYLE}"),
    ("london-big-ben", f"Big Ben and Houses of Parliament London in winter snow, Thames River partly frozen, snowflakes falling, warm streetlights against cold grey sky, {STYLE}"),
]

for i, (name, prompt) in enumerate(TESTS, 1):
    filename = f"{name}.webp"
    filepath = OUTPUT_DIR / filename

    if filepath.exists():
        print(f"  SKIP {filename}"); continue

    print(f"[{i}/{len(TESTS)}] {name}")

    payload = json.dumps({
        "input": {
            "prompt": prompt,
            "aspect_ratio": "custom",
            "width": 1440,
            "height": 816,
            "go_fast": False,
            "output_format": "webp",
            "output_quality": 100,
            "disable_safety_checker": True,
        }
    }).encode()

    req = urllib.request.Request(API_URL, data=payload, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "Prefer": "wait",
    }, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=180) as resp:
            data = json.loads(resp.read())
    except Exception as e:
        print(f"  FAIL — {e}"); continue

    output = data.get("output", "")
    if isinstance(output, list): output = output[0] if output else ""
    if not output:
        print(f"  FAIL — {data.get('error', 'no output')}"); continue

    urllib.request.urlretrieve(output, str(filepath))
    kb = filepath.stat().st_size / 1024
    print(f"  OK   {filename} ({kb:.0f} KB)")

print(f"\nDone! Check: {OUTPUT_DIR}")
