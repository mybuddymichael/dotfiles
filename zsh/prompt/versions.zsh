function rbenv_prompt_info() {
  version_string=$(rbenv version 2> /dev/null) || return
  echo "`expr "$version_string" : '\([^ ]*\)'`"
}

function node_prompt_info() {
  version_string=$(node -v 2> /dev/null) || return
  echo "`expr "$version_string" : 'v\([0-9A-Za-z\.\-]*\)'`"
}

function coffeescript_prompt_info() {
  version_string=$(coffee -v 2> /dev/null) || return
  echo "`expr "$version_string" : '[^0-9]*\([0-9\.]*\)'`"
}
