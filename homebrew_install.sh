#!/usr/bin/env sh
#
# Install Homebrew and some programs.

set -e

/usr/bin/ruby -e "$(curl -fsSL https://raw.github.com/gist/323731)"

# Git is required for everything else
brew install git

brew install ack
brew install browser
brew install cloc
brew install coffee-script
brew install ctags
brew install gist
brew install glib
brew install hub
brew install lynx
brew install node
brew install rbenv
brew install ruby-build
brew install sqlite
brew install tree
