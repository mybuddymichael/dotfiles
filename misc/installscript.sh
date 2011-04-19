	[[ -d ~/installtmp ]] && mkdir ~/installtmp
	INSTALL_ROOT = ~/installtmp
	cd $INSTALL_ROOT


# Install Google Chrome.

	echo '*** Download Google Chrome...'
	curl -OLkf# https://dl-ssl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg
	hdiutil attach -quiet -noautoopen $INSTALL_ROOT/googlechrome.dmg
	cp -iv /Volumes/Google\ Chrome/Google\ Chrome.app ~/Applications/Google\ Chrome.app
	hdiutil detach -quiet /Volumes/Google\ Chrome/
	rm -f $INSTALL_ROOT/googlechrome.dmg
