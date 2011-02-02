export EDITOR="/Users/michael/bin/vim"

# prompt format
export PS1="[\u@\h \W]$ "

# shell syntax coloring
export CLICOLOR=1
export LSCOLORS=ExGxcxdxCxegedabagacad

# PATH
export PATH="/Users/michael/bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:$PATH"

# import my secrets
source ~/.secrets

# file system navigation
alias la="ls -alh"
alias t="tree -aC"

# program modifications
alias mv="mv -v"

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
