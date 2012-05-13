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
  alias t='tree -aC -I .git'
  alias mv='nocorrect mv -iv'
  alias cp='nocorrect cp -iv'
  alias mkdir='nocorrect mkdir'
  alias rake='noglob rake'


# Establish some shortcuts for frequently-used programs.

  function e() {
    if [[ $1 == '-n' ]]; then
      subl -n ${2:-'.'}
    else
      subl ${1:-'.'}
    fi
  }
  alias m=mvim
  alias r=ruby
  alias pow=powder
  alias rv='rbenv version'
  alias be='bundle exec'
  alias beg='bundle exec guard'
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
