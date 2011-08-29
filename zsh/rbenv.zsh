function rbenv_prompt_info() {
  version_string=$(rbenv version) || return
  echo "`expr "$version_string" : '\([^ ]*\)'` "
}
