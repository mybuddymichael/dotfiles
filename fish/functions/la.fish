function la
    if test (count $argv) -eq 0
        eza --all --long --octal-permissions --no-permissions --no-user --tree --icons --group-directories-first --level=0
    else
        eza --all --long --octal-permissions --no-permissions --no-user --tree --icons --group-directories-first --level=1 $argv
    end
end
