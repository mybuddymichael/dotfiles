local function has_prettier_dependency()
  local package_json = vim.fn.findfile('package.json', '.;')
  if package_json == '' then
    return false
  end

  local file = io.open(package_json, 'r')
  if not file then
    return false
  end

  local content = file:read '*all'
  file:close()

  local ok, json = pcall(vim.fn.json_decode, content)
  if not ok then
    return false
  end

  local deps = json.dependencies or {}
  local devDeps = json.devDependencies or {}

  return deps.prettier or devDeps.prettier or deps['@prettier/plugin-xml'] or devDeps['@prettier/plugin-xml']
end

local function get_js_formatters()
  if has_prettier_dependency() then
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
      javascript = get_js_formatters,
      javascriptreact = get_js_formatters,
      typescript = get_js_formatters,
      typescriptreact = get_js_formatters,
      json = get_js_formatters,
      jsonc = get_js_formatters,
      toml = { 'taplo' },
    },
  },
}
-- vim: ts=2 sts=2 sw=2 et
