function jjp --description 'Set trunk branch to parent commit and push'
    # Get the list of branches and check for main or master
    set -l branches (jj b l 2>&1)
    set -l trunk_branch ""
    
    # Check if main exists
    if string match -q "*main*" $branches
        set trunk_branch "main"
    # Check if master exists
    else if string match -q "*master*" $branches
        set trunk_branch "master"
    else
        echo "Error: Neither 'main' nor 'master' branch found"
        return 1
    end
    
    # Set the trunk branch to parent commit
    echo "Setting $trunk_branch to @-..."
    jj b s $trunk_branch -r @-
    
    # Push to git
    echo "Pushing to git..."
    jj git push
end