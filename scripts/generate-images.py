#!/usr/bin/env python3
"""
Generate weather images for Tales of Sky using Replicate Flux 2 Dev.
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/generate-images.py seattle
"""
import os
import sys
import json
import urllib.request
import urllib.error
import concurrent.futures
from pathlib import Path

CITY = sys.argv[1] if len(sys.argv) > 1 else None
if not CITY:
    print("Usage: python3 scripts/generate-images.py <city-name>")
    sys.exit(1)

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN env var")
    sys.exit(1)

CITY_SLUG = CITY.lower().replace(" ", "-")
OUTPUT_DIR = Path(f"public/weather-images/{CITY_SLUG}")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in watercolor style, soft edges, flowing colors, artistic"
MAX_PARALLEL = 4

CITY_DESC = {
    "seattle": "Seattle skyline with Space Needle, Puget Sound waterfront, Pacific Northwest evergreen trees",
    "new-york": "New York City Manhattan skyline, Central Park, Brooklyn Bridge, yellow taxis",
    "london": "London skyline with Big Ben, Tower Bridge, Thames River, red telephone boxes",
    "tokyo": "Tokyo cityscape with Shibuya crossing, cherry trees, neon-lit streets, Tokyo Tower",
    "paris": "Paris with Eiffel Tower, Seine River, Haussmann buildings, tree-lined boulevards",
    "delhi": "Delhi with India Gate, Mughal architecture, bustling markets, ancient monuments",
    "mumbai": "Mumbai with Marine Drive, Gateway of India, Arabian Sea coastline, art deco buildings",
    "dubai": "Dubai skyline with Burj Khalifa, modern glass towers, desert meeting ocean",
    "singapore": "Singapore with Marina Bay Sands, Gardens by the Bay, Supertree Grove, tropical skyline",
    "sydney": "Sydney with Opera House, Harbour Bridge, sparkling harbour, coastal eucalyptus",
    "los-angeles": "Los Angeles with Hollywood Hills, palm tree lined boulevards, Pacific coast",
    "chicago": "Chicago skyline along Lake Michigan, Willis Tower, Art Deco architecture, river walk",
    "toronto": "Toronto with CN Tower, Lake Ontario waterfront, glass towers, urban parks",
    "san-francisco": "San Francisco with Golden Gate Bridge, fog rolling over hills, Victorian houses",
    "berlin": "Berlin with Brandenburg Gate, Spree River, mix of historic and modern architecture",
    "seoul": "Seoul with Namsan Tower, Bukchon hanok village, modern K-culture skyline, mountains",
    "bangkok": "Bangkok with Wat Arun temple, Chao Phraya River, ornate spires, tropical vegetation",
    "istanbul": "Istanbul with Hagia Sophia, Blue Mosque, Bosphorus strait, minarets at horizon",
    "cairo": "Cairo with pyramids of Giza in distance, Nile River, ancient meets modern cityscape",
    "sao-paulo": "São Paulo dense urban skyline, Ibirapuera Park, tropical trees among concrete",
    "hong-kong": "Hong Kong Victoria Harbour, dense skyscrapers, Star Ferry, neon reflections",
    "redmond": "Redmond Washington with lush evergreen forests, tech campus, Cascade foothills",
    "santorini": "Santorini white-washed buildings, blue domed churches, Aegean Sea, cliff views",
    "shanghai": "Shanghai with The Bund, Pudong skyline, Oriental Pearl Tower, Huangpu River",
    "mexico-city": "Mexico City with Palacio de Bellas Artes, Chapultepec Park, colonial architecture",
}

SEASONS = {
    "spring": "spring season, blooming flowers, fresh green leaves, soft warm light",
    "summer": "summer season, lush vibrant greenery, bright golden sunlight, warm atmosphere",
    "autumn": "autumn season, golden and red foliage, amber warm tones, falling leaves",
    "winter": "winter season, bare branches, frost, cold crisp atmosphere, muted cool tones",
}

