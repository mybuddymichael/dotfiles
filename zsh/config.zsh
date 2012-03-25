#                                       _/_/  _/
#      _/_/_/    _/_/    _/_/_/      _/            _/_/_/
#   _/        _/    _/  _/    _/  _/_/_/_/  _/  _/    _/
#  _/        _/    _/  _/    _/    _/      _/  _/    _/
#   _/_/_/    _/_/    _/    _/    _/      _/    _/_/_/
#                                                  _/
#  Where custom zsh settings are born.        _/_/
#  -----------------------------------


# Enable syntax coloring and set my custom colors.

  export CLICOLOR=1
  export LSCOLORS=Exfxbxdxcxegedabagacad


# My projects directory used for tab-completion.

  export PROJECTS=~/Projects


# Set some PATH(s).

  export PATH="$HOME/.bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:$PATH"
  fpath=($ZSH/functions $fpath)
  export NODE_PATH="/usr/local/lib/node_modules:$NODE_PATH"


# Add rbenv to PATH.

  export PATH="$HOME/.rbenv/bin:$PATH"
  if hash rbenv &> /dev/null; then
    eval "$(rbenv init -)"
  fi


# Add `.` and `bin` to the front of PATH.
  export PATH=".:bin:$PATH"


# Load custom functions and completions.

  autoload -U $ZSH/functions/*(:t)


# Source the super-secret .localrc file if it's there.

  [[ -s ~/.localrc ]] && source ~/.localrc


# And set the editor as Sublime Text 2 if available, vim if not.

  if hash subl &> /dev/null; then
    export EDITOR='subl -w'
  else
    export EDITOR=vim
  fi


# Set some default options.

  HISTFILE=~/.zsh_history
  HISTSIZE=10000
  SAVEHIST=10000

  setopt correct_all
  setopt ignore_eof
  setopt auto_list
  setopt no_list_beep
  setopt hist_verify
  setopt hist_ignore_space
  setopt inc_append_history
  setopt share_history
