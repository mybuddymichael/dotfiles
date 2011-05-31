# Set it up.

    ORIGINAL_DIR=`pwd`
    BASE_DIR=workenv


# Link and copy files.

    cd $HOME

    ln -sv $BASE_DIR/bin/ bin

    ln -sv $BASE_DIR/zsh/ .zsh
    ln -sv $BASE_DIR/zsh/.zshrc .zshrc

    ln -sv $BASE_DIR/bash/bashrc .bashrc
    ln -sv $BASE_DIR/bash/profile .profile
    ln -sv $BASE_DIR/bash/gitignore_global .gitignore_global
    cp -iv $BASE_DIR/bash/gitconfig .gitconfig

    ln -sv $BASE_DIR/vim/ .vim
    ln -sv $BASE_DIR/vim/vimrc .vimrc
    ln -sv $BASE_DIR/vim/gvimrc .gvimrc


# Change back to the original directory.

    cd $ORIGINAL_DIR
