" Creator: Lars H. Nielsen (dengmao@gmail.com)
" Maintainer:  Michael Hanson
" Last Change: March 17 2011

set background=dark

hi clear

if exists("syntax_on")
  syntax reset
endif

let colors_name = "wombat"



" General colors
hi ColorColumn  guifg=NONE    guibg=#474d39 gui=none
hi Cursor       guifg=NONE    guibg=#656565 gui=none
hi CursorColumn guifg=NONE    guibg=#2d2d2d gui=none
hi CursorLine   guifg=NONE    guibg=#2d2d2d gui=none
hi Directory    guifg=#8ac6f2 guibg=NONE    gui=none
hi FoldColumn   guifg=#cae682 guibg=NONE    gui=none
hi Folded       guibg=#384048 guifg=#a0a8b0 gui=none
hi LineNr       guifg=#444444 guibg=NONE    gui=none
hi MatchParen   guifg=#000000 guibg=#ab51c9 gui=bold
hi MoreMsg      guifg=#e5786d guibg=NONE    gui=none
hi Normal       guifg=#f6f3e8 guibg=#242424 gui=none
hi NonText      guifg=#808080 guibg=NONE    gui=none
hi Pmenu        guifg=#f6f3e8 guibg=#444444 gui=none
hi PmenuSel     guifg=#000000 guibg=#cae682 gui=none
hi SpecialKey   guifg=#808080 guibg=NONE    gui=none
hi StatusLine   guifg=#444444 guibg=#cae682 gui=italic,bold
hi StatusLineNC guifg=#857b6f guibg=#444444 gui=italic
hi Title        guifg=#f6f3e8 guibg=NONE    gui=bold
hi VertSplit    guifg=#444444 guibg=#444444 gui=none
hi Visual       guifg=#f6f3e8 guibg=#444444 gui=none

" Syntax highlighting
hi Comment      guifg=#99968b gui=italic
hi Todo         guifg=#8f8f8f gui=italic
hi Constant     guifg=#e5786d gui=none
hi String       guifg=#95e454 gui=italic
hi Identifier   guifg=#cae682 gui=none
hi Function     guifg=#cae682 gui=none
hi Type         guifg=#cae682 gui=none
hi Statement    guifg=#8ac6f2 gui=none
hi Keyword      guifg=#8ac6f2 gui=none
hi PreProc      guifg=#e5786d gui=none
hi Number       guifg=#e5786d gui=none
hi Special      guifg=#e7f6da gui=none
