# Set it up.

	[[ -d ~/installtmp ]] && mkdir ~/installtmp
	INSTALL_ROOT = ~/installtmp
	cd $INSTALL_ROOT


# Install Homebrew.

	echo '*** Installing Homebrew...'
	sudo rm -rf /usr/local/include
	sudo rm -rf /usr/local/lib
	ruby -e "$(curl -fsSLk https://gist.github.com/raw/323731/install_homebrew.rb)"


# Install Git

	echo '*** Installing Git...'
	brew install Git


# Install Google Chrome.

	echo '*** Downloading and installing Google Chrome...'
	curl -OLkf# https://dl-ssl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg
	hdiutil attach -quiet -noautoopen $INSTALL_ROOT/googlechrome.dmg
	cp -iv /Volumes/Google\ Chrome/Google\ Chrome.app ~/Applications/Google\ Chrome.app
	hdiutil detach -quiet /Volumes/Google\ Chrome
	rm -f $INSTALL_ROOT/googlechrome.dmg


# Install Rdio client.

	echo '*** Installing Rdio...'
	curl -OLkf# http://www.rdio.com/media/desktop/mac/Rdio.dmg
	hdiutil attach -quiet -noautoopen $INSTALL_ROOT/Rdio.dmg
	cp -iv /Volumes/Rdio/Rdio.app ~/Applications/Rdio.app
	hdiutil detach -quiet /Volumes/Rdio
	rm -f $INSTALL_ROOT/Rdio.dmg
