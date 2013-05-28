function fish_prompt --description 'Write out the prompt'
	
  set -l arrow_color
  if test $status -eq 0
    set arrow_color (set_color green)
  else
    set arrow_color (set_color red)
  end

  # Create a prompt arrow.
  set -l arrow (echo -n -s "$arrow_color" '›' (set_color normal))

  # Set up z.
  z --add "$PWD"

  # Get the current ref, if any.
  set -l ref (git_current_branch)

  # Create a git_branch section for the prompt.
  set -l git_branch
  if test "$ref"
    set git_branch (echo -n -s (set_color magenta) "$ref" (set_color normal) ' ')
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

    echo -n -s "$__fish_prompt_cwd" (prompt_pwd) (set_color normal) '# '

    case '*'

    if not set -q __fish_prompt_cwd
      set -g __fish_prompt_cwd (set_color $fish_color_cwd)
    end

    echo -n -s -e "$git_branch" "$__fish_prompt_cwd" (prompt_pwd) (set_color normal) "\n$arrow "

  end
end
