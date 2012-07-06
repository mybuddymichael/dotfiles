#                                       _/_/  _/
#      _/_/_/    _/_/    _/_/_/      _/            _/_/_/
#   _/        _/    _/  _/    _/  _/_/_/_/  _/  _/    _/
#  _/        _/    _/  _/    _/    _/      _/  _/    _/
#   _/_/_/    _/_/    _/    _/    _/      _/    _/_/_/
#                                                  _/
#  Where custom fish settings are born.       _/_/
#  ------------------------------------


# Set some PATH(s).

  for p in /usr/local/bin ~/.bin .
    if test -d $p
      if not contains $p $PATH
        set PATH $p $PATH ; end; end; end

  set NODE_PATH /usr/local/lib/node_modules/ $NODE_PATH
  set CLASSPATH $CLASSPATH /usr/local/Cellar/clojure-contrib/1.2.0/clojure-contrib.jar


# Set up rbenv.

  if test -d ~/.rbenv
    if not contains ~/.rbenv/shims $PATH
      set PATH ~/.rbenv/shims $PATH ; end
    rbenv rehash >/dev/null ^&1 ; end


# Source the super-secret .localrc file if it's there.

  if test -s ~/.localrc
    . ~/.localrc ; end


# And set the editor as Sublime Text 2 if available, vim if not.

  if type subl >/dev/null ^&1
    set EDITOR "subl -w"
  else
    set EDITOR vim ; end


# Set colors.

  set fish_color_cwd cyan
  set fish_color_command blue
  set fish_color_quote cyan


# Set my prompt.

  function fish_prompt -d 'Write out the prompt'

    # This has to be first in this function or it won't work.
    if test $status -gt 0
      set __fish_prompt_symbol (set_color red)› (set_color normal)
    else
      set __fish_prompt_symbol (set_color green)› (set_color normal) ; end

    # Just calculate these once, to save a few cycles when displaying the prompt
    if not set -q __fish_prompt_hostname
      set -g __fish_prompt_hostname (hostname|cut -d . -f 1)
    end

    if not set -q __fish_prompt_normal
      set -g __fish_prompt_normal (set_color normal)
    end

    switch $USER

      case root

      if not set -q __fish_prompt_cwd
        if set -q fish_color_cwd_root
          set -g __fish_prompt_cwd (set_color $fish_color_cwd_root)
        else
          set -g __fish_prompt_cwd (set_color $fish_color_cwd)
        end

      end

      echo -n -s "$USER" @ "$__fish_prompt_hostname" ' ' "$__fish_prompt_cwd" (prompt_pwd) "$__fish_prompt_normal" '# '

      case '*'

      if not set -q __fish_prompt_cwd
        set -g __fish_prompt_cwd (set_color $fish_color_cwd)
      end

      echo -n -s (git_prompt_info) "$__fish_prompt_cwd" (prompt_pwd) "$__fish_prompt_normal" \n "$__fish_prompt_symbol"

    end
  end


# Aliases.
# ========

  function reload
    . ~/.config/fish/config.fish ; end

  function c
    cd ~/Dropbox/Projects/$argv[1] ; end
  complete -x -c c -a "(ls -a ~/Projects)" -d "Directory in ~/Projects"

  function h
    cd ~/$argv ; end
  complete -x -c h -A -a "(ls -a ~)" -d "Directory in ~"


# Custom program modifications.

  function t
    tree -aC -I .git $argv; end
  function mv
    mv -iv $argv; end
  function cp
    cp -iv $argv; end


# Shortcut for editing with Sublime.

  function e -d 'Edit a directory or file in Sublime'
    if test $argv
      if test $argv[1] = '-n'
        if test $argv[2]
          subl -n $argv[2]
        else
          subl -n . ; end
      else
        subl $argv ; end
    else
      subl . ; end ; end


# Git aliases.

  if type hub >/dev/null ^&1
    function git
      hub $argv ; end ; end
  function gs
    git status $argv ; end
  function gss
    git status --short --branch $argv ; end
  function ga
    git add $argv ; end
  function gc
    git commit $argv ; end
  function gb
    git branch $argv ; end
  function gc
    git checkout $argv ; end
  function gl
    git log --decorate --all $argv ; end
  function glo
    git log --oneline --decorate --graph --all $argv ; end
  function gpo
    git push origin $argv ; end
  function gd
    git diff $argv ; end
  function gdc
    git diff --cached $argv ; end
  function gdw
    git diff --color-words $argv ; end
  function grbi
    git rebase -i HEAD~10 $argv ; end


# Git helpers
# ===========

# Helping variables.

  set git_prompt_clean (set_color green) "✔" (set_color normal)
  set git_prompt_dirty (set_color red) "" (set_color normal)
  set git_prompt_added (set_color green) "✝" (set_color normal)
  set git_prompt_modified (set_color yellow) "⚑" (set_color normal)
  set git_prompt_deleted (set_color red) "x" (set_color normal)
  set git_prompt_renamed (set_color blue) "➜" (set_color normal)
  set git_prompt_unmerged (set_color red) "═" (set_color normal)
  set git_prompt_untracked (set_color cyan) "?" (set_color normal)


# Functions.

  function git_prompt_info
    git rev-parse --git-dir >/dev/null ^&1; or return
    set branch (git symbolic-ref HEAD | sed 's/refs\/heads\///' ^/dev/null)
    echo -n -s (set_color magenta) $branch:(parse_git_status) (parse_repo_status) ' ' (set_color normal) ; end

  function parse_git_status
    set git_status (git status -s ^/dev/null)
    if test -n "$git_status"
      echo -n -s $git_prompt_dirty
    else
      echo -n -s $git_prompt_clean ; end ; end

  function parse_repo_status
    set status_index (git status --porcelain ^/dev/null)
    set repo_status ''
    echo $status_index | grep '^?? ' >/dev/null ^&1
      and set repo_status $git_prompt_untracked$repo_status
  #   fi
  #   if $(echo "$status_index" | grep '^A  ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_added$repo_status"
  #   elif $(echo "$status_index" | grep '^M  ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_added$repo_status"
    echo $status_index | grep '^MM ' >/dev/null ^&1
      and set repo_status $git_prompt_added$repo_status
    echo $status_index | grep '^ M ' >/dev/null ^&1
      and set repo_status $git_prompt_modified$repo_status
  #   elif $(echo "$status_index" | grep '^AM ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_modified$repo_status"
  #   elif $(echo "$status_index" | grep '^ T ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_modified$repo_status"
  #   elif $(echo "$status_index" | grep '^MM ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_modified$repo_status"
  #   fi
  #   if $(echo "$status_index" | grep '^R  ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_renamed$repo_status"
  #   fi
  #   if $(echo "$status_index" | grep '^D  ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_deleted$repo_status"
  #   elif $(echo "$status_index" | grep '^AD ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_deleted$repo_status"
  #   fi
  #   if $(echo "$status_index" | grep '^UU ' >/dev/null ^&1); then
  #     repo_status="$git_prompt_unmerged$repo_status"
  #   fi
    echo $repo_status ; end
