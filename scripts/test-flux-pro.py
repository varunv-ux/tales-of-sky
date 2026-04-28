#!/usr/bin/env python3
"""
Test Flux 2 Pro image generation for Tales of Sky.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/test-flux-pro.py
"""
import os, sys, json, urllib.request, urllib.error
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/test-pro")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-pro/predictions"
STYLE = "in watercolor style, soft edges, flowing colors, artistic"
LANDMARK = "Seattle skyline with Space Needle, Puget Sound waterfront, Pacific Northwest evergreen trees"

# 8 test images: 2 seasons x 4 conditions
TESTS = [
    ("spring", "clear day, bright sunshine, warm daylight, blue sky"),
    ("spring", "heavy rain, wet streets, grey sky, rain streaks"),
    ("summer", "golden sunset, warm haze, vibrant greenery"),
    ("summer", "thunderstorm, dark clouds, lightning, dramatic"),
    ("autumn", "overcast, grey clouds, golden foliage, moody light"),
    ("autumn", "mist and fog, silhouettes fading, ethereal dreamy"),
    ("winter", "snow covered rooftops, gentle snowfall, peaceful white"),
    ("winter", "clear night, stars, moonlight, deep blue atmosphere"),
]

for i, (season, condition) in enumerate(TESTS, 1):
    slug = condition.split(",")[0].replace(" ", "-")
    filename = f"{season}-{slug}.webp"
    filepath = OUTPUT_DIR / filename

    if filepath.exists():
        print(f"  SKIP {filename}"); continue

    prompt = f"{LANDMARK}, {season} season, {condition}, {STYLE}"
    print(f"[{i}/8] {filename}")
    print(f"       {prompt[:80]}...")

    payload = json.dumps({
        "input": {
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "output_format": "webp",
            "output_quality": 95,
            "safety_tolerance": 5,
        }
    }).encode()

    req = urllib.request.Request(API_URL, data=payload, headers={
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "Prefer": "wait",
    }, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
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

print("\nDone! Check:", OUTPUT_DIR)
