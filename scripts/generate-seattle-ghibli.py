#!/usr/bin/env python3
"""
Generate Seattle Ghibli-style images with varied landmarks per condition/season.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/generate-seattle-ghibli.py
"""
import os, sys, json, urllib.request, concurrent.futures
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/seattle")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in Studio Ghibli anime style, hand-painted backgrounds, soft cel shading, lush dreamy colors, Hayao Miyazaki aesthetic, whimsical atmosphere, high detail, no text"
MAX_PARALLEL = 4

# Different Seattle landmarks — rotate through them
LANDMARKS = [
    "Seattle Space Needle towering over the city skyline, Puget Sound in the background",
    "Pike Place Market with its iconic neon sign, cobblestone streets, colorful fruit vendors and flower stalls",
    "Seattle waterfront with the Great Wheel ferris wheel, Elliott Bay, sailboats and ferry boats",
    "Gas Works Park overlooking Lake Union, rustic industrial ruins covered in vines, houseboats on the water",
    "Kerry Park viewpoint looking over the city, sweeping panoramic vista of downtown and Mount Rainier",
    "University of Washington campus, cherry tree-lined Quad walkway, Gothic architecture",
    "Pioneer Square historic district, ornate brick buildings, iron pergola, old street lamps",
]

SEASONS = {
    "spring": "spring season, blooming cherry blossoms, fresh green leaves, soft warm golden light, tulips and daffodils",
    "summer": "summer season, lush vibrant greenery, bright golden sunlight, long warm evenings, wildflowers",
    "autumn": "autumn season, golden and crimson maple foliage, amber warm tones, fallen leaves on paths",
    "winter": "winter season, bare branches, frost on surfaces, cozy warm window lights, cold crisp atmosphere",
}

CONDITIONS = {
    "clear": "clear blue sky, bright sunshine, sharp shadows, vivid colors",
    "partly-cloudy": "partly cloudy sky, scattered white clouds, sunshine breaking through",
    "cloudy": "heavy overcast sky, thick grey clouds, soft diffused moody light",
    "rain": "rainfall, rain streaks, wet reflective streets, glistening puddles, grey sky",
    "thunderstorm": "dramatic thunderstorm, dark storm clouds, lightning flash, heavy rain, electric mood",
    "snow": "gentle snowfall, snow-covered rooftops and trees, white blanket, peaceful quiet",
    "mist": "thick mist and fog, low visibility, ethereal dreamy, silhouettes fading into haze",
}

def generate_image(filename, prompt):
    filepath = OUTPUT_DIR / filename
    if filepath.exists():
        return ("SKIP", filename, 0)

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
        return ("FAIL", filename, str(e))

    output = data.get("output", "")
    if isinstance(output, list): output = output[0] if output else ""
    if not output:
        return ("FAIL", filename, data.get("error", "no output"))

    try:
        urllib.request.urlretrieve(output, str(filepath))
        kb = filepath.stat().st_size / 1024
        return ("OK", filename, kb)
    except Exception as e:
        return ("FAIL", filename, str(e))


# Build jobs — each combo gets a different landmark
jobs = []
landmark_idx = 0
for season_key, season_desc in SEASONS.items():
    for cond_key, cond_desc in CONDITIONS.items():
        landmark = LANDMARKS[landmark_idx % len(LANDMARKS)]
        landmark_idx += 1
        filename = f"{season_key}-{cond_key}.webp"
        prompt = f"{landmark}, {season_desc}, {cond_desc}, {STYLE}"
        jobs.append((filename, prompt, landmark.split(",")[0]))

total = len(jobs)
print(f"=== Seattle Ghibli — Varied Landmarks ===")
print(f"Images: {total} | Output: {OUTPUT_DIR}/")
print(f"Landmarks: {len(LANDMARKS)} rotating\n")

ok = fail = skip = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
    futures = {}
    for i, (filename, prompt, landmark_short) in enumerate(jobs, 1):
        print(f"  [{i}/{total}] {filename}  ({landmark_short})")
        futures[pool.submit(generate_image, filename, prompt)] = filename

    for future in concurrent.futures.as_completed(futures):
        status, fname, detail = future.result()
        if status == "OK":
            print(f"    OK   {fname} ({detail:.0f} KB)")
            ok += 1
        elif status == "SKIP":
            print(f"    SKIP {fname}")
            skip += 1
        else:
            print(f"    FAIL {fname} — {detail}")
            fail += 1

print(f"\nDone: {ok} OK, {fail} failed, {skip} skipped")
total_mb = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.webp")) / (1024*1024)
print(f"Total: {sum(1 for _ in OUTPUT_DIR.glob('*.webp'))} files, {total_mb:.1f} MB")
