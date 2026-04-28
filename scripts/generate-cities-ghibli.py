#!/usr/bin/env python3
"""
Generate Ghibli-style weather images for multiple cities.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/generate-cities-ghibli.py [city-slug ...]
  e.g. REPLICATE_API_TOKEN=xxx python3 scripts/generate-cities-ghibli.py new-york new-delhi san-francisco
  No args → generates all cities.
"""
import os, sys, json, urllib.request, concurrent.futures
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

BASE_DIR = Path("public/weather-images")
API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in Studio Ghibli anime style, hand-painted backgrounds, soft cel shading, lush dreamy colors, Hayao Miyazaki aesthetic, whimsical atmosphere, high detail, no text"
MAX_PARALLEL = 4

# ── City landmark definitions ──────────────────────────────────────────

CITY_LANDMARKS = {
    "new-york": [
        "Central Park with its winding paths, lush trees, and the Manhattan skyline rising behind",
        "Brooklyn Bridge spanning the East River at golden hour, with the NYC skyline behind",
        "Times Square with glowing neon signs, yellow taxis, and bustling crowds",
        "Empire State Building towering over Midtown Manhattan, surrounding art-deco rooftops",
        "Grand Central Terminal exterior with its Beaux-Arts facade, Park Avenue in front",
        "Washington Square Park with its iconic marble arch, NYU campus around, pigeons and street performers",
        "Statue of Liberty on her island, New York Harbor waters, ferries and sailboats",
    ],
    "new-delhi": [
        "India Gate monument standing tall on Rajpath boulevard, wide ceremonial avenue, lush green lawns",
        "Lotus Temple with its white marble petal architecture, reflecting pools, manicured gardens",
        "Humayun's Tomb surrounded by Mughal gardens, red sandstone and white marble domes",
        "Connaught Place circular market with its colonnaded Georgian architecture, busy shoppers",
        "Qutub Minar tall minaret tower, ancient red sandstone ruins, carved pillars",
        "Red Fort with massive red sandstone walls, Lahori Gate entrance, Mughal architecture",
        "Chandni Chowk old bazaar street, narrow lanes, colorful shops, rickshaws, street food stalls",
    ],
    "san-francisco": [
        "Golden Gate Bridge spanning the bay, orange towers piercing through fog, sailboats below",
        "Painted Ladies Victorian houses in a row with the city skyline behind, Alamo Square Park",
        "Lombard Street winding steeply down with flower-lined switchbacks, cable car visible",
        "Fisherman's Wharf with Pier 39, sea lions on docks, fishing boats, Alcatraz in the distance",
        "Coit Tower on Telegraph Hill overlooking the bay, surrounded by lush gardens and trees",
        "Chinatown gate and colorful lantern-lined Grant Avenue, pagoda-style architecture",
        "Palace of Fine Arts with its Roman rotunda reflected in the lagoon, swans on the water",
    ],
}

# ── Seasons & Conditions ──────────────────────────────────────────────

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

# ── Image generation ──────────────────────────────────────────────────

def generate_image(output_dir, filename, prompt):
    filepath = output_dir / filename
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


def generate_city(city_slug):
    landmarks = CITY_LANDMARKS[city_slug]
    output_dir = BASE_DIR / city_slug
    output_dir.mkdir(parents=True, exist_ok=True)

    jobs = []
    landmark_idx = 0
    for season_key, season_desc in SEASONS.items():
        for cond_key, cond_desc in CONDITIONS.items():
            landmark = landmarks[landmark_idx % len(landmarks)]
            landmark_idx += 1
            filename = f"{season_key}-{cond_key}.webp"
            prompt = f"{landmark}, {season_desc}, {cond_desc}, {STYLE}"
            jobs.append((filename, prompt, landmark.split(",")[0]))

    total = len(jobs)
    city_display = city_slug.replace("-", " ").title()
    print(f"\n{'='*60}")
    print(f"  {city_display} — Ghibli Set")
    print(f"  Images: {total} | Output: {output_dir}/")
    print(f"  Landmarks: {len(landmarks)} rotating")
    print(f"{'='*60}\n")

    ok = fail = skip = 0
    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        futures = {}
        for i, (filename, prompt, landmark_short) in enumerate(jobs, 1):
            print(f"  [{i}/{total}] {filename}  ({landmark_short})")
            futures[pool.submit(generate_image, output_dir, filename, prompt)] = filename

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

    total_mb = sum(f.stat().st_size for f in output_dir.glob("*.webp")) / (1024*1024)
    file_count = sum(1 for _ in output_dir.glob("*.webp"))
    print(f"\n  {city_display}: {ok} OK, {fail} failed, {skip} skipped — {file_count} files, {total_mb:.1f} MB")
    return ok, fail, skip


if __name__ == "__main__":
    # Which cities to generate?
    requested = sys.argv[1:] if len(sys.argv) > 1 else list(CITY_LANDMARKS.keys())
    invalid = [c for c in requested if c not in CITY_LANDMARKS]
    if invalid:
        print(f"Unknown city slugs: {', '.join(invalid)}")
        print(f"Available: {', '.join(CITY_LANDMARKS.keys())}")
        sys.exit(1)

    print(f"Generating Ghibli sets for: {', '.join(requested)}")
    print(f"Total images: {len(requested) * len(SEASONS) * len(CONDITIONS)}")

    grand_ok = grand_fail = grand_skip = 0
    for city in requested:
        ok, fail, skip = generate_city(city)
        grand_ok += ok
        grand_fail += fail
        grand_skip += skip

    print(f"\n{'='*60}")
    print(f"  ALL DONE: {grand_ok} OK, {grand_fail} failed, {grand_skip} skipped")
    print(f"{'='*60}")
