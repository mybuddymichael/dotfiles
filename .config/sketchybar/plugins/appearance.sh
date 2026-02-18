#!/usr/bin/env bash

if [ "$SENDER" != "appearance_change" ]; then
  exit 0
fi

# Refresh item scripts so they re-source colors.sh for the new appearance.
sketchybar --update
