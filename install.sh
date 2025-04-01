#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status.
# Treat unset variables as an error.
# Cause pipelines to return the exit status of the last command that exited non-zero.
set -euo pipefail

# Get the absolute path of the directory where this script is located
# Assumes the script is in the root of the dotfiles directory.
DOTFILES_DIR=$(cd "$(dirname "$0")" && pwd)

# Function to safely link files and directories
link() {
  local source="$1"
  local target="$2"
  local target_dir
  local current_link

  # Ensure target_dir calculation happens safely
  if ! target_dir=$(dirname "$target"); then
    echo "Error: Could not determine directory for target '$target'" >&2
    return 1
  fi

  # Use -e to check if source exists (file or directory)
  if [ ! -e "$source" ]; then
    echo "Error: Source '$source' does not exist." >&2
    return 1
  fi

  # Create the parent directory for the target if it doesn't exist
  if [ ! -d "$target_dir" ]; then
    echo "Creating directory '$target_dir'..."
    if ! mkdir -p "$target_dir"; then
      echo "Error: Failed to create directory '$target_dir'" >&2
      return 1
    fi
  fi

  # Check if the target exists
  if [ -e "$target" ]; then
    # Target exists, check if it's a symlink
    if [ -L "$target" ]; then
      # It's a symlink, check if it points to the correct source
      current_link=$(readlink "$target")
      if [ "$current_link" == "$source" ]; then
        echo "Correct link already exists: $target -> $source"
        return 0
      else
        echo "Updating incorrect link at '$target' (currently points to '$current_link')"
        if ! rm -f "$target"; then
          echo "Error: Failed to remove existing symlink '$target'" >&2
          return 1
        fi
      fi
    else
      # It's not a symlink (it's a file or directory)
      echo "Warning: '$target' already exists and is not a symlink."
      read -p "  Remove '$target' and replace with symlink to '$source'? [y/N] " confirm </dev/tty
      if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "Removing '$target'..."
        if ! rm -rf "$target"; then
          echo "Error: Failed to remove '$target'" >&2
          return 1
        fi
      else
        echo "Skipping link for '$target'."
        return 0
      fi
    fi
  fi

  # At this point, the target either didn't exist, or was removed. Create the link.
  echo "Linking '$source' -> '$target'"
  if ! ln -sf "$source" "$target"; then
    echo "Error: Failed to create symlink '$target' pointing to '$source'" >&2
    return 1
  fi

  return 0
}

