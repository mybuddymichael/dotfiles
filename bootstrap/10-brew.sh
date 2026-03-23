#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos

if ! brew_bin >/dev/null 2>&1; then
  warn "Homebrew not found. Installing Homebrew..."

  if is_dry_run; then
    log "[dry-run] /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  else
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
fi

run_brew_bundle "$DOTFILES_DIR/Brewfile"
run_brew_bundle "$DOTFILES_DIR/Brewfile.cask"
