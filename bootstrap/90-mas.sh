#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos

if ! load_brew_shellenv; then
  if is_dry_run; then
    warn "brew not available in this shell; printing commands only."
    run_cmd brew bundle --file "$DOTFILES_DIR/Brewfile.mas" --no-upgrade
    exit 0
  fi
  die "Homebrew is required before running post-apple-id."
fi

if ! command -v mas >/dev/null 2>&1; then
  die "'mas' is not installed. Run './install.sh first-run' first."
fi

if ! is_dry_run && ! mas account >/dev/null 2>&1; then
  die "No App Store account found. Sign in to Apple ID/App Store first, then re-run post-apple-id."
fi

run_brew_bundle "$DOTFILES_DIR/Brewfile.mas"
