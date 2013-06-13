function git-status-prompt
	
  set -l symbol_clean (echo -n -s (set_color green) 'G' (set_color normal))
  set -l symbol_untracked (echo -n -s (set_color cyan) '?' (set_color normal))
  set -l symbol_added (echo -n -s (set_color green) '+' (set_color normal))
  set -l symbol_modified (echo -n -s (set_color yellow) '/' (set_color normal))
  set -l symbol_renamed (echo -n -s (set_color brown) '→' (set_color normal))
  set -l symbol_deleted (echo -n -s (set_color red) '-' (set_color normal))

  set -l index (git status --porcelain ^ /dev/null)
  set -l __status

  if test -z "$index"
    set __status (echo -n -s "$symbol_clean")
  else

  set -l untracked (for l in $index; echo $l; end | grep '^?? ')
  if test "$untracked"
    set __status (echo -n -s "$symbol_untracked$__status")
  end

  set -l added (for l in $index; echo $l; end | grep '^A  \|^M  \|^MM ')
  if test "$added"
    set __status (echo -n -s "$symbol_added$__status")
  end

  set -l modified (for l in $index; echo $l; end | grep '^ M \|^AM \|^ T \|^MM \|^RM ')
  if test "$modified"
    set __status (echo -n -s "$symbol_modified$__status")
  end

  set -l renamed (for l in $index; echo $l; end | grep '^R  \|^RM ')
  if test "$renamed"
    set __status (echo -n -s "$symbol_renamed$__status")
  end

  set -l deleted (for l in $index; echo $l; end | grep '^D  \|^AD ')
  if test "$deleted"
    set __status (echo -n -s "$symbol_deleted$__status")
  end

  set -l unmerged (for l in $index; echo $l; end | grep '^UU ')
  if test "$unmerged"
    set __status (echo -n -s "$symbol_unmerged$__status")
  end

  echo -s -n "$__status"
end
