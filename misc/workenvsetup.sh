# Set it up.

	ORIGINAL_DIR = `pwd`
	BASE_DIR = workenv/
	cd ~


# Link and copy files.

	ln -nfs $BASE_DIR/bin/ bin

	ln -nfs $BASE_DIR/bash/gitignore_global .gitignore_global
	ln -nfs $BASE_DIR/bash/profile .profile
	ln -nfs $BASE_DIR/bash/bashrc .bashrc
	cp -iv  $BASE_DIR/bash/gitconfig .gitconfig

	ln -nfs $BASE_DIR/vim/ .vim
	ln -nfs $BASE_DIR/vim/vimrc .vimrc
	ln -nfs $BASE_DIR/vim/gvimrc .gvimrc


# Change back to the original directory.

	cd $ORIGINAL_DIR
