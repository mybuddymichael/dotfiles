# Disable fish greeting.

set -g fish_greeting

# Set a LANG.

set -gx LANG en_US.UTF-8

# Optional PATH debug logging (enable with FISH_PATH_DEBUG=1).

function __path_debug
    if not set -q FISH_PATH_DEBUG
        return
    end

    set -l log_file "$HOME/.cache/fish/path-debug.log"
    command mkdir -p (path dirname $log_file)
    printf "[%s] %s\n" (date "+%Y-%m-%d %H:%M:%S") "$argv" >> $log_file
    for path_entry in $PATH
        printf "  %s\n" $path_entry >> $log_file
    end
    printf "\n" >> $log_file
end

__path_debug "startup: initial PATH"

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

__path_debug "after brew shellenv"

# Set up mise (ensure it wins PATH ordering).

if type -q mise
    mise activate fish | source
end

__path_debug "after mise activate"

function __mise_path_postprocess --on-event fish_prompt
    set -l homebrew_paths /opt/homebrew/bin /opt/homebrew/sbin
    set -l system_paths /usr/bin /bin /usr/sbin /sbin /Library/Apple/usr/bin
    set -l new_path
    set -l mise_paths
    set -l other_paths
    set -l system_found

    for path_entry in $PATH
        if not contains -- $path_entry $homebrew_paths
            if contains -- $path_entry $system_paths
                if not contains -- $path_entry $system_found
                    set -a system_found $path_entry
                end
                continue
            end

            if string match -q -- "$HOME/.local/share/mise*" $path_entry
                if not contains -- $path_entry $mise_paths
                    set -a mise_paths $path_entry
                end
                continue
            end

            if string match -q -- "$HOME/.mise*" $path_entry
                if not contains -- $path_entry $mise_paths
                    set -a mise_paths $path_entry
                end
                continue
            end

            if not contains -- $path_entry $other_paths
                set -a other_paths $path_entry
            end
        end
    end

    set -a new_path $mise_paths

    for path_entry in $homebrew_paths
        if test -d $path_entry
            if not contains -- $path_entry $new_path
                set -a new_path $path_entry
            end
        end
    end

    set -a new_path $other_paths
    set -a new_path $system_found

    set -gx PATH $new_path
end

__mise_path_postprocess

# Set a custom PATH.

fish_add_path -g "$HOME/.local/bin"

# Vim is my EDITOR.

set -gx EDITOR nvim

# Set abbreviations

abbr -a jjs jj status
abbr -a jjc jj commit
abbr -a jjd jj diff
abbr -a n nvim
abbr -a bxb bunx --bun
abbr -a oc opencode
# abbr -a claude mise exec -- claude
abbr -a cl claude
abbr -a ch claude --model haiku
abbr -a cs claude --model sonnet
abbr -a wc env CLAUDE_CONFIG_DIR=$HOME/.claude-work claude
abbr -a wch env CLAUDE_CONFIG_DIR=$HOME/.claude-work claude --model haiku
abbr -a wcs env CLAUDE_CONFIG_DIR=$HOME/.claude-work claude --model sonnet
abbr -a wco env CLAUDE_CONFIG_DIR=$HOME/.claude-work claude --model opus
abbr -a wo env OPENCODE_CONFIG_DIR=$HOME/.config/opencode-work opencode
abbr -a me mise exec --
abbr -a mepi mise exec node@latest -- pi
abbr -a amr amp -m rush
abbr -a ams amp -m smart
abbr -a amd amp -m deep
abbr -a amb amp -m bombadil

# Colors.

set -g fish_color_normal normal
set -g fish_color_command --bold
set -g fish_color_quote brown
set -g fish_color_redirection normal
set -g fish_color_end normal
set -g fish_color_error red --bold
set -g fish_color_param blue
set -g fish_color_comment red
set -g fish_color_match cyan
set -g fish_color_search_match --background=white
set -g fish_color_operator cyan
set -g fish_color_escape cyan
set -g fish_color_cwd cyan
set -g fish_color_autosuggestion 555 yellow
set -g fish_color_user -o green
set -g fish_color_host -o green

set -g fish_pager_color_prefix cyan
set -g fish_pager_color_completion normal
set -g fish_pager_color_description brblue

# Set up utilities.
atuin init fish | source
zoxide init fish | source
starship init fish | source

# pnpm
set -gx PNPM_HOME "/Users/michael/Library/pnpm"
if not string match -q -- $PNPM_HOME $PATH
  set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end
