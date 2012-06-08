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

      echo -n -s "$__fish_prompt_cwd" (prompt_pwd) "$__fish_prompt_normal" \n'› '

    end
  end



# Aliases.
# ========

  function reload
    . ~/.config/fish/config.fish
  end


# Custom program modifications.

  function t
    tree -aC -I .git $argv; end
  function mv
    mv -iv $argv; end
  function cp
    cp -iv $argv; end

  function e -d 'Edit a directory or file in Sublime'
    if test $argv[1] = '-n'
      if test -n $argv[2]
        subl -n $argv[2]
      else
        subl . ; end
    else
      if test -n $argv[1]
        subl $argv[1]
      else
        subl . ; end ; end ; end

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
