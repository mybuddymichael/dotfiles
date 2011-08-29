# get the name of the branch we are on
function git_prompt_info() {
  ref=$(git symbolic-ref HEAD 2> /dev/null) || return
  echo "$git_prefix${ref#refs/heads/}$(parse_git_dirty)$(git_prompt_status)$git_suffix"
}

# Checks if working tree is dirty
parse_git_dirty() {
  if [[ -n $(git status -s 2> /dev/null) ]]; then
    echo "$git_prompt_dirty"
  else
    echo "$git_prompt_clean"
  fi
}

# Checks if there are commits ahead from remote
function git_prompt_ahead() {
  if $(echo "$(git log origin/$(current_branch)..HEAD 2> /dev/null)" | grep '^commit' &> /dev/null); then
    echo "$ZSH_THEME_GIT_PROMPT_AHEAD"
  fi
}

# Formats prompt string for current git commit short SHA
function git_prompt_short_sha() {
  SHA=$(git rev-parse --short HEAD 2> /dev/null) && echo "$ZSH_THEME_GIT_PROMPT_SHA_BEFORE$SHA$ZSH_THEME_GIT_PROMPT_SHA_AFTER"
}

# Formats prompt string for current git commit long SHA
function git_prompt_long_sha() {
  SHA=$(git rev-parse HEAD 2> /dev/null) && echo "$ZSH_THEME_GIT_PROMPT_SHA_BEFORE$SHA$ZSH_THEME_GIT_PROMPT_SHA_AFTER"
}

# Get the status of the working tree
git_prompt_status() {
  index=$(git status --porcelain 2> /dev/null)
  STATUS=""
  if $(echo "$index" | grep '^?? ' &> /dev/null); then
    STATUS="$git_prompt_untracked$STATUS"
  fi
  if $(echo "$index" | grep '^A  ' &> /dev/null); then
    STATUS="$git_prompt_added$STATUS"
  elif $(echo "$index" | grep '^M  ' &> /dev/null); then
    STATUS="$git_prompt_added$STATUS"
  elif $(echo "$index" | grep '^MM ' &> /dev/null); then
    STATUS="$git_prompt_added$STATUS"
  fi
  if $(echo "$index" | grep '^ M ' &> /dev/null); then
    STATUS="$git_prompt_modified$STATUS"
  elif $(echo "$index" | grep '^AM ' &> /dev/null); then
    STATUS="$git_prompt_modified$STATUS"
  elif $(echo "$index" | grep '^ T ' &> /dev/null); then
    STATUS="$git_prompt_modified$STATUS"
  elif $(echo "$index" | grep '^MM ' &> /dev/null); then
    STATUS="$git_prompt_modified$STATUS"
  fi
  if $(echo "$index" | grep '^R  ' &> /dev/null); then
    STATUS="$git_prompt_renamed$STATUS"
  fi
  if $(echo "$index" | grep '^D  ' &> /dev/null); then
    STATUS="$git_prompt_deleted$STATUS"
  elif $(echo "$index" | grep '^AD ' &> /dev/null); then
    STATUS="$git_prompt_deleted$STATUS"
  fi
  if $(echo "$index" | grep '^UU ' &> /dev/null); then
    STATUS="$git_prompt_unmerged$STATUS"
  fi
  echo $STATUS
}
