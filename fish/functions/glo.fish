function glo
	
  git log --graph --pretty=format:'%C(yellow)%h%Creset%C(red)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit $argv
end
