function la
  set level
  set -q argv[1]; or set level 2
  eza --all --long --ignore-glob=".git" --octal-permissions --no-permissions --no-user --tree --icons --level=$level
end
