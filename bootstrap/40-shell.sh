#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos
load_brew_shellenv || true

fish_path=""
if command -v brew >/dev/null 2>&1; then
  fish_path="$(brew --prefix)/bin/fish"
elif [[ -x /opt/homebrew/bin/fish ]]; then
  fish_path="/opt/homebrew/bin/fish"
elif [[ -x /usr/local/bin/fish ]]; then
  fish_path="/usr/local/bin/fish"
fi

if [[ -z "$fish_path" ]] || [[ ! -x "$fish_path" ]]; then
  if is_dry_run; then
    warn "fish path could not be resolved; printing likely command with /opt/homebrew/bin/fish."
    fish_path="/opt/homebrew/bin/fish"
  else
    die "fish was not found. Ensure Brewfile install completed successfully."
  fi
fi

if ! grep -qFx "$fish_path" /etc/shells; then
  if is_dry_run; then
    log "[dry-run] printf '%s\\n' '$fish_path' | sudo tee -a /etc/shells >/dev/null"
  else
    printf '%s\n' "$fish_path" | sudo tee -a /etc/shells >/dev/null
    log "Added $fish_path to /etc/shells."
  fi
else
  log "$fish_path already exists in /etc/shells."
fi

current_shell="$(dscl . -read "/Users/$USER" UserShell 2>/dev/null | awk '{print $2}' || true)"
if [[ -z "$current_shell" ]]; then
  current_shell="${SHELL:-}"
fi

if [[ "$current_shell" != "$fish_path" ]]; then
  run_cmd chsh -s "$fish_path"
  log "Default shell changed to $fish_path."
else
  log "Default shell already set to $fish_path."
fi
