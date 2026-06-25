This is my dotfiles repo.

We use `mise dotfiles` to manage dotfiles specified in `mise.toml`.

When adding pi extensions for my personal setup in this repo, put them under `.pi/agent/extensions/`, not `.pi/extensions/`. `.pi/extensions/` is for project-local pi extensions inside ordinary repos, but in this dotfiles repo `.pi/agent/extensions/` represents the global pi extensions directory after stow.
