#!/bin/sh

source "$CONFIG_DIR/colors.sh"

sketchybar --set "$NAME" \
  icon="􀐫" \
  icon.font="SF Pro:Bold:14.0" \
  label="$(date '+%a %d %b %H:%M:%S')" \
  icon.color="$CLOCK_COLOR" \
  label.color="$CLOCK_COLOR"
