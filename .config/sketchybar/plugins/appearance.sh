#!/usr/bin/env bash

if [ "$SENDER" != "appearance_change" ]; then
  exit 0
fi

source "$CONFIG_DIR/colors.sh"
sketchybar --bar color=$BAR_COLOR

# Refresh item scripts so they re-source colors.sh for the new appearance.
sketchybar --update
