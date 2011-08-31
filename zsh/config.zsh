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


  # Set my PATH(s).

  export PATH=$HOME/.bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:$PATH
  fpath=($ZSH/functions $fpath)


# Source the super-secret .localrc file if it's there.

  [[ -s ~/.localrc ]] && source ~/.localrc


# Add rbenv to PATH.

  export PATH="$HOME/.rbenv/bin:$PATH"
  if hash rbenv &> /dev/null; then
    eval "$(rbenv init -)"
  fi


# And set the editor as MacVim if available, vim if not.

  if hash mvim &> /dev/null; then
    export EDITOR='mvim -f --nomru -c "au VimLeave * !open -a iTerm"'
  else
    export EDITOR=vim
  fi


# Set some default options.

  setopt correct_all
  setopt ignore_eof
