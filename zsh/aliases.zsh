#               _/  _/
#      _/_/_/  _/        _/_/_/    _/_/_/    _/_/      _/_/_/
#   _/    _/  _/  _/  _/    _/  _/_/      _/_/_/_/  _/_/
#  _/    _/  _/  _/  _/    _/      _/_/  _/            _/_/
#   _/_/_/  _/  _/    _/_/_/  _/_/_/      _/_/_/  _/_/_/
#
#  The keys to the kingdom.
#  ------------------------


# Make reloading the shell easier.

  alias reload="source $HOME/.zshrc"


# Custom program modifications.

  alias la='ls -alh'
  alias t='tree -aC -I .git'
  alias mv='nocorrect mv -iv'
  alias cp='nocorrect cp -iv'
  alias mkdir='nocorrect mkdir'
  alias rake='noglob rake'


# Set several Git-related shortcuts.

  if hash hub &> /dev/null; then; function git() {hub "$@"}; fi
  alias gs='git status'
  alias gss='git status --short --branch'
  alias gl='git log --decorate --all'
  alias glo="git log --graph --all --pretty=format:'%C(yellow)%h%Creset%C(red)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
  alias ga='git add'
  alias gpo='git push origin'
  alias gpom='git push origin master'
  alias gd='git diff'
  alias gdc='git diff --cached'
  alias gdw='git diff --color-words'
  alias gc='git commit'
  alias gb='git branch'
  alias gco='git checkout'
  alias grbi='git rebase -i HEAD~10'
