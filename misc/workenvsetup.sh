# Set it up.

	ORIGINAL_DIR=`pwd`
	BASE_DIR=workenv/
	cd ~


# Link and copy files.

	ln -nfsv $BASE_DIR/bin/ bin

	ln -nfsv $BASE_DIR/bash/bashrc .bashrc
	ln -nfsv $BASE_DIR/bash/profile .profile
	ln -nfsv $BASE_DIR/bash/gitignore_global .gitignore_global
	cp -iv   $BASE_DIR/bash/gitconfig .gitconfig

	ln -nfsv $BASE_DIR/vim/ .vim
	ln -nfsv $BASE_DIR/vim/vimrc .vimrc
	ln -nfsv $BASE_DIR/vim/gvimrc .gvimrc


# Change back to the original directory.

	cd $ORIGINAL_DIR
