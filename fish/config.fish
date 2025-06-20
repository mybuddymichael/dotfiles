# Set a LANG.

set -gx LANG en_US.UTF-8

# Set a custom PATH.

fish_add_path /opt/homebrew/bin /opt/homebrew/sbin /opt/n/bin

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

# Set up atuin.

atuin init fish | source

# Vim is my EDITOR.

set -gx EDITOR nvim


# Colors.

set fish_color_normal normal
set fish_color_command --bold
set fish_color_quote brown
set fish_color_redirection normal
set fish_color_end normal
set fish_color_error red --bold
set fish_color_param blue
set fish_color_comment red
set fish_color_match cyan
set fish_color_search_match --background=white
set fish_color_operator cyan
set fish_color_escape cyan
set fish_color_cwd cyan
set fish_color_autosuggestion 555 yellow
set fish_color_user -o green
set fish_color_host -o green

set fish_pager_color_prefix cyan
set fish_pager_color_completion normal
set fish_pager_color_description brblue


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
