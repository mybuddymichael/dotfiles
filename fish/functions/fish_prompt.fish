function fish_prompt -d "Write out the prompt"
  # Create a prompt arrow.
	set -l arrow_color
	if test $status -eq 0
		set arrow_color (set_color green)
	else
		set arrow_color (set_color red)
	end
	set -l arrow (string join '' "$arrow_color" '→ ' (set_color normal))

	set -l cwd_color
	set -l root_pre_character

	switch $USER
  case root
		set cwd_color (set_color $fish_color_cwd_root)
		set root_pre_character (string join '' (set_color red) '# ' (set_color normal))
	case '*'
	  set cwd_color (set_color $fish_color_cwd)
	  # Add jj info here
		set -l jj_info ""
		set -l template '
		separate(" ",
		truncate_end(4, format_short_change_id_with_hidden_and_divergent_info(self)),
		format_short_signature_oneline(author),
		truncate_end(16, bookmarks, "…"),
		if(empty, label("empty", "(empty)")),
		if(description,
        description.first_line(),
        label(if(empty, "empty"), description_placeholder),
      ),
		)
		'
		# Check if inside a jj project
		if jj root &>/dev/null
			set jj_info (string trim (jj log --color always --no-graph -r '@' -T "$template" 2>/dev/null))
		end
		set -l base_prompt (string join '' "$root_pre_character" "$cwd_color" (prompt_pwd) (set_color normal) " $jj_info")
		if test (string length --visible $base_prompt) -gt (expr $COLUMNS)
			set base_prompt (string shorten -m (expr $COLUMNS) $base_prompt)
		end
		echo -n -s -e "$base_prompt\n$arrow"
	end
end
