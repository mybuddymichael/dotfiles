# New Mac Bootstrap

This repo uses `gnu-stow` for dotfile linking and `brew bundle` for package installs.

## Order Of Operations

1. Install Xcode Command Line Tools first:
```bash
xcode-select --install
```
2. Confirm `git` is available (this also triggers CLT prompt on a clean Mac):
```bash
git --version
```
3. Clone this repo:
```bash
git clone <your-dotfiles-repo-url> ~/dotfiles
cd ~/dotfiles
```
4. Run the first-run workflow:
```bash
./install.sh first-run
```
5. Sign in to Apple ID / App Store.
6. Run App Store installs:
```bash
./install.sh post-apple-id
```

## What Each Workflow Does

- `first-run`:
  - Checks/install trigger for Xcode CLT
  - Installs Homebrew (if missing)
  - Runs `brew bundle` with `Brewfile` and `Brewfile.cask`
  - Stows dotfiles into `$HOME`
  - Applies macOS defaults
  - Configures fish as the default shell
  - Copies color profiles from `~/Documents/color profiles` if present
- `post-apple-id`:
  - Runs `brew bundle` with `Brewfile.mas`

## Useful Flags

- Preview without making changes:
```bash
./install.sh first-run --dry-run
```
- Adopt pre-existing files into stow ownership:
```bash
./install.sh first-run --adopt
```

## Notes

- Factorio setup is intentionally excluded.
- Color profile source can be overridden:
```bash
COLOR_PROFILES_SOURCE_DIR="$HOME/path/to/profiles" ./install.sh first-run
```
