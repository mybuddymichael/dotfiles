#!/bin/sh

source "$CONFIG_DIR/colors.sh"

# Get the highest-priority task from sift
TODO="$(sift --top 2>/dev/null)"

if [ -z "$TODO" ]; then
  TODO="(Nothing prioritized.)"
fi

# Truncate if too long
if [ ${#TODO} -gt 40 ]; then
  TODO="${TODO:0:37}..."
fi

# Icon with label
sketchybar --set "$NAME" \
  drawing=on \
  icon=":things:" \
  icon.color="$THINGS_TODO_ICON_COLOR" \
  icon.padding_left=10 \
  icon.padding_right=10 \
  label="$TODO" \
  label.color="$THINGS_TODO_LABEL_COLOR" \
  label.padding_right=10
