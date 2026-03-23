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

3. In 1Password, create or choose one SSH key for this machine.

4. Add the key's public key to GitHub (SSH keys), then verify SSH auth:
```bash
ssh -T git@github.com
```

5. Clone this repo over SSH:
```bash
git clone git@github.com:<your-user>/<your-dotfiles-repo>.git ~/dotfiles
cd ~/dotfiles
```

6. Run the first-run workflow:
```bash
./install.sh first-run
```

7. Configure this machine's SSH signing key in local (non-stowed) config:
```bash
git config --file ~/.gitconfig user.signingkey "ssh-ed25519 AAAA..."
${EDITOR:-vi} ~/.jjconfig.toml
```
Add this in `~/.jjconfig.toml`:
```toml
[signing]
key = "ssh-ed25519 AAAA..."
```
`~/.jjconfig.toml` is machine-local and not stowed from this repo, so this key stays uncommitted.
Until this step is complete, `jj` commands can fail with `Signing key required`.

8. Verify signing key configuration:
```bash
git config --file ~/.gitconfig --get user.signingkey
jj config get signing.key
```

9. Sign in to Apple ID / App Store.

10. Run App Store installs:
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

- Use one SSH key per machine. Personal and work can use different keys.
- Use that same machine key for both GitHub SSH auth and commit signing.
- Signing keys are intentionally machine-local (`~/.gitconfig` and `~/.jjconfig.toml`) and not tracked in this repo.
- Factorio setup is intentionally excluded.
- Color profile source can be overridden:
```bash
COLOR_PROFILES_SOURCE_DIR="$HOME/path/to/profiles" ./install.sh first-run
```
