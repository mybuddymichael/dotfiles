function tmux-start --description 'Starts a new tmux session with three vertical panes, or it attaches a session if one named "main" already exists.'

  tmux has-session -t main > /dev/null ^&1

  if test $status -eq 0
    tmux attach -t main
    return 0
  end

  tmux new-session -d -s main
  tmux new-window -t main:2
  tmux new-window -t main:3
  tmux join-pane -s main:2 -t main:1
  tmux join-pane -s main:3 -t main:1
  tmux select-layout -t main even-horizontal
  tmux attach -t main
end
