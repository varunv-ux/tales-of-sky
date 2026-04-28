#!/bin/bash
# Generate weather images for Tales of Sky using Replicate Flux 2 Dev
# Usage: REPLICATE_API_TOKEN=r8_xxx ./scripts/generate-images.sh seattle

set -euo pipefail

CITY="${1:?Usage: $0 <city-name>}"
CITY_SLUG=$(echo "$CITY" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
OUTPUT_DIR="public/weather-images/${CITY_SLUG}"
API_URL="https://api.replicate.com/v1/models/black-forest-labs/flux-2-dev/predictions"
STYLE="in watercolor style, soft edges, flowing colors, artistic"
MAX_PARALLEL=4

: "${REPLICATE_API_TOKEN:?Set REPLICATE_API_TOKEN env var}"

mkdir -p "$OUTPUT_DIR"

# --- City landmark descriptions ---
declare -A CITY_DESC
CITY_DESC[seattle]="Seattle skyline with Space Needle, Puget Sound waterfront, Pacific Northwest evergreen trees"
CITY_DESC[new-york]="New York City Manhattan skyline, Central Park, Brooklyn Bridge, yellow taxis"
CITY_DESC[london]="London skyline with Big Ben, Tower Bridge, Thames River, red telephone boxes"
CITY_DESC[tokyo]="Tokyo cityscape with Shibuya crossing, cherry trees, neon-lit streets, Tokyo Tower"
CITY_DESC[paris]="Paris with Eiffel Tower, Seine River, Haussmann buildings, tree-lined boulevards"
CITY_DESC[delhi]="Delhi with India Gate, Mughal architecture, bustling markets, ancient monuments"
CITY_DESC[mumbai]="Mumbai with Marine Drive, Gateway of India, Arabian Sea coastline, art deco buildings"
CITY_DESC[dubai]="Dubai skyline with Burj Khalifa, modern glass towers, desert meeting ocean"
CITY_DESC[singapore]="Singapore with Marina Bay Sands, Gardens by the Bay, Supertree Grove, tropical skyline"
CITY_DESC[sydney]="Sydney with Opera House, Harbour Bridge, sparkling harbour, coastal eucalyptus"
CITY_DESC[los-angeles]="Los Angeles with Hollywood Hills, palm tree lined boulevards, Pacific coast"
CITY_DESC[chicago]="Chicago skyline along Lake Michigan, Willis Tower, Art Deco architecture, river walk"
CITY_DESC[toronto]="Toronto with CN Tower, Lake Ontario waterfront, glass towers, urban parks"
CITY_DESC[san-francisco]="San Francisco with Golden Gate Bridge, fog rolling over hills, Victorian houses"
CITY_DESC[berlin]="Berlin with Brandenburg Gate, Spree River, mix of historic and modern architecture"
CITY_DESC[seoul]="Seoul with Namsan Tower, Bukchon hanok village, modern K-culture skyline, mountains"
CITY_DESC[bangkok]="Bangkok with Wat Arun temple, Chao Phraya River, ornate spires, tropical vegetation"
CITY_DESC[istanbul]="Istanbul with Hagia Sophia, Blue Mosque, Bosphorus strait, minarets at horizon"
CITY_DESC[cairo]="Cairo with pyramids of Giza in distance, Nile River, ancient meets modern cityscape"
CITY_DESC[sao-paulo]="São Paulo dense urban skyline, Ibirapuera Park, tropical trees among concrete"
CITY_DESC[hong-kong]="Hong Kong Victoria Harbour, dense skyscrapers, Star Ferry, neon reflections"
CITY_DESC[redmond]="Redmond Washington with lush evergreen forests, tech campus, Cascade foothills"
CITY_DESC[santorini]="Santorini white-washed buildings, blue domed churches, Aegean Sea, cliff views"
CITY_DESC[shanghai]="Shanghai with The Bund, Pudong skyline, Oriental Pearl Tower, Huangpu River"
CITY_DESC[mexico-city]="Mexico City with Palacio de Bellas Artes, Chapultepec Park, colonial architecture"

LANDMARK="${CITY_DESC[$CITY_SLUG]:-$CITY cityscape with iconic landmarks}"

# --- Seasons ---
declare -A SEASON_DESC
SEASON_DESC[spring]="spring season, blooming flowers, fresh green leaves, soft warm light"
SEASON_DESC[summer]="summer season, lush vibrant greenery, bright golden sunlight, warm atmosphere"
SEASON_DESC[autumn]="autumn season, golden and red foliage, amber warm tones, falling leaves"
SEASON_DESC[winter]="winter season, bare branches, frost, cold crisp atmosphere, muted cool tones"

# --- Weather conditions (matching icon map) ---
declare -A CONDITION_DESC
CONDITION_DESC[clear-day]="clear blue sky, bright sunshine, warm daylight, sharp shadows"
CONDITION_DESC[clear-night]="clear night sky, stars visible, moonlight glow, deep dark blue atmosphere"
CONDITION_DESC[partly-cloudy-day]="partly cloudy sky, scattered white clouds, sunshine breaking through"
CONDITION_DESC[partly-cloudy-night]="partly cloudy night, moon peeking through clouds, soft dim blue light"
CONDITION_DESC[cloudy]="overcast cloudy sky, thick grey-white clouds, soft diffused light"
CONDITION_DESC[overcast]="heavy overcast sky, dark grey blanket of clouds, moody subdued light"
CONDITION_DESC[drizzle]="light drizzle, fine rain mist, wet glistening surfaces, grey-green atmosphere"
CONDITION_DESC[rain-day]="daytime rainfall, rain streaks, wet reflective streets, grey sky with light"
CONDITION_DESC[rain-night]="nighttime rain, rain falling through streetlights, wet reflections, dark moody"
CONDITION_DESC[thunderstorm-day]="dramatic daytime thunderstorm, dark storm clouds, lightning flash, heavy rain"
CONDITION_DESC[thunderstorm-night]="nighttime thunderstorm, lightning bolts illuminating sky, electric purple clouds"
CONDITION_DESC[snow]="gentle snowfall, snow-covered rooftops and trees, white soft blanket, peaceful"
CONDITION_DESC[mist]="thick mist and fog, low visibility, ethereal dreamy atmosphere, silhouettes fading"

SEASONS=(spring summer autumn winter)
CONDITIONS=(clear-day clear-night partly-cloudy-day partly-cloudy-night cloudy overcast drizzle rain-day rain-night thunderstorm-day thunderstorm-night snow mist)

TOTAL=$(( ${#SEASONS[@]} * ${#CONDITIONS[@]} ))
COUNT=0
FAILED=0
RUNNING=0

echo "=== Tales of Sky Image Generator ==="
echo "City: $CITY ($CITY_SLUG)"
echo "Images to generate: $TOTAL"
echo "Output: $OUTPUT_DIR/"
echo "Model: flux-2-dev"
echo "Parallel: $MAX_PARALLEL"
echo ""

generate_image() {
  local season="$1"
  local condition="$2"
  local filename="${season}-${condition}.webp"
  local filepath="${OUTPUT_DIR}/${filename}"

  # Skip if already exists
  if [[ -f "$filepath" ]]; then
    echo "  SKIP $filename (exists)"
    return 0
  fi

  local prompt="${LANDMARK}, ${SEASON_DESC[$season]}, ${CONDITION_DESC[$condition]}, ${STYLE}"

  # Call Replicate API
  local response
  response=$(curl --silent --show-error "$API_URL" \
    --request POST \
    --header "Authorization: Bearer $REPLICATE_API_TOKEN" \
    --header "Content-Type: application/json" \
    --header "Prefer: wait" \
    --data "{
      \"input\": {
        \"prompt\": \"${prompt}\",
        \"aspect_ratio\": \"16:9\",
        \"output_format\": \"webp\",
        \"output_quality\": 95
      }
    }" 2>&1)

  # Extract output URL
  local output_url
  output_url=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('output','') if isinstance(d.get('output',''),str) else d['output'][0] if isinstance(d.get('output'),list) and d['output'] else '')" 2>/dev/null || echo "")

  if [[ -z "$output_url" ]]; then
    local err
    err=$(echo "$response" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error','unknown'))" 2>/dev/null || echo "unknown")
    echo "  FAIL $filename — $err"
    return 1
  fi

  # Download image
  curl --silent --show-error -o "$filepath" "$output_url"
  local size
  size=$(du -h "$filepath" | cut -f1)
  echo "  OK   $filename ($size)"
  return 0
}

for season in "${SEASONS[@]}"; do
  echo ""
  echo "--- $season ---"
  for condition in "${CONDITIONS[@]}"; do
    COUNT=$((COUNT + 1))
    echo "[$COUNT/$TOTAL] $season / $condition"
    
    generate_image "$season" "$condition" &
    RUNNING=$((RUNNING + 1))
    
    # Throttle parallel jobs
    if (( RUNNING >= MAX_PARALLEL )); then
      wait -n 2>/dev/null || true
      RUNNING=$((RUNNING - 1))
    fi
  done
done

# Wait for remaining
wait

echo ""
echo "=== Done ==="
echo "Generated: $OUTPUT_DIR/"
ls -la "$OUTPUT_DIR/" | tail -n +2 | wc -l | xargs echo "Files:"
du -sh "$OUTPUT_DIR/" | cut -f1 | xargs echo "Total size:"
