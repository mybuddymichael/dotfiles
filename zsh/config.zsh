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
  export LSCOLORS=exfxbxdxcxegedabagacad


# My projects directory used for tab-completion.

  export PROJECTS=~/Projects


# Set some PATH(s).

  export PATH="$HOME/.bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:$PATH"
  fpath=($ZSH/functions /usr/local/share/zsh/site-functions $fpath)


# Add npm to PATH.

  export PATH="/usr/local/share/npm/bin:$PATH"


# Add rbenv to PATH.

  export PATH="$HOME/.rbenv/bin:$PATH"
  hash rbenv &> /dev/null && eval "$(rbenv init -)"


# Add cabal to PATH

  hash cabal &> /dev/null  && export PATH="$HOME/.cabal/bin:$PATH"


# Add `.` and `bin` to the front of PATH.

  export PATH=".:bin:$PATH"


# Source `z` if it's available.

  if [ -s "`brew --prefix`/etc/profile.d/z.sh" &> /dev/null ]; then
    source "`brew --prefix`/etc/profile.d/z.sh"
  fi


# Load custom functions and completions.

  autoload -U $ZSH/functions/*(:t)


# Source the super-secret .localrc file if it's there.

  [[ -s ~/.localrc ]] && source ~/.localrc


# Set the editor to vim.

  export EDITOR=vim


# Set some default options.

  bindkey -e

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
