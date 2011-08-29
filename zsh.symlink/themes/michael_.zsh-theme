#!/usr/bin/env zsh
#local return_code="%(?..%{$fg[red]%}%? ↵%{$reset_color%})"

setopt promptsubst

autoload -U add-zsh-hook

PROMPT_SUCCESS_COLOR=$fg[cyan]
PROMPT_FAILURE_COLOR=$fg[black]
PROMPT_VCS_INFO_COLOR=$FG[242]
PROMPT_PROMPT=$fg[cyan]
GIT_DIRTY_COLOR=$fg[red]
GIT_CLEAN_COLOR=$fg[green]
GIT_PROMPT_INFO=$fg[magenta]
RVM_COLOR=$fg[red]

PROMPT=$'%{$RVM_COLOR%}$(rvm_prompt_info)%{$reset_color%} %{$GIT_PROMPT_INFO%}$(git_prompt_info)%{$GIT_DIRTY_COLOR%}$(git_prompt_status)%{$reset_color%} %{$PROMPT_SUCCESS_COLOR%}%~%{$reset_color%}\n%{$PROMPT_PROMPT%}⍟%{$reset_color%} '

RPROMPT=$'%{$PROMPT_FAILURE_COLOR%}%n@%m%{$reset_color%}'

#RPS1="${return_code}"

ZSH_THEME_GIT_PROMPT_PREFIX=""
ZSH_THEME_GIT_PROMPT_SUFFIX=""
ZSH_THEME_GIT_PROMPT_DIRTY=":%{$GIT_DIRTY_COLOR%}✘"
ZSH_THEME_GIT_PROMPT_CLEAN=":%{$GIT_CLEAN_COLOR%}✔"

ZSH_THEME_GIT_PROMPT_ADDED="%{$fg[green]%}✝%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_MODIFIED="%{$fg[yellow]%}⚑%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_DELETED="%{$fg[red]%}x%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_RENAMED="%{$fg[blue]%}➜%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_UNMERGED="%{$fg[red]%}═%{$reset_color%}"
ZSH_THEME_GIT_PROMPT_UNTRACKED="%{$fg_bold[cyan]%}?%{$reset_color%}"
