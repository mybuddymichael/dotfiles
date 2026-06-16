#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract information from JSON
model_name=$(echo "$input" | jq -r '.model.display_name')
current_dir=$(echo "$input" | jq -r '.workspace.current_dir')

# Extract context window information
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 200000')
current_usage=$(echo "$input" | jq '.context_window.current_usage')

# Calculate context percentage
if [ "$current_usage" != "null" ]; then
    current_tokens=$(echo "$current_usage" | jq '.input_tokens + .cache_creation_input_tokens + .cache_read_input_tokens')
    context_percent=$((current_tokens * 100 / context_size))
else
    context_percent=0
fi

# Build context progress bar (15 chars wide)
bar_width=15
filled=$((context_percent * bar_width / 100))
empty=$((bar_width - filled))
bar=""
for ((i=0; i<filled; i++)); do bar+="█"; done
for ((i=0; i<empty; i++)); do bar+="░"; done

# Get directory name (basename)
dir_name=$(basename "$current_dir")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[0;33m'
MAGENTA='\033[0;35m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Change to the current directory to get jj info
cd "$current_dir" 2>/dev/null || cd /

# Get jj status
jj_info=""
if [ -d ".jj" ]; then
    status=$(jj st --no-pager 2>/dev/null)

    # Check if working copy is clean
    if ! echo "$status" | grep -q "The working copy has no changes"; then
        # Parse the working copy changes section
        changes=$(echo "$status" | sed -n '/Working copy changes:/,/Working copy/p' | grep "^[AMDR] ")

        # Count files for each status in single pass
        counts=$(echo "$changes" | awk '/^A / {a++} /^M / {m++} /^D / {d++} /^R / {r++} END {print (a+0)" "(m+0)" "(d+0)" "(r+0)}')
        read added_count modified_count deleted_count renamed_count <<< "$counts"

        # Build status display
        parts=""
        [ "$added_count" -gt 0 ] && parts="${parts} ${GREEN}A${added_count}${NC}"
        [ "$modified_count" -gt 0 ] && parts="${parts} ${YELLOW}M${modified_count}${NC}"
        [ "$deleted_count" -gt 0 ] && parts="${parts} ${RED}-${deleted_count}${NC}"
        [ "$renamed_count" -gt 0 ] && parts="${parts} ${MAGENTA}→${renamed_count}${NC}"

        # Get line changes
        diff_stat=$(jj diff --stat 2>/dev/null)
        if echo "$diff_stat" | grep -q "insertion\|deletion"; then
            added_lines=$(echo "$diff_stat" | sed -n 's/.* \([0-9]*\) insertion.*/\1/p')
            deleted_lines=$(echo "$diff_stat" | sed -n 's/.* \([0-9]*\) deletion.*/\1/p')

            [ -n "$added_lines" ] && [ "$added_lines" -gt 0 ] && parts="${parts} ${GREEN}+${added_lines}${NC}"
            [ -n "$deleted_lines" ] && [ "$deleted_lines" -gt 0 ] && parts="${parts} ${RED}-${deleted_lines}${NC}"
        fi

        jj_info="${parts}"
    fi
fi

# Build context bar display
context_info="${GRAY}${bar}${NC} ${context_percent}%"

# Output the status line
if [ -n "$jj_info" ]; then
    echo -e "${CYAN}${dir_name}${NC}${jj_info} ${GRAY}|${NC} ${CYAN}${model_name}${NC} ${GRAY}|${NC} ${context_info}"
else
    echo -e "${CYAN}${dir_name}${NC} ${GRAY}|${NC} ${CYAN}${model_name}${NC} ${GRAY}|${NC} ${context_info}"
fi
