#!/usr/bin/env bash

log() {
  printf '[bootstrap] %s\n' "$*"
}

warn() {
  printf '[bootstrap] WARN: %s\n' "$*" >&2
}

die() {
  printf '[bootstrap] ERROR: %s\n' "$*" >&2
  exit 1
}

is_macos() {
  [[ "$(uname -s)" == "Darwin" ]]
}

require_macos() {
  is_macos || die "This bootstrap workflow only supports macOS."
}

is_dry_run() {
  [[ "${DRY_RUN:-0}" == "1" ]]
}

run_cmd() {
  if is_dry_run; then
    printf '[bootstrap] [dry-run]'
    printf ' %q' "$@"
    printf '\n'
    return 0
  fi

  "$@"
}

run_step() {
  local name="$1"
  local script_path="$2"

  [[ -f "$script_path" ]] || die "Missing step script: $script_path"
  log "Running step: $name"
  bash "$script_path"
}

brew_bin() {
  if command -v brew >/dev/null 2>&1; then
    command -v brew
    return 0
  fi

  if [[ -x /opt/homebrew/bin/brew ]]; then
    echo "/opt/homebrew/bin/brew"
    return 0
  fi

  if [[ -x /usr/local/bin/brew ]]; then
    echo "/usr/local/bin/brew"
    return 0
  fi

  return 1
}

load_brew_shellenv() {
  local brew_path
  if ! brew_path="$(brew_bin)"; then
    return 1
  fi

  # shellcheck disable=SC1090
  eval "$("$brew_path" shellenv bash)"
}

run_brew_bundle() {
  local bundle_file="$1"

  [[ -f "$bundle_file" ]] || die "Brewfile not found: $bundle_file"

  if ! load_brew_shellenv; then
    if is_dry_run; then
      warn "brew is not available in this shell; printing brew bundle command only."
      run_cmd brew bundle --file "$bundle_file" --no-upgrade
      return 0
    fi

    die "Homebrew is not installed or not available on PATH."
  fi

  run_cmd brew bundle --file "$bundle_file" --no-upgrade
}
