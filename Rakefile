require 'rake'

task :default => 'install'

desc "Hook our dotfiles into system-standard positions."
task :install do
  linkables = Dir.glob('**/[^%]*{.symlink}')

  skip_all = false
  overwrite_all = false
  backup_all = false

  options  = "[s]kip, [S]kip all, [o]verwrite, [O]verwrite all,"
  options += " [b]ackup, [B]ackup all"


  linkables.each do |linkable|
    overwrite = false
    backup = false

    file = linkable.split('/').last.split('.symlink').last
    target = "#{ENV["HOME"]}/.#{file}"

    if File.exists?(target) || File.symlink?(target)
      unless skip_all || overwrite_all || backup_all
        puts "File already exists: #{target}, what do you want to do?"
        puts options

        case STDIN.gets.chomp
        when 'o' then overwrite = true
        when 'b' then backup = true
        when 'O' then overwrite_all = true
        when 'B' then backup_all = true
        when 'S' then skip_all = true
        end
      end
      FileUtils.rm_rf(target) if overwrite || overwrite_all
      `mv $HOME/.#{file} $HOME/.#{file}.backup` if backup || backup_all
    end
    `ln -s $PWD/#{linkable} #{target}`
  end

  unless File.directory?("#{ENV["HOME"]}/.vim/undo")
    Dir.mkdir("#{ENV["HOME"]}/.vim/undo")
  end

  `git submodule update --init`
end
