local function has_prettier_dependency(bufnr)
  -- Get the directory of the current buffer, fallback to cwd
  local current_dir
  if bufnr and vim.api.nvim_buf_is_valid(bufnr) then
    local bufname = vim.api.nvim_buf_get_name(bufnr)
    if bufname ~= '' then
      current_dir = vim.fn.fnamemodify(bufname, ':p:h')
    else
      current_dir = vim.fn.getcwd()
    end
  else
    current_dir = vim.fn.getcwd()
  end
  
  while current_dir ~= '/' do
    local package_json = current_dir .. '/package.json'
    local file = io.open(package_json, 'r')
    
    if file then
      local content = file:read '*all'
      file:close()
      
      local ok, json = pcall(vim.fn.json_decode, content)
      if ok then
        local deps = json.dependencies or {}
        local devDeps = json.devDependencies or {}
        
        if deps.prettier or devDeps.prettier or deps['@prettier/plugin-xml'] or devDeps['@prettier/plugin-xml'] then
          return true
        end
      end
    end
    
    -- Move up one directory
    current_dir = vim.fn.fnamemodify(current_dir, ':h')
  end
  
  return false
end

local function get_js_formatters(bufnr)
  if has_prettier_dependency(bufnr) then
    return { 'prettierd', 'prettier', stop_after_first = true }
  else
    return { 'biome' }
  end
end



return { -- Autoformat
  'stevearc/conform.nvim',
  event = { 'BufWritePre' },
  cmd = { 'ConformInfo' },
  keys = {
    {
      '<leader>f',
      function()
        require('conform').format { async = true, lsp_format = 'fallback' }
      end,
      mode = '',
      desc = '[F]ormat buffer',
    },
  },
  opts = {
    notify_on_error = false,
    format_on_save = function(bufnr)
      -- Disable "format_on_save lsp_fallback" for languages that don't
      -- have a well standardized coding style. You can add additional
      -- languages here or re-enable it for the disabled ones.
      local disable_filetypes = { c = true, cpp = true }
      if disable_filetypes[vim.bo[bufnr].filetype] then
        return nil
      else
        return {
          timeout_ms = 500,
          lsp_format = 'fallback',
        }
      end
    end,
    formatters_by_ft = {
      lua = { 'stylua' },
      go = { 'gofumpt' },
      javascript = function(bufnr) return get_js_formatters(bufnr) end,
      javascriptreact = function(bufnr) return get_js_formatters(bufnr) end,
      typescript = function(bufnr) return get_js_formatters(bufnr) end,
      typescriptreact = function(bufnr) return get_js_formatters(bufnr) end,
      json = function(bufnr) return get_js_formatters(bufnr) end,
      jsonc = function(bufnr) return get_js_formatters(bufnr) end,
      svelte = function(bufnr) return get_js_formatters(bufnr) end,
      toml = { 'taplo' },
    },
  },
}
-- vim: ts=2 sts=2 sw=2 et
