#!/usr/bin/env python3
"""
Generate remaining generic condition-focused Ghibli weather images.
Same zoomed-in sky style as the first 10.
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

# The 14 remaining season+condition combos
IMAGES = [
    # Spring missing: cloudy, thunderstorm, snow, mist
    ("spring-cloudy",       "Soft grey spring clouds blanketing the sky, layered overcast with hints of warmth trying to break through, pale diffused light, gentle and subdued, cherry blossom petals caught in still air"),
    ("spring-thunderstorm", "Dark spring storm clouds rolling in, dramatic purple-grey thunderheads building upward, lightning flickering inside the clouds, wind-blown rain beginning to fall, electric tension"),
    ("spring-snow",         "Late spring snow flurries falling from a pale grey sky, delicate snowflakes mixing with cherry blossom petals, surreal and magical, soft pink and white against grey clouds"),
    ("spring-mist",         "Thick spring morning mist, soft white fog filling the view, faint green tree shapes barely visible through the haze, dewdrops suspended in air, warm diffused golden light glowing through"),

    # Summer missing: cloudy, rain, snow, mist
    ("summer-cloudy",       "Heavy summer clouds piling up across the sky, towering white and grey cumulus formations, muggy and humid atmosphere, hazy sunlight trying to push through gaps, warm and oppressive"),
    ("summer-rain",         "Monsoon-like summer rain pouring from dark clouds, heavy sheets of water falling, warm rain visible against a dark grey sky, tropical intensity, steam rising from below"),
    ("summer-snow",         "Surreal summer hailstorm, ice pellets falling from a dark sky against patches of blue, dramatic contrast of cold and warm, unusual and striking atmosphere"),
    ("summer-mist",         "Summer morning haze, warm golden mist rising upward, sun barely visible as a glowing orb through thick humid air, everything soft and diffused, dreamy summer dawn"),

    # Autumn missing: thunderstorm, snow, mist
    ("autumn-thunderstorm", "Violent autumn thunderstorm, dark brooding clouds lit by orange lightning, wind-whipped red and gold leaves spiraling through the air, dramatic and moody, rain lashing sideways"),
    ("autumn-snow",         "Early autumn snow falling gently, white flakes against a backdrop of remaining golden-orange foliage, grey sky, surprising and beautiful contrast of seasons colliding"),
    ("autumn-mist",         "Dense autumn fog, warm amber light filtering through thick mist, silhouettes of bare branches fading into haze, fallen leaves suspended in still misty air, melancholy beauty"),

    # Winter missing: cloudy, rain, thunderstorm
    ("winter-cloudy",       "Heavy winter overcast, thick uniform grey clouds pressing low, cold flat light, bare dark branches reaching upward into the grey void, bleak and quiet, monochrome palette"),
    ("winter-rain",         "Cold winter rain falling from low dark clouds, icy raindrops streaking down, sleet mixed with rain, grey and steel-blue sky, raw and bitter atmosphere, puddles forming"),
    ("winter-thunderstorm", "Rare winter thunderstorm, dark clouds lit by blue-white lightning, sleet and rain mixing, dramatic flash illuminating ice crystals in the air, powerful and eerie"),
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

print(f"=== Generic Condition Images — Remaining 14 ===")
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
print(f"Total generic: {sum(1 for _ in OUTPUT_DIR.glob('*.webp'))} files, {total_mb:.1f} MB")
