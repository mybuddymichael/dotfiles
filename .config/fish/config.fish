# Set a LANG.

set -gx LANG en_US.UTF-8

# Set a custom PATH.

fish_add_path /opt/homebrew/bin /opt/homebrew/sbin /opt/n/bin

# Set up homebrew.

eval "$(/opt/homebrew/bin/brew shellenv)"

# Vim is my EDITOR.

set -gx EDITOR nvim

# Set abbreviations

abbr -a jjs jj status
abbr -a jjc jj commit
abbr -a jjd jj diff
abbr -a n nvim
abbr -a bxb bunx --bun
abbr -a oc opencode
abbr -a claude mise exec -- claude --permission-mode acceptEdits
abbr -a cl mise exec -- claude --permission-mode acceptEdits
abbr -a ch mise exec -- claude --model haiku --permission-mode acceptEdits
abbr -a cs mise exec -- claude --model sonnet --permission-mode acceptEdits
abbr -a me mise exec --

# Colors.

# set fish_color_normal normal
# set fish_color_command --bold
# set fish_color_quote brown
# set fish_color_redirection normal
# set fish_color_end normal
# set fish_color_error red --bold
# set fish_color_param blue
# set fish_color_comment red
# set fish_color_match cyan
# set fish_color_search_match --background=white
# set fish_color_operator cyan
# set fish_color_escape cyan
# set fish_color_cwd cyan
# set fish_color_autosuggestion 555 yellow
# set fish_color_user -o green
# set fish_color_host -o green
#
# set fish_pager_color_prefix cyan
# set fish_pager_color_completion normal
# set fish_pager_color_description brblue

# Set up utilities.
atuin init fish | source
zoxide init fish | source
starship init fish | source
