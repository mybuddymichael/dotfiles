#               _/  _/
#      _/_/_/  _/        _/_/_/    _/_/_/    _/_/      _/_/_/
#   _/    _/  _/  _/  _/    _/  _/_/      _/_/_/_/  _/_/
#  _/    _/  _/  _/  _/    _/      _/_/  _/            _/_/
#   _/_/_/  _/  _/    _/_/_/  _/_/_/      _/_/_/  _/_/_/
#
#  The keys to the kingdom.
#  ------------------------


# Make reloading the shell easier.

  alias reload=". $HOME/.zshrc"


# Custom program modifications.

  alias la='ls -alh'
  alias t='tree -aC'
  alias mv='mv -iv'
  alias cp='cp -iv'


# Establish some shortcuts for frequently-used programs.

  alias m=mvim
  alias r=ruby
  alias rv='rbenv version'
  alias be='bundle exec'
  alias md5='openssl md5'


# Set several Git-related shortcuts.

  if hash hub &> /dev/null; then; function git(){hub "$@"}; fi
  alias gs='git status'
  alias gss='git status --short --branch'
  alias gl='git log --decorate --all'
  alias glo='git log --oneline --decorate --graph --all'
  alias ga='git add'
  alias gpo='git push origin'
  alias gpom='git push origin master'
  alias gd='git diff'
  alias gdc='git diff --cached'
  alias gc='git commit'
  alias gb='git branch'
  alias gco='git checkout'
  alias gsub='git submodule'
