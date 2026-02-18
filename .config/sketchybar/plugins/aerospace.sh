#!/usr/bin/env bash

# make sure it's executable with:
# chmod +x ~/.config/sketchybar/plugins/aerospace.sh

source "$CONFIG_DIR/plugins/icon_map.sh"
source "$CONFIG_DIR/colors.sh"

focused_workspace="${FOCUSED_WORKSPACE:-$(aerospace list-workspaces --focused 2>/dev/null)}"

# Update app icons for this workspace.
# Use explicit format output to avoid relying on default column layout.
apps=$(aerospace list-windows --workspace "$1" --format '%{app-name}' 2>/dev/null | sort -u)

if [ -z "$apps" ]; then
  if [ "$1" != "$focused_workspace" ]; then
    sketchybar --set $NAME drawing=off label.drawing=off
    exit 0
  fi
fi

sketchybar --set $NAME drawing=on

if [ "$1" = "$focused_workspace" ]; then
  sketchybar --set $NAME background.drawing=on \
    background.color=$SPACE_ACTIVE_BG_COLOR \
    icon.color=$SPACE_ACTIVE_COLOR \
    label.color=$SPACE_ACTIVE_COLOR
else
  sketchybar --set $NAME background.drawing=off \
    icon.color=$SPACE_INACTIVE_COLOR \
    label.color=$SPACE_INACTIVE_COLOR
fi

icon_string=""
if [ -n "$apps" ]; then
  while IFS= read -r app; do
    [ -z "$app" ] && continue
    __icon_map "$app"
    if [ "$icon_result" != ":default:" ]; then
      icon_string+="$icon_result"
    fi
  done <<< "$apps"
fi

if [ -n "$icon_string" ]; then
  sketchybar --set $NAME label="$icon_string" label.drawing=on
else
  sketchybar --set $NAME label.drawing=off
fi
