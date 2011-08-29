autoload colors && colors
setopt PROMPT_SUBST

git_prefix=''
git_suffix=' '
git_prompt_clean=":%{$fg[green]%}✔"
git_prompt_dirty=":%{$fg[red]%}✘"

rbenv_prompt=$'%{$fg[red]%}$(rbenv_prompt_info)%{$reset_color%}'
git_prompt=$'%{$fg[magenta]%}$(git_prompt_info)%{$reset_color%}'
dir_prompt=$'%{$fg[cyan]%}%~%{$reset_color%}'
prompt_prompt=$'%{$fg[cyan]%}\n⍟%{$reset_color%} '

PROMPT="$rbenv_prompt$git_prompt$dir_prompt$prompt_prompt"
