function jjd --description 'Show jj diff using hunk as the pager'
    jj --config 'ui.pager=["hunk", "pager"]' diff $argv
end
