#!/bin/sh

source "$CONFIG_DIR/colors.sh"

SHORTCUT_NAME="${WEATHER_SHORTCUT_NAME:-get-current-location}"
TMP_BASE="/tmp"
COORDS_CACHE="${TMP_BASE}/sketchybar_weather_coords.txt"
WEATHER_CACHE="${TMP_BASE}/sketchybar_weather_current.json"
SHORTCUT_OUTPUT="${TMP_BASE}/sketchybar_location_shortcut.txt"

set_weather() {
  sketchybar --set "$NAME" \
    icon="$1" \
    icon.color="$WEATHER_COLOR" \
    label="$2" \
    label.color="$WEATHER_COLOR"
}

normalize_coords() {
  raw="$1"
  nums="$(printf '%s' "$raw" | grep -Eo -- '-?[0-9]+(\.[0-9]+)?' | head -n 2 | paste -sd ',' -)"
  if echo "$nums" | grep -Eq '^-?[0-9]+(\.[0-9]+)?,-?[0-9]+(\.[0-9]+)?$'; then
    echo "$nums"
  else
    echo ""
  fi
}

get_coords() {
  shortcuts run "$SHORTCUT_NAME" \
    --output-path "$SHORTCUT_OUTPUT" \
    --output-type public.plain-text >/dev/null 2>&1

  coords=""
  [ -f "$SHORTCUT_OUTPUT" ] && coords="$(normalize_coords "$(cat "$SHORTCUT_OUTPUT")")"
  if [ -n "$coords" ]; then
    printf '%s' "$coords" >"$COORDS_CACHE"
    echo "$coords"
    return 0
  fi

  if [ -f "$COORDS_CACHE" ]; then
    cat "$COORDS_CACHE"
    return 0
  fi

  return 1
}

weather_icon() {
  code="$1"
  case "$code" in
  0) echo "􀆭" ;;
  1 | 2) echo "􀇔" ;;
  3) echo "􀇂" ;;
  45 | 48) echo "􀇊" ;;
  51 | 53 | 55 | 56 | 57) echo "􀇄" ;;
  61 | 63 | 65 | 66 | 67 | 80 | 81 | 82) echo "􀇆" ;;
  71 | 73 | 75 | 77 | 85 | 86) echo "􀇞" ;;
  95 | 96 | 99) echo "􀇎" ;;
  *) echo "􁗄" ;;
  esac
}

temp_unit_query="fahrenheit"
[ "$WEATHER_UNITS" = "celsius" ] && temp_unit_query="celsius"

coords="$(get_coords)"
if [ -z "$coords" ]; then
  set_weather "$(weather_icon x)" "loc?"
  exit 0
fi

lat="${coords%,*}"
lon="${coords#*,}"
url="https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=${temp_unit_query}"

response="$(curl -fsS --max-time 5 "$url" 2>/dev/null)"
if [ -n "$response" ]; then
  printf '%s' "$response" >"$WEATHER_CACHE"
elif [ -f "$WEATHER_CACHE" ]; then
  response="$(cat "$WEATHER_CACHE")"
else
  response=""
fi

temp="$(echo "$response" | jq -r '.current.temperature_2m // empty' 2>/dev/null)"
code="$(echo "$response" | jq -r '.current.weather_code // empty' 2>/dev/null)"

if [ -z "$temp" ] || [ -z "$code" ]; then
  set_weather "$(weather_icon x)" "n/a"
  exit 0
fi

icon="$(weather_icon "$code")"
temp_whole="$(printf '%.0f' "$temp" 2>/dev/null)"
if [ -z "$temp_whole" ]; then
  temp_whole="$temp"
fi
set_weather "$icon" "$(printf '%s°' "$temp_whole")"
