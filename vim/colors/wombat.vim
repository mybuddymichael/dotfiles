" Maintainer:  Michael Hanson
" Last Change: March 10 2011

set background=dark

hi clear

if exists("syntax_on")
  syntax reset
endif

let colors_name = "wombat"


" Vim >= 7.0 specific colors
if version >= 700
	hi ColorColumn  guibg=#474d39
	hi CursorLine   guibg=#2d2d2d
	hi CursorColumn guibg=#2d2d2d
	hi MatchParen   guifg=#000000 guibg=#ab51c9 gui=bold
	hi Pmenu        guifg=#f6f3e8 guibg=#444444
	hi PmenuSel     guifg=#000000 guibg=#cae682
endif

" General colors
hi Cursor       guifg=NONE    guibg=#656565 gui=none
hi Directory    guifg=#8ac6f2 guibg=NONE    gui=none
hi FoldColumn   guifg=#cae682 guibg=NONE    gui=none
hi Normal       guifg=#f6f3e8 guibg=#242424 gui=none
hi NonText      guifg=#808080 guibg=NONE    gui=none
hi LineNr       guifg=#444444 guibg=NONE    gui=none
hi StatusLine   guifg=#444444 guibg=#cae682 gui=italic,bold
hi StatusLineNC guifg=#857b6f guibg=#444444 gui=italic
hi VertSplit    guifg=#444444 guibg=#444444 gui=none
hi Folded       guibg=#384048 guifg=#a0a8b0 gui=none
hi Title        guifg=#f6f3e8 guibg=NONE    gui=bold
hi Visual       guifg=#f6f3e8 guibg=#444444 gui=none
hi SpecialKey   guifg=#808080 guibg=NONE    gui=none

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