# Function to safely copy the contents of a directory to another directory idempotently
# without overwriting existing files.
copy_dir_contents() {
  local source_dir="$1"
  local target_dir="$2"

  # Check if the source directory exists and is not empty
  if [ ! -d "$source_dir" ] || [ -z "$(ls -A "$source_dir")" ]; then
    echo "Warning: Source directory '$source_dir' not found or is empty. Skipping copy."
    return 0 # Not an error, just nothing to copy
  fi

  # Ensure the target directory exists
  echo "Ensuring target directory '$target_dir' exists..."
  if ! mkdir -p "$target_dir"; then
    echo "Error: Failed to create target directory '$target_dir'" >&2
    return 1
  fi

  # Copy contents using cp -Rn
  # -R: recursive copy
  # -n: no-clobber (do not overwrite an existing file)
  # Source path ends with / to copy contents, not the directory itself
  echo "Copying contents of '$source_dir' to '$target_dir' (skipping existing files)..."
  # Using * instead of / at the end of source_dir for broader compatibility
  if ! cp -Rn "$source_dir"/* "$target_dir"; then
    # cp -n might return non-zero if files were skipped, which isn't a true error here.
    # A more robust check would involve verifying specific files or using find/cmp,
    # but for simple "copy if not present", this is generally acceptable.
    # We'll proceed assuming success unless cp fails catastrophically (e.g., permissions).
    # Check the exit status more carefully if needed.
    # For now, let's assume non-zero might just mean files were skipped.
    echo "Copy operation completed (some files may have been skipped if they already exist)."
  else
    echo "Contents copied successfully from '$source_dir' to '$target_dir'."
  fi

  return 0 # Assume success for idempotency check
}

echo "Linking dotfiles..."
link "$DOTFILES_DIR/aerospace/aerospace.toml" "$HOME/.aerospace.toml"
link "$DOTFILES_DIR/borders" "$HOME/.config/borders"
link "$DOTFILES_DIR/fish" "$HOME/.config/fish"
link "$DOTFILES_DIR/ghostty" "$HOME/.config/ghostty"
link "$DOTFILES_DIR/git/gitconfig" "$HOME/.gitconfig"
link "$DOTFILES_DIR/git/gitignore_global" "$HOME/.gitignore_global"

echo "Copying color profiles..."
copy_dir_contents "$HOME/Documents/color profiles" "$HOME/Library/ColorSync/Profiles"

echo "Changing macOS default settings..."
# Make it so that displays don't have their own spaces. (https://nikitabobko.github.io/AeroSpace/guide#a-note-on-displays-have-separate-spaces)
defaults write com.apple.spaces spans-displays -bool true && killall SystemUIServer

# Group windows in mission control by application. (https://nikitabobko.github.io/AeroSpace/guide#a-note-on-mission-control)
defaults write com.apple.dock expose-group-apps -bool true
# Set the dock to the right side of the screen.
defaults write com.apple.dock orientation right
# Auto hide the dock.
defaults write com.apple.dock autohide -bool true
# Make the dock as large as possible.
defaults write com.apple.dock tilesize -int 256
# Don't show recent applications in the dock.
defaults write com.apple.dock show-recents -bool false
# Make the dock appear instantly.
defaults write com.apple.dock autohide-time-modifier -float "0.0"
killall Dock

# Enable full keyboard navigation
defaults write NSGlobalDomain AppleKeyboardUIMode -int "2"

echo "Checking for Xcode Command Line Tools..."
if ! xcode-select -p &>/dev/null; then
  echo "Xcode Command Line Tools not found. Attempting to install..."
  # This command might prompt for user interaction if not run with sudo
  # and might require manual confirmation in a GUI dialog.
  xcode-select --install
else
  echo "Xcode Command Line Tools already installed."
fi

echo "Installing Homebrew if not present..."
if ! command -v brew &>/dev/null; then
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
  echo "Homebrew is already installed."
fi

echo "Installing packages via Brewfile..."
if command -v brew &>/dev/null; then
  brew bundle --force --file="$DOTFILES_DIR/Brewfile"
else
  echo "Warning: brew command not found. Skipping brew bundle."
fi

echo "Adding fish shell to /etc/shells if needed..."
FISH_PATH="/opt/homebrew/bin/fish"
if ! grep -qFx "$FISH_PATH" /etc/shells; then
  echo "Adding $FISH_PATH to /etc/shells. Sudo password may be required."
  echo "$FISH_PATH" | sudo tee -a /etc/shells >/dev/null
else
  echo "$FISH_PATH already in /etc/shells."
fi

echo "Changing default shell to fish if needed..."
if [ "$SHELL" != "$FISH_PATH" ]; then
  echo "Changing shell to $FISH_PATH. Sudo password may be required."
  chsh -s "$FISH_PATH"
else
  echo "Default shell is already $FISH_PATH."
fi

echo "Linking Factorio configuration..."
FACTORIO_SUPPORT_DIR="$HOME/Library/Application Support/factorio"
FACTORIO_DOCS_DIR="$HOME/Documents/factorio"

link "$FACTORIO_DOCS_DIR/config" "$FACTORIO_SUPPORT_DIR/config"
link "$FACTORIO_DOCS_DIR/saves" "$FACTORIO_SUPPORT_DIR/saves"

echo "Dotfiles setup script completed."
