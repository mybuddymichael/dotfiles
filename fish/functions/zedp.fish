function zedp
	# If the function has an argument, let's call zed-preview with it.
	# Otherwise, let's call zed-preview with the current directory.
	if test (count $argv) -gt 1
		zed-preview $argv
	else
		zed-preview .
	end
end
