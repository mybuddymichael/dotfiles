-- Markdown-specific settings for proper list formatting with gw
vim.opt_local.formatoptions = 'tcqln'
vim.opt_local.formatlistpat = [[^\s*[-*+]\s\+\|^\s*\d\+[\]:.)}\t ]\s*]]

-- Set comments to recognize markdown list markers
-- The 'b:' prefix means blank required after the marker
vim.opt_local.comments = 'b:- ,b:* ,b:+ ,b:1. ,n:>'

-- Enable auto-indent to preserve list indentation
vim.opt_local.autoindent = true