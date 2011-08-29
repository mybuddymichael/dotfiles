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

Much credit is due to [Robby Russell] and the `[oh-my-zsh]` team for creating a
*pile* of cool zsh configurations.

Also, [Zach Holman] has some great stuff in [his dotfiles repo], some of which
is borrowed here, and all of which is worth checking out.

## License

The MIT License

Copyright © 2011 Michael Hanson

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


[Robby Russell]: https://github.com/robbyrussell
[oh-my-zsh]: https://github.com/robbyrussell/oh-my-zsh
[Zach Holman]: https://github.com/holman
[his dotfiles repo]: https://github.com/holman/dotfiles
