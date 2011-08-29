function rbenv_prompt_info() {
  version_string=$(rbenv version 2> /dev/null) || return
  echo "`expr "$version_string" : '\([^ ]*\)'` "
}
