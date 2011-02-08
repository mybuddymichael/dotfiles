export EDITOR="/Users/michael/bin/vim"

# get git in the prompt
function parse_git_dirty {
  [[ $(git status 2> /dev/null | tail -n1) != "nothing to commit (working directory clean)" ]] && echo "*"
}
function parse_git_branch {
  git branch --no-color 2> /dev/null | sed -e '/^[^*]/d' -e "s/* \(.*\)/\1$(parse_git_dirty)/"
}

# prompt format
export PS1="\n\u@\h \[\e[0;35m\]\w\[\e[0m\] $(parse_git_branch)\n$ "

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

# Load RVM
[[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm"
