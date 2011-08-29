# Enable syntax coloring and set my custom colors.

  export CLICOLOR=1
  export LSCOLORS=Exfxbxdxcxegedabagacad


# My projects file used for tab-completion.

  export PROJECTS=~/Projects


# Set my PATH.

  export PATH=$HOME/.bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:$PATH


# Source super-secret .localrc file if it's there.

  [[ -s ~/.localrc ]] && source ~/.localrc


# Add rbenv to PATH

  export PATH="$HOME/.rbenv/bin:$PATH"
  eval "$(rbenv init -)"


# Set the editor as MacVim if available, vim if not.

  if hash mvim &> /dev/null; then
    export EDITOR='mvim -f --nomru -c "au VimLeave * !open -a iTerm"'
  else
    export EDITOR=vim
  fi
