set background=dark

hi clear

if exists("syntax_on")
	syntax reset
endif

let colors_name = "alfred"

" Colors
" Standard white:      #f3f3f3
" Standard gray:       #191919
" Medium purple:       #640cab
" Medium blue:         #04819e
" Medium orange:       #ff4100
" Medium yellow:       #fff500
" Light purple:        #9240d5
" Light blue:          #38b2ce
" Light orange:        #ff7140
" Light yellow:        #fff840
" Super light purple:  #a468d5
" Super light blue:    #60b9ce
" Super light orange:  #ff9773
" Super light yellow:  #fffa73
" Dark purple:         #3f046f
" Dark blue:           #015367
" Dark orange:         #a62a00
" Dark yellow:         #a69f00

hi Normal       guifg=#f3f3f3 guibg=#191919 gui=NONE

hi LineNr       guifg=#60b9ce guibg=NONE    gui=none
hi CursorLine   guifg=NONE    guibg=#252525 gui=none
hi Comment      guifg=#015367 gui=italic
hi Identifier   guifg=#ff4100 gui=none
hi Type         guifg=#cae682 gui=none

