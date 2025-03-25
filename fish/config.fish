# Set a LANG.

set -gx LANG en_US.UTF-8


# Set a custom PATH.

fish_add_path /opt/homebrew/bin /opt/homebrew/sbin /opt/n/bin

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

# Set up atuin.
atuin init fish | source

# Vim is my EDITOR.

set -x EDITOR vim


# Colors.

set -x fish_color_normal normal
set -x fish_color_command --bold
set -x fish_color_quote brown
set -x fish_color_redirection normal
set -x fish_color_end normal
set -x fish_color_error red --bold
set -x fish_color_param blue
set -x fish_color_comment red
set -x fish_color_match cyan
set -x fish_color_search_match --background=white
set -x fish_color_operator cyan
set -x fish_color_escape cyan
set -x fish_color_cwd cyan
set -x fish_color_autosuggestion 555 yellow
set -x fish_color_user -o green
set -x fish_color_host -o green

set -x fish_pager_color_prefix cyan
set -x fish_pager_color_completion normal
set -x fish_pager_color_description brblue


# Set JAVA_HOME.

if test -d /usr/libexec/java_home
    set -x JAVA_HOME (/usr/libexec/java_home)
end


# Set up n (node)

set -x N_PREFIX /opt/n


# Fix gpg.

set -x GPG_TTY (tty)


# Create my prompt.

# Initialize first_prompt variable if not set
if not set -q __fish_prompt_first
    set -g __fish_prompt_first 1
end

function fish_prompt -d "Write out the prompt"
    set -l arrow_color
    if test $status -eq 0
        set arrow_color (set_color green)
    else
        set arrow_color (set_color red)
    end

    # Add newline only if this is not the first prompt
    if test $__fish_prompt_first -eq 1
        set -g __fish_prompt_first 0
    else
        echo
    end

    # Create a prompt arrow.
    set -l arrow (echo -n -s "$arrow_color" '›' (set_color normal))

    # Get the current ref, if any.
    set -l ref (git-current-branch)

    # Create a git_branch section for the prompt.
    set -l git_branch
    if test "$ref"
        set -l git_status
        git status 2>/dev/null | pipeset git_status
        set -l git_behind (echo -e "$git_status" | grep '^Your branch is behind')
        set -l git_ahead (echo -e "$git_status" | grep '^Your branch is ahead')
        set -l git_diverged (echo -e "$git_status" | grep 'have diverged,$')
        set -l git_branch_color (set_color magenta)
        if test "$git_behind"
            set git_branch_color (set_color yellow)
        end
        if test "$git_diverged"
            set git_branch_color (set_color yellow)
        end
        if test "$git_ahead"
            set git_branch_color (set_color green)
        end
        set git_branch (echo -n -s "$git_branch_color" "$ref" (set_color normal) ' ')
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

    set -l index (git status --porcelain 2> /dev/null)

    if test -z "$index" -a "$status" -eq 0
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
    echo -n -s (git symbolic-ref HEAD 2> /dev/null | sed 's/refs\/heads\///g')
end


# Useful functions.

function t
    tree $argv
end
function serve-this
    python -m SimpleHTTPServer 9000
end
# function tmux-start -d "Starts a new tmux session with three vertical panes, or it attaches a session if one named "main" already exists."
#     tmux has-session -t main >/dev/null ^&1

#     if test $status -eq 0
#         tmux attach -t main
#         return 0
#     end

#     tmux new-session -d -s main
#     tmux new-window -t main:2
#     tmux new-window -t main:3
#     tmux join-pane -s main:2 -t main:1
#     tmux join-pane -s main:3 -t main:1
#     tmux select-layout -t main even-horizontal
#     tmux attach -t main
# end
function gifit -d "Creates a gif of the provided screen recording."
    set -l temp_dir (mktemp -d ./frames.XXXX)
    set -l current_dir (pwd)
    cd "$temp_dir"
    ffmpeg -i "../$argv" -r 24 frame-%03d.png
    convert frame-001.png pallete.gif
    convert -dither none -remap pallete.gif frame-*.png recording-uncompressed.gif
    gifsicle --optimize=3 --delay=4 <recording-uncompressed.gif >../gif.gif
    cd "$current_dir"
    rm -r "$temp_dir"
end
function pipeset --no-scope-shadowing -d "Correctly sets multi-line text to a variable. Use like `| set ...`."
    set -l _options
    set -l _variables
    for _item in $argv
        switch $_item
            case '-*'
                set _options $_options $_item
            case '*'
                set _variables $_variables $_item
        end
    end
    for _variable in $_variables
        set $_variable ""
    end
    while read _line
        for _variable in $_variables
            set $_options $_variable $$_variable$_line\n
        end
    end
    return 0
end
