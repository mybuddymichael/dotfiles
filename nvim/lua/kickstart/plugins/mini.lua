return {
  { -- Collection of various small independent plugins/modules
    'echasnovski/mini.nvim',
    config = function()
      -- Better Around/Inside textobjects
      --
      -- Examples:
      --  - va)  - [V]isually select [A]round [)]paren
      --  - yinq - [Y]ank [I]nside [N]ext [Q]uote
      --  - ci'  - [C]hange [I]nside [']quote
      require('mini.ai').setup { n_lines = 500 }

      -- Add/delete/replace surroundings (brackets, quotes, etc.)
      --
      -- - saiw) - [S]urround [A]dd [I]nner [W]ord [)]Paren
      -- - sd'   - [S]urround [D]elete [']quotes
      -- - sr)'  - [S]urround [R]eplace [)] [']
      require('mini.surround').setup()

      -- Simple and easy statusline.
      --  You could remove this setup call if you don't like it,
      --  and try some other statusline plugin
      local statusline = require 'mini.statusline'
      statusline.setup {
        -- set use_icons to true if you have a Nerd Font
        use_icons = vim.g.have_nerd_font,
        content = {
          active = function()
            local mode, mode_hl = statusline.section_mode { trunc_width = 120 }
            local git = statusline.section_git { trunc_width = 40 }
            local diff = statusline.section_diff { trunc_width = 75 }
            local diagnostics = statusline.section_diagnostics { trunc_width = 75 }
            local lsp = statusline.section_lsp { trunc_width = 75 }
            local filename = statusline.section_filename { trunc_width = 140 }
            local fileinfo = statusline.section_fileinfo { trunc_width = 120 }
            local location = statusline.section_location { trunc_width = 75 }
            local formatter = statusline.section_formatter()

            return statusline.combine_groups {
              { hl = mode_hl, strings = { mode } },
              { hl = 'MiniStatuslineFilename', strings = { filename } },
              '%<', -- Mark general truncate point
              { hl = 'MiniStatuslineFileinfo', strings = { fileinfo } },
              '%=', -- End left alignment
              { hl = 'MiniStatuslineDevinfo', strings = { formatter, git, diff, diagnostics, lsp } },
              { hl = mode_hl, strings = { location } },
            }
          end,
        },
      }

      -- You can configure sections in the statusline by overriding their
      -- default behavior. For example, here we set the section for
      -- cursor location to LINE:COLUMN
      ---@diagnostic disable-next-line: duplicate-set-field
      statusline.section_location = function()
        return '%2l:%-2v'
      end

      -- Add formatter section to show active formatters
      statusline.section_formatter = function()
        local icon = vim.g.have_nerd_font and '󰉼 ' or '🔧 '

        local conform_ok, conform = pcall(require, 'conform')
        if conform_ok then
          local formatters = conform.list_formatters(0)
          if #formatters > 0 then
            local names = {}
            for _, formatter in ipairs(formatters) do
              table.insert(names, formatter.name)
            end
            return icon .. table.concat(names, ',')
          end
        end

        -- Check for LSP formatting capability
        local bufnr = vim.api.nvim_get_current_buf()
        local clients = vim.lsp.get_clients { bufnr = bufnr }
        for _, client in ipairs(clients) do
          if client.server_capabilities.documentFormattingProvider then
            return icon .. client.name
          end
        end

        return ''
      end

      -- ... and there is more!
      --  Check out: https://github.com/echasnovski/mini.nvim
    end,
  },
}
-- vim: ts=2 sts=2 sw=2 et
