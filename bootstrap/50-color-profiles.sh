#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos

source_dir="${COLOR_PROFILES_SOURCE_DIR:-$HOME/Documents/color profiles}"
target_dir="$HOME/Library/ColorSync/Profiles"

if [[ ! -d "$source_dir" ]]; then
  warn "Color profile source directory not found: $source_dir (skipping)"
  exit 0
fi

if [[ -z "$(find "$source_dir" -mindepth 1 -maxdepth 1 -print -quit 2>/dev/null)" ]]; then
  warn "Color profile source directory is empty: $source_dir (skipping)"
  exit 0
fi

run_cmd mkdir -p "$target_dir"

if command -v rsync >/dev/null 2>&1; then
  run_cmd rsync -a --ignore-existing "$source_dir"/ "$target_dir"/
else
  run_cmd cp -Rn "$source_dir"/. "$target_dir"/
fi

log "Color profile sync complete."
