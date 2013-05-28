function git_current_branch
	echo -n -s (git symbolic-ref HEAD ^ /dev/null | sed 's/refs\/heads\///g')
end
