#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos

if xcode-select -p >/dev/null 2>&1; then
  log "Xcode Command Line Tools already installed."
  exit 0
fi

warn "Xcode Command Line Tools not found."

if is_dry_run; then
  run_cmd xcode-select --install
  warn "Dry run only: finish Xcode Command Line Tools install before running first-run."
  exit 0
fi

# This opens a system dialog. If one is already open, the command can return non-zero.
xcode-select --install >/dev/null 2>&1 || true
die "Finish installing Xcode Command Line Tools, then re-run './install.sh first-run'."
