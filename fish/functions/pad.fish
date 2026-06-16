function pad
    set config_file /Users/michael/dotfiles/.aerospace.toml
    
    # Create a temporary file for the transformation
    set temp_file (mktemp)
    
    # Process the file line by line
    awk '
    /^outer\.left = / { 
        print "# " $0
        next 
    }
    /^# outer\.left = / { 
        sub(/^# /, "")
        print $0
        next 
    }
    /^outer\.right = / { 
        print "# " $0
        next 
    }
    /^# outer\.right = / { 
        sub(/^# /, "")
        print $0
        next 
    }
    { print $0 }
    ' $config_file > $temp_file
    
    # Replace the original file
    mv $temp_file $config_file
    
    echo "Toggled outer.left and outer.right padding configuration"
    
    # Reload AeroSpace config
    aerospace reload-config
end