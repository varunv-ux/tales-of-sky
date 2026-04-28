#!/usr/bin/env python3
"""
Test Studio Ghibli style weather images — 10 samples.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/test-ghibli.py
"""
import os, sys, json, urllib.request
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/test-ghibli")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in Studio Ghibli anime style, hand-painted backgrounds, soft cel shading, lush dreamy colors, Hayao Miyazaki aesthetic, whimsical atmosphere, high detail"

TESTS = [
    ("seattle-spring-clear", f"Seattle skyline with Space Needle, cherry blossoms in full bloom, Puget Sound sparkling, clear blue spring sky, warm golden light, {STYLE}"),
    ("seattle-autumn-rain", f"Seattle Pike Place Market on a rainy autumn day, wet cobblestone streets reflecting warm lights, orange and red leaves, grey moody sky, {STYLE}"),
    ("seattle-winter-snow", f"Seattle covered in gentle winter snow, Space Needle dusted white, cozy warm window lights glowing, quiet peaceful streets, soft grey sky, {STYLE}"),
    ("ny-spring-clear", f"Central Park New York in spring, blooming cherry trees and tulips, Bow Bridge over calm lake, Manhattan skyline beyond green canopy, clear sky, {STYLE}"),
    ("ny-autumn-rain", f"Brooklyn Bridge New York on a rainy autumn evening, golden leaves falling, wet streets with reflections, yellow taxis, Manhattan skyline in fog, {STYLE}"),
    ("tokyo-summer-clear", f"Tokyo Shibuya district on a bright summer day, bustling streets, cherry trees, neon signs, Tokyo Tower in distance, vivid blue sky, {STYLE}"),
    ("tokyo-winter-snow", f"Tokyo temple grounds in winter snowfall, traditional pagoda dusted with snow, bare cherry trees, lanterns glowing warm, peaceful and quiet, {STYLE}"),
    ("paris-autumn-mist", f"Eiffel Tower Paris on a misty autumn morning, golden trees along the Seine, soft fog wrapping the iron lattice, warm amber tones, {STYLE}"),
    ("london-winter-snow", f"Big Ben and Houses of Parliament London in winter snow, Thames River, snowflakes falling, warm streetlights against cold grey sky, {STYLE}"),
    ("dubai-summer-clear", f"Dubai skyline with Burj Khalifa under scorching summer sun, heat shimmer, golden desert sand meeting turquoise Persian Gulf waters, {STYLE}"),
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
            "width": 1280,
            "height": 720,
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
