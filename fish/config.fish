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
    printf "[%s] %s\n" (date "+%Y-%m-%d %H:%M:%S") "$argv" >>$log_file
    for path_entry in $PATH
        printf "  %s\n" $path_entry >>$log_file
    end
    printf "\n" >>$log_file
end

__path_debug "startup: initial PATH"

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

__path_debug "after brew shellenv"

# Set a custom PATH.

fish_add_path -g "$HOME/.local/bin"
fish_add_path "$HOME/.bun/bin"
fish_add_path -g "/Applications/Obsidian.app/Contents/MacOS"

# Vim is my EDITOR.

set -gx EDITOR nvim
set -gx VISUAL nvim

# Set abbreviations

abbr -a jjl jj --limit 20
abbr -a jjs jj status
abbr -a jjc jj commit
abbr -a n nvim
abbr -a bxb bunx --bun
abbr -a oc opencode
abbr -a c4h codex --model gpt-5.4 -c 'model_reasoning_effort="high"'
abbr -a c4m codex --model gpt-5.4 -c 'model_reasoning_effort="medium"'
abbr -a c4l codex --model gpt-5.4 -c 'model_reasoning_effort="low"'
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
abbr -a mepi mise exec node@24 -- pi
abbr -a amr amp -m rush
abbr -a ams amp -m smart
abbr -a amd amp -m deep
abbr -a amb amp -m bombadil
abbr -a wpi env PI_CODING_AGENT_DIR="$HOME/.pi-work/agent" mise exec node@24 -- pi --models openai-codex/gpt-5.5:medium
abbr -a ppi mise exec node@24 -- pi --models openai-codex/gpt-5.5:medium
abbr -a opi mise exec node@24 -- pi --models opencode-go/glm-5.1,opencode-go/kimi-k2.5

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
set -gx PNPM_HOME /Users/michael/Library/pnpm
if not string match -q -- $PNPM_HOME $PATH
    set -gx PATH "$PNPM_HOME" $PATH
end
# pnpm end

# Added by OrbStack: command-line tools and integration
# This won't be added again if you remove it.
source ~/.orbstack/shell/init2.fish 2>/dev/null || :

# Activate mise
~/.local/bin/mise activate fish | source
