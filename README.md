dotfiles
========

My dotfiles and home-folder bin/ directory.

## Installation

    git clone git://github.com/mybuddymichael/dotfiles.git ~/.dotfiles
    cd ~/.dotfiles
    rake

This will symlink everything with a `.symlink` extension into $HOME.

## Notes

You should check out `git/gitconfig.symlink.example`. Make whatever changes you
need then rename it to `git/gitconfig.symlink`. Then you can run `rake` again
to symlink the file.

Much credit is due to [Robby Russell] and the [oh-my-zsh] team for creating a
*pile* of cool zsh configurations.

Also, [Zach Holman] has some great stuff in [his dotfiles repo], some of which
is borrowed here, and all of which is worth checking out.

## License

Copyright © 2011 Michael Hanson; see LICENSE.


[Robby Russell]: https://github.com/robbyrussell
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[Zach Holman]: https://github.com/holman
[his dotfiles repo]: https://github.com/holman/dotfiles
