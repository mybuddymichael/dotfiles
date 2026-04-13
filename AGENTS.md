This is my dotfiles repo.

We use gnu-stow to link them into our home directory.

Treat paths in this repo as the final home-directory layout after stowing. For example, files under `.pi/agent/...` in the repo are intended to end up at `~/.pi/agent/...`.

When adding pi extensions for my personal setup in this repo, put them under `.pi/agent/extensions/`, not `.pi/extensions/`. `.pi/extensions/` is for project-local pi extensions inside ordinary repos, but in this dotfiles repo `.pi/agent/extensions/` represents the global pi extensions directory after stow.
