#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos
load_brew_shellenv || true

if ! command -v stow >/dev/null 2>&1; then
  if is_dry_run; then
    warn "stow is not available in this shell; printing commands only."
  else
    die "stow is required. Run './install.sh first-run' (brew step) first."
  fi
fi

stow_args=(--dir "$DOTFILES_DIR" --target "$HOME" --restow)
if [[ "${STOW_ADOPT:-0}" == "1" ]]; then
  stow_args+=(--adopt)
fi

log "Validating stow plan."
run_cmd stow "${stow_args[@]}" --simulate --verbose=1 .

if is_dry_run; then
  exit 0
fi

stow "${stow_args[@]}" .
log "Dotfiles stowed into $HOME."
