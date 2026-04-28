#!/usr/bin/env python3
"""
Test Flux 2 Dev with higher quality settings.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/test-flux-dev-hq.py
"""
import os, sys, json, urllib.request, urllib.error
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/test-dev-hq")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"

# More detailed, structured prompts for better results
TESTS = [
    ("spring-clear", "Panoramic view of a Pacific Northwest coastal city in spring, iconic tall observation tower on the skyline, blooming cherry blossoms in foreground, Puget Sound waters sparkling under clear blue sky, Mount Rainier snow-capped in distance, warm golden afternoon light filtering through fresh green leaves, in watercolor style, soft edges, flowing colors, artistic, high detail, luminous atmosphere"),

    ("spring-rain", "Pacific Northwest coastal city on a rainy spring day, tall observation tower silhouette against grey clouds, rain falling softly on wet streets with cherry blossom petals in puddles, glowing neon reflections on wet pavement, lush green evergreen trees glistening, moody grey-green atmosphere, in watercolor style, soft edges, flowing colors, artistic, high detail"),

    ("summer-clear", "Pacific Northwest waterfront city on a bright summer day, iconic tower against vivid blue sky, sailboats dotting sparkling bay waters, lush emerald evergreen forests, golden warm sunlight, vibrant and alive, in watercolor style, soft edges, flowing colors, artistic, high detail, saturated warm tones"),

    ("summer-storm", "Pacific Northwest city skyline under dramatic summer thunderstorm, dark purple cumulonimbus clouds, fork of lightning illuminating the iconic tower, rain sweeping across the bay, moody electric atmosphere with warm ground lights contrasting cold sky, in watercolor style, soft edges, flowing colors, artistic, high detail, dramatic contrast"),

    ("autumn-overcast", "Pacific Northwest city in autumn under soft overcast sky, golden and amber maple trees lining streets, iconic tower emerging from low clouds, warm orange and russet foliage, diffused silvery light, cozy moody atmosphere, in watercolor style, soft edges, flowing colors, artistic, high detail, rich warm palette"),

    ("autumn-mist", "Pacific Northwest city shrouded in autumn morning fog, iconic tower tip barely visible above a sea of low clouds, golden trees as silhouettes, ethereal and dreamlike, soft filtered light, mysterious peaceful atmosphere, in watercolor style, soft edges, flowing colors, artistic, high detail, muted palette"),

    ("winter-snow", "Pacific Northwest city blanketed in rare winter snow, iconic tower dusted white against pale grey sky, snow-covered rooftops and evergreen branches, quiet residential streets with warm amber window lights glowing, peaceful serene winter morning, in watercolor style, soft edges, flowing colors, artistic, high detail, cool blue-white palette"),

    ("winter-night", "Pacific Northwest city skyline on a clear winter night, iconic tower illuminated against deep navy sky, crisp cold atmosphere, frost on rooftops catching moonlight, city lights reflecting warm gold on dark bay waters, stars faintly visible, in watercolor style, soft edges, flowing colors, artistic, high detail, rich contrast"),
]

for i, (name, prompt) in enumerate(TESTS, 1):
    filename = f"{name}.webp"
    filepath = OUTPUT_DIR / filename

    if filepath.exists():
        print(f"  SKIP {filename}"); continue

    print(f"[{i}/8] {name}")

    payload = json.dumps({
        "input": {
            "prompt": prompt,
            "aspect_ratio": "custom",
            "width": 1344,
            "height": 768,
            "go_fast": False,
            "output_format": "webp",
            "output_quality": 95,
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
