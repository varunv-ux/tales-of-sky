#!/usr/bin/env python3
"""
Generate generic condition-focused Ghibli weather images.
These are fallbacks for cities without dedicated image sets.
Focus: weather condition atmosphere, not specific landmarks.

Usage: REPLICATE_API_TOKEN=xxx python3 scripts/generate-generic-conditions.py
"""
import os, sys, json, urllib.request, concurrent.futures
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

OUTPUT_DIR = Path("public/weather-images/generic")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in Studio Ghibli anime style, hand-painted, soft cel shading, lush dreamy colors, Hayao Miyazaki aesthetic, high detail, no text, no people, no buildings, close-up sky view, looking upward, atmospheric, filling the entire frame"
MAX_PARALLEL = 4

# 10 images: zoomed-in sky/weather focused — the condition IS the subject
IMAGES = [
    ("spring-clear",        "Expansive clear blue spring sky seen from below, a few cherry blossom petals floating through the air, warm golden sunlight streaming through, wispy cirrus clouds barely visible, bright and hopeful"),
    ("spring-rain",         "Close-up view of rain falling from dark grey spring clouds, raindrops streaking downward, heavy overcast sky with layers of nimbus clouds, wet atmosphere, light filtering dimly through cloud gaps"),
    ("summer-clear",        "Blazing summer sky, deep blue with towering white cumulus clouds, intense golden sunlight, heat shimmer visible, dramatic cloud formations lit from behind, warm and vivid"),
    ("summer-thunderstorm", "Dramatic close-up of a massive dark thunderstorm cloud filling the sky, lightning bolt cracking through, deep purple and charcoal storm clouds, rain curtain visible below, electric and intense"),
    ("autumn-clear",        "Crisp autumn sky, pale blue with golden-hour amber light, a few scattered clouds tinged orange and pink, tree canopy of red and gold leaves framing the edges, warm nostalgic glow"),
    ("autumn-cloudy",       "Heavy grey overcast autumn sky filling the frame, thick layered clouds in shades of slate and pewter, muted diffused light, moody and contemplative, occasional break showing pale light"),
    ("autumn-rain",         "Rain pouring from thick dark autumn clouds, close view of rainfall against grey sky, raindrops visible in the air, streaks of water, wet misty atmosphere, melancholy beauty"),
    ("winter-clear",        "Cold crisp winter sky, pale icy blue, bare dark tree branches silhouetted against it, frost crystals sparkling in the air, sharp winter sunlight low on the horizon, clean and still"),
    ("winter-snow",         "Close-up of snowflakes falling from a soft grey-white winter sky, thick gentle snowfall filling the frame, each flake visible, peaceful and hushed, cotton-like clouds above"),
    ("winter-mist",         "Thick winter fog filling the entire view, layers of white and grey mist, barely visible shapes fading into haze, ethereal and dreamlike, soft diffused light glowing through"),
]

def generate_image(filename, prompt):
    filepath = OUTPUT_DIR / filename
    if filepath.exists():
        return ("SKIP", filename, 0)

    payload = json.dumps({
        "input": {
            "prompt": f"{prompt}, {STYLE}",
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


jobs = [(f"{name}.webp", prompt) for name, prompt in IMAGES]
total = len(jobs)

print(f"=== Generic Condition Images (Ghibli) ===")
print(f"Images: {total} | Output: {OUTPUT_DIR}/\n")

ok = fail = skip = 0
with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
    futures = {}
    for i, (filename, prompt) in enumerate(jobs, 1):
        print(f"  [{i}/{total}] {filename}")
        futures[pool.submit(generate_image, filename, prompt)] = filename

    for future in concurrent.futures.as_completed(futures):
        status, fname, detail = future.result()
        if status == "OK":
            print(f"    ✓ {fname} ({detail:.0f} KB)")
            ok += 1
        elif status == "SKIP":
            print(f"    ⊘ {fname} (exists)")
            skip += 1
        else:
            print(f"    ✗ {fname} — {detail}")
            fail += 1

print(f"\nDone: {ok} OK, {fail} failed, {skip} skipped")
total_mb = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.webp")) / (1024*1024)
print(f"Total: {sum(1 for _ in OUTPUT_DIR.glob('*.webp'))} files, {total_mb:.1f} MB")
