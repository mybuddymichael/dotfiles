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
  alias tat='tmux attach -t'


# Set several Git-related shortcuts.

  if hash hub &> /dev/null; then; function git() {hub "$@"}; fi
  alias gs='git status'
  alias gss='git status --short --branch'
  alias gl='git log --decorate --all'
  alias glo="git log --graph --all --pretty=format:'%C(yellow)%h%Creset%C(red)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"
  alias ga='git add'
  function gpo() {
    if [[ -n "$1" ]]; then
      branch="$1"
    else
      local branch="$(git symbolic-ref HEAD | sed 's/refs\/heads\///')"
    fi
    git push origin $branch
  }
  alias gpom='git push origin master'
  alias gd='git diff'
  alias gdc='git diff --cached'
  alias gdw='git diff --color-words'
  alias gc='git commit'
  alias gb='git branch'
  alias gco='git checkout'
  alias grbi='git rebase -i'
  alias gundo='git reset --soft HEAD~; git reset'
