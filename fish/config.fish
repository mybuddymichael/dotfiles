# Set a custom PATH.

  set -x PATH ~/.bin /usr/local/bin ~/.rbenv/shims $PATH


# Vim is my EDITOR.


  set -x EDITOR vim


# Colors.

  set -x fish_color_cwd cyan


# Set JAVA_HOME.

  set -x JAVA_HOME (/usr/libexec/java_home)


# Create my prompt.

  function fish_prompt -d "Write out the prompt"
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
    set -l ref (git-current-branch)

    # Create a git_branch section for the prompt.
    set -l git_branch
    if test "$ref"
      set git_branch (echo -n -s (set_color magenta) "$ref" (set_color normal) ' ')
    end

    set -l git_status (git-status-prompt)
    if test "$git_status"
      set git_status (echo -n -s "$git_status ")
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

      echo -n -s -e "$git_branch" "$git_status" "$__fish_prompt_cwd" (prompt_pwd) (set_color normal) "\n$arrow "

    end
  end

  function git-status-prompt -d "Returns a string of symbols indicating the status of the current git directory."
    set -l symbol_clean (echo -n -s (set_color green) 'G' (set_color normal))
    set -l symbol_untracked (echo -n -s (set_color cyan) '?' (set_color normal))
    set -l symbol_added (echo -n -s (set_color green) '+' (set_color normal))
    set -l symbol_modified (echo -n -s (set_color yellow) '/' (set_color normal))
    set -l symbol_renamed (echo -n -s (set_color brown) '→' (set_color normal))
    set -l symbol_deleted (echo -n -s (set_color red) '-' (set_color normal))
    set -l symbol_deleted_unstaged (echo -n -s (set_color yellow) '-' (set_color normal))
    set -l __status

    set -l index (git status --porcelain ^ /dev/null)

    if test -z "$index" -a "$status" -eq "0"
      set __status (echo -n -s "$symbol_clean")
    else

      set -l untracked (for l in $index; echo $l; end | grep '^?? ')
      if test "$untracked"
        set __status (echo -n -s "$symbol_untracked$__status")
      end

      set -l modified (for l in $index; echo $l; end | grep '^ M \|^AM \|^ T \|^MM \|^RM ')
      if test "$modified"
        set __status (echo -n -s "$symbol_modified$__status")
      end

      set -l added (for l in $index; echo $l; end | grep '^A  \|^M  \|^MM ')
      if test "$added"
        set __status (echo -n -s "$symbol_added$__status")
      end

      set -l renamed (for l in $index; echo $l; end | grep '^R  \|^RM ')
      if test "$renamed"
        set __status (echo -n -s "$symbol_renamed$__status")
      end

      set -l deleted_unstaged (for l in $index; echo $l; end | grep '^ D ')
      if test "$deleted_unstaged"
        set __status (echo -n -s "$symbol_deleted_unstaged$__status")
      end

      set -l deleted (for l in $index; echo $l; end | grep '^D  \|^AD ')
      if test "$deleted"
        set __status (echo -n -s "$symbol_deleted$__status")
      end

      set -l unmerged (for l in $index; echo $l; end | grep '^UU ')
      if test "$unmerged"
        set __status (echo -n -s "$symbol_unmerged$__status")
      end

    end

    echo -s -n "$__status"
  end

  function git-current-branch -d "Returns the simplified current branch."
    echo -n -s (git symbolic-ref HEAD ^ /dev/null | sed 's/refs\/heads\///g')
  end


# Useful functions.

function t; tree $argv; end
function tmux-start -d "Starts a new tmux session with three vertical panes, or it attaches a session if one named "main" already exists."
  tmux has-session -t main > /dev/null ^&1

  if test $status -eq 0
    tmux attach -t main
    return 0
  end

  tmux new-session -d -s main
  tmux new-window -t main:2
  tmux new-window -t main:3
  tmux join-pane -s main:2 -t main:1
  tmux join-pane -s main:3 -t main:1
  tmux select-layout -t main even-horizontal
  tmux attach -t main
end
