" Vim color file
" Converted from Textmate theme Hunch Dark using Coloration v0.2.5 (http://github.com/sickill/coloration)

set background=dark
highlight clear

if exists("syntax_on")
  syntax reset
endif

let g:colors_name = "hunch-dark"

hi Cursor  guifg=NONE guibg=#00f7f7 gui=NONE
hi Visual  guifg=NONE guibg=#3c4043 gui=NONE
hi CursorLine  guifg=NONE guibg=#1b1b1b gui=NONE
hi CursorColumn  guifg=NONE guibg=#1b1b1b gui=NONE
hi LineNr  guifg=#696969 guibg=#141414 gui=NONE
hi VertSplit  guifg=#343434 guibg=#343434 gui=NONE
hi MatchParen  guifg=#52b3da guibg=NONE gui=NONE
hi StatusLine  guifg=#bebebe guibg=#343434 gui=bold
hi StatusLineNC  guifg=#bebebe guibg=#343434 gui=NONE
hi Pmenu  guifg=#9b703f guibg=NONE gui=NONE
hi PmenuSel  guifg=NONE guibg=#3c4043 gui=NONE
hi IncSearch  guifg=NONE guibg=#343a44 gui=NONE
hi Search  guifg=NONE guibg=#343a44 gui=NONE
hi Directory  guifg=#d36d8e guibg=NONE gui=NONE
hi Folded  guifg=#5d5d5d guibg=#141414 gui=NONE

hi Normal  guifg=#bebebe guibg=#141414 gui=NONE
hi Boolean  guifg=#d36d8e guibg=NONE gui=NONE
hi Character  guifg=#d36d8e guibg=NONE gui=NONE
hi Comment  guifg=#5d5d5d guibg=NONE gui=italic
hi Conditional  guifg=#52b3da guibg=NONE gui=NONE
hi Constant  guifg=#d36d8e guibg=NONE gui=NONE
hi Define  guifg=#52b3da guibg=NONE gui=NONE
hi ErrorMsg  guifg=NONE guibg=NONE gui=NONE
hi WarningMsg  guifg=NONE guibg=NONE gui=NONE
hi Float  guifg=#d36d8e guibg=NONE gui=NONE
hi Function  guifg=#52e1b5 guibg=NONE gui=NONE
hi Identifier  guifg=#f9ee98 guibg=NONE gui=NONE
hi Keyword  guifg=#52b3da guibg=NONE gui=NONE
hi Label  guifg=#6e9d54 guibg=NONE gui=NONE
hi NonText  guifg=#4f4f4f guibg=#1b1b1b gui=NONE
hi Number  guifg=#d36d8e guibg=NONE gui=NONE
hi Operator  guifg=#52b3da guibg=NONE gui=NONE
hi PreProc  guifg=#52b3da guibg=NONE gui=NONE
hi Special  guifg=#bebebe guibg=NONE gui=NONE
hi SpecialKey  guifg=#4f4f4f guibg=#1b1b1b gui=NONE
hi Statement  guifg=#52b3da guibg=NONE gui=NONE
hi StorageClass  guifg=#f9ee98 guibg=NONE gui=NONE
hi String  guifg=#6e9d54 guibg=NONE gui=NONE
hi Tag  guifg=#9b703f guibg=NONE gui=NONE
hi Title  guifg=#bebebe guibg=NONE gui=bold
hi Todo  guifg=#5d5d5d guibg=NONE gui=inverse,bold,italic
hi Type  guifg=#9b703f guibg=NONE gui=NONE
hi Underlined  guifg=NONE guibg=NONE gui=underline
hi rubyClass  guifg=#52b3da guibg=NONE gui=NONE
hi rubyFunction  guifg=#52e1b5 guibg=NONE gui=NONE
hi rubyInterpolationDelimiter  guifg=NONE guibg=NONE gui=NONE
hi rubySymbol  guifg=#d36d8e guibg=NONE gui=NONE
hi rubyConstant  guifg=#9b859d guibg=NONE gui=NONE
hi rubyStringDelimiter  guifg=#6e9d54 guibg=NONE gui=NONE
hi rubyBlockParameter  guifg=#7587a6 guibg=NONE gui=NONE
hi rubyInstanceVariable  guifg=#7587a6 guibg=NONE gui=NONE
hi rubyInclude  guifg=#52b3da guibg=NONE gui=NONE
hi rubyGlobalVariable  guifg=#7587a6 guibg=NONE gui=NONE
hi rubyRegexp  guifg=#e9c062 guibg=NONE gui=NONE
hi rubyRegexpDelimiter  guifg=#e9c062 guibg=NONE gui=NONE
hi rubyEscape  guifg=#d36d8e guibg=NONE gui=NONE
hi rubyControl  guifg=#52b3da guibg=NONE gui=NONE
hi rubyClassVariable  guifg=#7587a6 guibg=NONE gui=NONE
hi rubyOperator  guifg=#52b3da guibg=NONE gui=NONE
hi rubyException  guifg=#52b3da guibg=NONE gui=NONE
hi rubyPseudoVariable  guifg=#7587a6 guibg=NONE gui=NONE
hi rubyRailsUserClass  guifg=#9b859d guibg=NONE gui=NONE
hi rubyRailsARAssociationMethod  guifg=#dad085 guibg=NONE gui=NONE
hi rubyRailsARMethod  guifg=#dad085 guibg=NONE gui=NONE
hi rubyRailsRenderMethod  guifg=#dad085 guibg=NONE gui=NONE
hi rubyRailsMethod  guifg=#dad085 guibg=NONE gui=NONE
hi erubyDelimiter  guifg=NONE guibg=NONE gui=NONE
hi erubyComment  guifg=#5d5d5d guibg=NONE gui=italic
hi erubyRailsMethod  guifg=#dad085 guibg=NONE gui=NONE
hi htmlTag  guifg=#ac885b guibg=NONE gui=NONE
hi htmlEndTag  guifg=#ac885b guibg=NONE gui=NONE
hi htmlTagName  guifg=#ac885b guibg=NONE gui=NONE
hi htmlArg  guifg=#ac885b guibg=NONE gui=NONE
hi htmlSpecialChar  guifg=#d36d8e guibg=NONE gui=NONE
hi javaScriptFunction  guifg=#f9ee98 guibg=NONE gui=NONE
hi javaScriptRailsFunction  guifg=#dad085 guibg=NONE gui=NONE
hi javaScriptBraces  guifg=NONE guibg=NONE gui=NONE
hi yamlKey  guifg=#9b703f guibg=NONE gui=NONE
hi yamlAnchor  guifg=#7587a6 guibg=NONE gui=NONE
hi yamlAlias  guifg=#7587a6 guibg=NONE gui=NONE
hi yamlDocumentHeader  guifg=#6e9d54 guibg=NONE gui=NONE
hi cssURL  guifg=#7587a6 guibg=NONE gui=NONE
hi cssFunctionName  guifg=#dad085 guibg=NONE gui=NONE
hi cssColor  guifg=#d36d8e guibg=NONE gui=NONE
hi cssPseudoClassId  guifg=#9b703f guibg=NONE gui=NONE
hi cssClassName  guifg=#9b703f guibg=NONE gui=NONE
hi cssValueLength  guifg=#d36d8e guibg=NONE gui=NONE
hi cssCommonAttr  guifg=#cf6a4c guibg=NONE gui=NONE
hi cssBraces  guifg=NONE guibg=NONE gui=NONE
