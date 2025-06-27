function rm --description "Safe rm with protected paths"
    set -l protected_paths \
        "$HOME" \
        "$HOME/.config" \
        "$HOME/Documents" \
        "$HOME/Desktop" \
        "$HOME/Downloads" \
        "$HOME/Photos" \
        "$HOME/Library" \
        / \
        /opt \
        /usr \
        /etc \
        /var \
        /System \
        /Library \
        /Applications

    # Check each argument against protected paths
    for arg in $argv
        # Skip flags/options
        if string match -q -- "-*" "$arg"
            continue
        end

        # Resolve to absolute path
        set -l resolved_path (path resolve "$arg" 2>/dev/null)

        # Check if trying to delete an exact protected path
        for protected in $protected_paths
            set -l protected_resolved (path resolve "$protected" 2>/dev/null)
            if test "$resolved_path" = "$protected_resolved"
                echo "ERROR: Cannot delete protected path: $arg" >&2
                return 1
            end
        end
    end

    # If we get here, proceed with the actual rm command
    command rm $argv
end
