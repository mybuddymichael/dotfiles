# Set a LANG.

set -gx LANG en_US.UTF-8

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

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
abbr -a me mise exec --

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
