export EDITOR="/Users/michael/bin/vim"




# shell syntax coloring
export CLICOLOR=1
export LSCOLORS=ExGxcxdxCxegedabagacad

# PATH
if [ -d ~/bin ]; then
	export PATH="~/bin:$PATH"
fi

if [ -d /usr/local/mysql/bin ]; then
	export PATH="$PATH:/usr/local/mysql/bin"
fi
# import my secrets
if [ -f ~/.secrets ]; then
	. ~/.secrets
fi

# git autocompletion
if [ -f /usr/local/git/contrib/completion/git-completion.bash ]; then
	. /usr/local/git/contrib/completion/git-completion.bash 
fi
GIT_PS1_SHOWDIRTYSTATE=true

# bash-completion
if [ -f `brew --prefix`/etc/bash_completion ]; then
  . `brew --prefix`/etc/bash_completion
fi

# file system navigation
alias la="ls -alh"
alias t="tree -aC"

# program modifications
alias mv="mv -iv"

# path shortcuts
alias we="cd ~/workenv/"

# ruby
alias r="ruby"

# openssl
alias md5="openssl md5"

# MacVim 
alias m="mvim"

# git
alias gs="git status"
alias gl="git log --decorate"
alias glo="git log --oneline --decorate"
alias ga="git add"
alias gpo="git push origin"
alias gpom="git push origin master"
alias gd="git diff"
alias gdm="git diff | mate"
alias gc="git commit"
alias gca="git commit -a"
alias gb="git branch"
alias gco="git checkout"
alias gsub="git submodule"

# prompt format
export PS1="\n\u@\h \[\e[0;35m\]\w\[\e[0m\] $(__git_ps1)\n\$ "

# Load RVM
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
