autoload colors && colors
setopt PROMPT_SUBST

smiley="%(?,%{$fg[green]%}☺%{$reset_color%},%{$fg[red]%}☹%{$reset_color%})"

git_prefix=''
git_suffix=' '
git_prompt_clean=":%{$fg[green]%}✔"
git_prompt_dirty=":%{$fg[red]%}✘"
git_prompt_added="%{$fg[green]%}✝%{$reset_color%}"
git_prompt_modified="%{$fg[yellow]%}⚑%{$reset_color%}"
git_prompt_deleted="%{$fg[red]%}x%{$reset_color%}"
git_prompt_renamed="%{$fg[blue]%}➜%{$reset_color%}"
git_prompt_unmerged="%{$fg[red]%}═%{$reset_color%}"
git_prompt_untracked="%{$fg_bold[cyan]%}?%{$reset_color%}"

rbenv_prompt=$'%{$fg[red]%}$(rbenv_prompt_info)%{$reset_color%} '
node_prompt=$'%{$fg[green]%}$(node_prompt_info)%{$reset_color%} '
git_prompt=$'%{$fg[magenta]%}$(git_prompt_info)%{$reset_color%}'
dir_prompt=$'%{$fg[cyan]%}%~%{$reset_color%}'
prompt_prompt=$'\n${smiley} '

PROMPT="$rbenv_prompt$node_prompt$git_prompt$dir_prompt$prompt_prompt"
RPROMPT=$'%{$fg[black]%}%n@%m%{$reset_color%}'
