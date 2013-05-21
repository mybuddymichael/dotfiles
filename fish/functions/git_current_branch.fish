function git_current_branch
	echo -n -s (git symbolic-ref HEAD | sed 's/refs\/heads\///')
end
