#!/bin/sh

CURRENT_APP="$INFO"

if [ -z "$CURRENT_APP" ]; then
  CURRENT_APP=$(osascript -e 'tell application "System Events" to get name of first application process whose frontmost is true' 2>/dev/null)
fi

if [ -n "$CURRENT_APP" ]; then
  sketchybar --set "$NAME" label="$CURRENT_APP"
fi
