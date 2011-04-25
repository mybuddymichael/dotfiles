# Set it up.

	ORIGINAL_DIR=`pwd`

	[[ ! -d ~/installtmp ]] && mkdir ~/installtmp
	[[ ! -e ~/installtmp/install_log.txt ]] && touch ~/installtmp/install_log.txt

	INSTALL_ROOT=~/installtmp
	INSTALL_LOG=~/installtmp/install_log.txt

	cd $INSTALL_ROOT


# Install Homebrew.

	echo '*** Installing Homebrew...'

	sudo rm -rf /usr/local/include
	sudo rm -rf /usr/local/lib
	ruby -e "$(curl -fsSLk https://gist.github.com/raw/323731/install_homebrew.rb)"

	if [[ `which brew` ]]; then
		echo 'Homebrew installed' >> $INSTALL_LOG
	else
		echo 'HOMEBREW NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install Git.

	echo '*** Installing Git...'

	brew install git

	if [[ `which git` ]]; then
		echo 'Git installed' >> $INSTALL_LOG
	else
		echo 'GIT NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install my work environment.

	echo '*** Installing workenv...'

	cd ~
	git pull git@github.com:thePapacy/workenv.git
	. ~/workenv/misc/workenvsetup.sh

	if [[ -d ~/workenv ]]; then
		echo 'workenv/ installed' >> $INSTALL_LOG
	else
		echo 'WORKENV/ NOT INSTALLED' >> $INSTALL_LOG
	fi

	cd $INSTALL_ROOT


# Install bash-completion.

	echo '*** Installing bash-completion...'

	brew install bash-completion


# Install hub.

	echo '*** Installing hub...'

	brew install hub


# Install RVM.

	echo '*** Installing Ruby Version Manager...'

	bash < <(curl -s https://rvm.beginrescueend.com/install/rvm)

	if [[ `which rvm` ]]; then
		echo 'RVM installed' >> $INSTALL_LOG
	else
		echo 'RVM NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install MacVim.

	echo '*** Installing MacVim...'

	curl -OLkf# https://github.com/downloads/b4winckler/macvim/MacVim-snapshot-57.tbz
	tar -xf MacVim-snapshot-57.tbz && mv MacVim-snapshot-57 MacVim
	cp MacVim/MacVim.app /Applications/MacVim.app
	rm -rf MacVim MacVim-snapshot-57.tbz

	if [[ -s /Applications/MacVim.app ]]; then
		echo 'MacVim installed' >> $INSTALL_LOG
	else
		echo 'MACVIM NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install Google Chrome.

	echo '*** Downloading and installing Google Chrome...'

	curl -OLkf# https://dl-ssl.google.com/chrome/mac/stable/GGRO/googlechrome.dmg
	hdiutil attach -quiet -noautoopen $INSTALL_ROOT/googlechrome.dmg
	cp -iv /Volumes/Google\ Chrome/Google\ Chrome.app ~/Applications/Google\ Chrome.app
	hdiutil detach -quiet /Volumes/Google\ Chrome
	rm -f $INSTALL_ROOT/googlechrome.dmg

	if [[ -s ~/Applications/Google\ Chrome.app ]]; then
		echo 'Google Chrome installed' >> $INSTALL_LOG
	else
		echo 'GOOGLE CHROME NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install Rdio client.

	echo '*** Installing Rdio...'

	curl -OLkf# http://www.rdio.com/media/desktop/mac/Rdio.dmg
	hdiutil attach -quiet -noautoopen $INSTALL_ROOT/Rdio.dmg
	cp -iv /Volumes/Rdio/Rdio.app ~/Applications/Rdio.app
	hdiutil detach -quiet /Volumes/Rdio
	rm -f $INSTALL_ROOT/Rdio.dmg

	if [[ -s ~/Applications/Rdio.app ]]; then
		echo 'Rdio installed' >> $INSTALL_LOG
	else
		echo 'RDIO NOT INSTALLED' >> $INSTALL_LOG
	fi


# Install 1password.

	echo '*** Installing 1password'

	curl -OLkf# http://aws.cachefly.net/aws/dmg/1PW3/English/1Password-3.5.9.zip
	unzip 1Password-3.5.9.zip
	mv -iv $INSTALL_ROOT/1Password.app ~/Applications/1Password.app
	rm 1Password-3.5.9.zip

	if [[ -s ~/Applications/1password.app ]]; then
		echo '1password installed' >> $INSTALL_LOG
	else
		echo '1PASSWORD NOT INSTALLED' >> $INSTALL_LOG
	fi
