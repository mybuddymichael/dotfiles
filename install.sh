#!/usr/bin/env bash

set -euo pipefail

DOTFILES_DIR=$(cd "$(dirname "$0")" && pwd)

# shellcheck source=bootstrap/lib.sh
source "$DOTFILES_DIR/bootstrap/lib.sh"

usage() {
  cat <<'EOF'
Usage:
  ./install.sh [first-run] [--dry-run] [--adopt]
  ./install.sh post-apple-id [--dry-run]
  ./install.sh all [--dry-run] [--adopt]
  ./install.sh list-steps

Workflows:
  first-run      Full machine bootstrap except App Store apps (default)
  post-apple-id  Install Mac App Store apps from Brewfile.mas
  all            Run first-run, then post-apple-id
  list-steps     Print the workflow step order

Flags:
  --dry-run      Print commands without executing them
  --adopt        Use `stow --adopt` during the stow step
  -h, --help     Show this help
EOF
}

run_first_run() {
  run_step "01-prereqs" "$DOTFILES_DIR/bootstrap/01-prereqs.sh"
  run_step "10-brew" "$DOTFILES_DIR/bootstrap/10-brew.sh"
  run_step "20-stow" "$DOTFILES_DIR/bootstrap/20-stow.sh"
  run_step "30-macos-defaults" "$DOTFILES_DIR/bootstrap/30-macos-defaults.sh"
  run_step "40-shell" "$DOTFILES_DIR/bootstrap/40-shell.sh"
  run_step "50-color-profiles" "$DOTFILES_DIR/bootstrap/50-color-profiles.sh"
}

run_post_apple_id() {
  run_step "90-mas" "$DOTFILES_DIR/bootstrap/90-mas.sh"
}

print_step_order() {
  cat <<'EOF'
first-run:
  1. 01-prereqs          (Xcode Command Line Tools check/install)
  2. 10-brew             (Homebrew install, then Brewfile + Brewfile.cask)
  3. 20-stow             (stow --restow dotfiles into $HOME)
  4. 30-macos-defaults   (defaults write + service restart)
  5. 40-shell            (fish path registration + chsh)
  6. 50-color-profiles   (copy from ~/Documents/color profiles if present)

post-apple-id:
  1. 90-mas              (Brewfile.mas via brew bundle)
EOF
}

main() {
  local workflow="first-run"
  local arg

  if [[ $# -gt 0 ]] && [[ "$1" != --* ]]; then
    workflow="$1"
    shift
  fi

  export DRY_RUN=0
  export STOW_ADOPT=0
  export DOTFILES_DIR

  while [[ $# -gt 0 ]]; do
    arg="$1"
    shift
    case "$arg" in
      --dry-run)
        export DRY_RUN=1
        ;;
      --adopt)
        export STOW_ADOPT=1
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        usage
        die "Unknown argument: $arg"
        ;;
    esac
  done

  case "$workflow" in
    first-run)
      run_first_run
      ;;
    post-apple-id)
      run_post_apple_id
      ;;
    all)
      run_first_run
      run_post_apple_id
      ;;
    list-steps)
      print_step_order
      ;;
    *)
      usage
      die "Unknown workflow: $workflow"
      ;;
  esac

  log "Workflow '$workflow' completed."
}

main "$@"
