function fish_command_not_found
    echo "fish: command not found: '$argv[1]'"
    echo "fish: current directory is $PWD"
    return 127
end