function fish_prompt --description 'Write out the prompt'
	
  set -l arrow_color
  if test $status -eq 0
    set arrow_color (set_color green)
  else
    set arrow_color (set_color red)
  end

  # Create a prompt arrow.
  set -l arrow (echo -n -s "$arrow_color" '›' (set_color normal))

  # Set up for the pwd.
  z --add "$PWD"

  # Get the git branch, if any.
  set -g ref (git symbolic-ref HEAD ^ /dev/null | sed 's/refs\/heads\///g')

  set -l git_branch
  if test "$ref"
    set git_branch (echo -n -s (set_color magenta) "$ref" (set_color normal) ' ')
  end

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

    echo -n -s -e "$git_branch" "$__fish_prompt_cwd" (prompt_pwd) "$__fish_prompt_normal" "\n$arrow "

  end
end