CONDITIONS = {
    "clear-day": "clear blue sky, bright sunshine, warm daylight, sharp shadows",
    "clear-night": "clear night sky, stars visible, moonlight glow, deep dark blue atmosphere",
    "partly-cloudy-day": "partly cloudy sky, scattered white clouds, sunshine breaking through",
    "partly-cloudy-night": "partly cloudy night, moon peeking through clouds, soft dim blue light",
    "cloudy": "overcast cloudy sky, thick grey-white clouds, soft diffused light",
    "overcast": "heavy overcast sky, dark grey blanket of clouds, moody subdued light",
    "drizzle": "light drizzle, fine rain mist, wet glistening surfaces, grey-green atmosphere",
    "rain-day": "daytime rainfall, rain streaks, wet reflective streets, grey sky with light",
    "rain-night": "nighttime rain, rain falling through streetlights, wet reflections, dark moody",
    "thunderstorm-day": "dramatic daytime thunderstorm, dark storm clouds, lightning flash, heavy rain",
    "thunderstorm-night": "nighttime thunderstorm, lightning bolts illuminating sky, electric purple clouds",
    "snow": "gentle snowfall, snow-covered rooftops and trees, white soft blanket, peaceful",
    "mist": "thick mist and fog, low visibility, ethereal dreamy atmosphere, silhouettes fading",
}

LANDMARK = CITY_DESC.get(CITY_SLUG, f"{CITY} cityscape with iconic landmarks")


def generate_image(season, condition):
    filename = f"{season}-{condition}.webp"
    filepath = OUTPUT_DIR / filename

    if filepath.exists():
        print(f"  SKIP {filename} (exists)")
        return True

    prompt = f"{LANDMARK}, {SEASONS[season]}, {CONDITIONS[condition]}, {STYLE}"

    payload = json.dumps({
        "input": {
            "prompt": prompt,
            "aspect_ratio": "16:9",
            "output_format": "webp",
            "output_quality": 95,
        }
    }).encode()

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "Prefer": "wait",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read())
    except (urllib.error.URLError, urllib.error.HTTPError, json.JSONDecodeError) as e:
        print(f"  FAIL {filename} — {e}")
        return False

    output = data.get("output", "")
    if isinstance(output, list):
        output = output[0] if output else ""
    if not output:
        err = data.get("error", "no output URL")
        print(f"  FAIL {filename} — {err}")
        return False

    # Download
    try:
        urllib.request.urlretrieve(output, str(filepath))
        size_kb = filepath.stat().st_size / 1024
        print(f"  OK   {filename} ({size_kb:.0f} KB)")
        return True
    except Exception as e:
        print(f"  FAIL {filename} download — {e}")
        return False


def main():
    jobs = [(s, c) for s in SEASONS for c in CONDITIONS]
    total = len(jobs)
    print("=== Tales of Sky Image Generator ===")
    print(f"City: {CITY} ({CITY_SLUG})")
    print(f"Images to generate: {total}")
    print(f"Output: {OUTPUT_DIR}/")
    print(f"Model: flux-2-dev | Format: webp | Aspect: 16:9 | Quality: 95")
    print(f"Parallel: {MAX_PARALLEL}")
    print()

    ok = 0
    fail = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        futures = {}
        for i, (season, condition) in enumerate(jobs, 1):
            print(f"[{i}/{total}] {season} / {condition}")
            futures[pool.submit(generate_image, season, condition)] = (season, condition)

        for future in concurrent.futures.as_completed(futures):
            if future.result():
                ok += 1
            else:
                fail += 1

    print()
    print("=== Done ===")
    print(f"Success: {ok} | Failed: {fail}")
    count = len(list(OUTPUT_DIR.glob("*.webp")))
    print(f"Files in {OUTPUT_DIR}/: {count}")
    total_mb = sum(f.stat().st_size for f in OUTPUT_DIR.glob("*.webp")) / (1024 * 1024)
    print(f"Total size: {total_mb:.1f} MB")


if __name__ == "__main__":
    main()
