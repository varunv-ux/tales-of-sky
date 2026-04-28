#!/usr/bin/env python3
"""
Generate weather images for Tales of Sky — Final Production Script.
Flux 2 Dev HQ | 1440×816 | 10 cities × 4 seasons × 7 conditions = 280 + 28 generic = 308
Usage: REPLICATE_API_TOKEN=xxx python3 scripts/generate-all.py [city-slug|generic|all]
"""
import os, sys, json, urllib.request, urllib.error, concurrent.futures
from pathlib import Path

TOKEN = os.environ.get("REPLICATE_API_TOKEN")
if not TOKEN:
    print("Error: Set REPLICATE_API_TOKEN"); sys.exit(1)

API_URL = "https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE = "in watercolor style, soft edges, flowing colors, artistic, high detail, luminous atmosphere"
MAX_PARALLEL = 4
BASE_DIR = Path("public/weather-images")

# --- 10 Cities with landmark descriptions ---
CITIES = {
    "seattle": "Seattle skyline with Space Needle, Puget Sound waterfront, Pacific Northwest evergreen forests, Mount Rainier in the distance",
    "new-york": "New York City Manhattan skyline, Central Park, Brooklyn Bridge, yellow taxis on busy avenues",
    "london": "London skyline with Big Ben, Tower Bridge over the Thames, red double-decker buses, historic architecture",
    "tokyo": "Tokyo cityscape with Shibuya crossing, cherry trees along streets, neon-lit towers, Tokyo Tower on the horizon",
    "paris": "Paris with Eiffel Tower, tree-lined Seine River banks, Haussmann buildings, sidewalk cafes",
    "delhi": "Delhi with India Gate, Mughal domes and minarets, tree-lined Rajpath boulevard, bustling old city lanes",
    "dubai": "Dubai skyline with Burj Khalifa, modern glass towers reflecting sunlight, desert sand meeting turquoise ocean",
    "sydney": "Sydney with Opera House sails, Harbour Bridge arching over sparkling harbour, coastal eucalyptus trees",
    "san-francisco": "San Francisco with Golden Gate Bridge, fog rolling over green hills, Victorian painted lady houses, cable cars",
    "singapore": "Singapore with Marina Bay Sands, Gardens by the Bay Supertree Grove, tropical skyline, lush green canopy",
}

# --- Generic condition descriptions (sky/weather focused, no landscape) ---
GENERIC_CONDITIONS = {
    "clear": "A vast clear sky, bright warm sunshine casting sharp shadows, vivid blue gradient fading to soft white near the horizon, wispy light streaks",
    "partly-cloudy": "Scattered white fluffy cumulus clouds drifting across a blue sky, sunlight breaking through gaps between clouds, soft cloud shadows",
    "cloudy": "A heavy overcast sky filled with thick grey layered clouds, soft diffused light filtering through, moody and subdued atmosphere",
    "rain": "Rainfall pouring from dark grey sky, visible rain streaks and droplets, wet glistening surfaces below, grey atmosphere with scattered puddles reflecting sky",
    "thunderstorm": "A dramatic thunderstorm sky, dark purple and charcoal storm clouds, bright lightning bolt cracking through, heavy rain, electric and intense atmosphere",
    "snow": "Gentle snowfall from a pale grey-white sky, snowflakes drifting down, soft white blanket covering everything below, peaceful quiet winter atmosphere",
    "mist": "Thick mist and fog filling the air, low visibility, shapes fading into soft white haze, ethereal and dreamy atmosphere, diffused light",
}

# --- 4 Seasons ---
SEASONS = {
    "spring": "spring season, blooming flowers, fresh green leaves, cherry blossoms, soft warm golden light",
    "summer": "summer season, lush vibrant greenery, bright golden sunlight, warm saturated atmosphere",
    "autumn": "autumn season, golden and red foliage, amber warm tones, falling leaves, rich earthy palette",
    "winter": "winter season, bare branches, frost on surfaces, cold crisp atmosphere, muted cool blue-white tones",
}

# --- 7 Conditions (day/night merged, cloudy+overcast merged, drizzle+rain merged) ---
CONDITIONS = {
    "clear": "clear sky, bright sunshine or moonlight, sharp shadows, vivid blue or deep navy sky",
    "partly-cloudy": "partly cloudy sky, scattered white clouds, sunshine breaking through gaps",
    "cloudy": "heavy overcast sky, thick grey blanket of clouds, soft diffused moody light",
    "rain": "rainfall, rain streaks visible, wet reflective streets and surfaces, grey atmosphere with glistening puddles",
    "thunderstorm": "dramatic thunderstorm, dark purple storm clouds, lightning flash illuminating the scene, heavy rain, electric atmosphere",
    "snow": "gentle snowfall, snow-covered rooftops and trees, white soft blanket, peaceful serene atmosphere",
    "mist": "thick mist and fog, low visibility, ethereal dreamy atmosphere, silhouettes fading into soft haze",
}

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


def run_batch(label, output_dir, jobs):
    output_dir.mkdir(parents=True, exist_ok=True)
    total = len(jobs)
    ok = fail = skip = 0

    print(f"\n{'='*50}")
    print(f"  {label}")
    print(f"  Images: {total} | Output: {output_dir}/")
    print(f"{'='*50}\n")

    with concurrent.futures.ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        futures = {}
        for i, (filename, prompt) in enumerate(jobs, 1):
            print(f"  [{i}/{total}] {filename}")
            futures[pool.submit(generate_image, output_dir, filename, prompt)] = filename

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

    print(f"\n  Done: {ok} OK, {fail} failed, {skip} skipped")
    return ok, fail, skip


def build_jobs(landmark_desc=None, is_generic=False):
    jobs = []
    for season_key, season_desc in SEASONS.items():
        for cond_key, cond_desc in CONDITIONS.items():
            filename = f"{season_key}-{cond_key}.webp"
            if is_generic:
                prompt = f"{GENERIC_CONDITIONS[cond_key]}, {season_desc}, {STYLE}"
            else:
                prompt = f"{landmark_desc}, {season_desc}, {cond_desc}, {STYLE}"
            jobs.append((filename, prompt))
    return jobs


def main():
    target = sys.argv[1] if len(sys.argv) > 1 else "all"

    total_ok = total_fail = total_skip = 0

    if target in ("all", "generic"):
        jobs = build_jobs(is_generic=True)
        o, f, s = run_batch("Generic Fallback", BASE_DIR / "generic", jobs)
        total_ok += o; total_fail += f; total_skip += s

    for slug, desc in CITIES.items():
        if target not in ("all", slug):
            continue
        jobs = build_jobs(desc)
        o, f, s = run_batch(f"{slug.replace('-', ' ').title()}", BASE_DIR / slug, jobs)
        total_ok += o; total_fail += f; total_skip += s

    print(f"\n{'='*50}")
    print(f"  ALL DONE")
    print(f"  Total: {total_ok} OK, {total_fail} failed, {total_skip} skipped")
    # Count all webp files
    count = sum(1 for _ in BASE_DIR.rglob("*.webp"))
    size_mb = sum(f.stat().st_size for f in BASE_DIR.rglob("*.webp")) / (1024*1024)
    print(f"  Files: {count} | Size: {size_mb:.1f} MB")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
