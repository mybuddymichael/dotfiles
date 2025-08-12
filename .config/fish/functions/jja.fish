function jja --description 'Show all commits in jj log with optional limit'
    set -l limit_args
    set -l remaining_args
    
    # Parse arguments
    set -l i 1
    while test $i -le (count $argv)
        if test "$argv[$i]" = "-l"
            set i (math $i + 1)
            if test $i -le (count $argv)
                set limit_args --limit $argv[$i]
            else
                echo "Error: -l flag requires a number"
                return 1
            end
        else
            set -a remaining_args $argv[$i]
        end
        set i (math $i + 1)
    end
    
    # Run jj log with all commits and optional limit
    jj log -r .. $limit_args $remaining_args
end