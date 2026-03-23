#!/usr/bin/env bash

set -euo pipefail

: "${DOTFILES_DIR:?DOTFILES_DIR is required}"

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

require_macos

log "Applying macOS defaults."

run_cmd defaults write com.apple.spaces spans-displays -bool true
run_cmd defaults write com.apple.dock expose-group-apps -bool true
run_cmd defaults write com.apple.dock orientation right
run_cmd defaults write com.apple.dock autohide -bool true
run_cmd defaults write com.apple.dock tilesize -int 256
run_cmd defaults write com.apple.dock show-recents -bool false
run_cmd defaults write com.apple.dock autohide-time-modifier -float "0.0"

run_cmd defaults write NSGlobalDomain AppleKeyboardUIMode -int "2"
run_cmd defaults write -g ApplePressAndHoldEnabled -bool false
run_cmd defaults write -g AppleShowScrollBars -string WhenScrolling

if is_dry_run; then
  run_cmd killall Dock
  run_cmd killall SystemUIServer
  exit 0
fi

killall Dock >/dev/null 2>&1 || true
killall SystemUIServer >/dev/null 2>&1 || true

log "macOS defaults applied."
