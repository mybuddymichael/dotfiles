# get the name of the branch we are on
function rvm_prompt_info() {
  ruby_version=$(~/.rvm/bin/rvm-prompt g s 2> /dev/null) || return
  echo "rvm:$ruby_version"
}


