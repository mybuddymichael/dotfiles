return {
  'codethread/qmk.nvim',
  event = {
    'BufRead keymap.c',
    'BufRead **/keymaps/**/*.c',
    'BufRead **/qmk_firmware/**/*.c',
  },
  config = function()
    ---@type qmk.UserConfig
    local conf = {
      name = 'LAYOUT_split_3x6_3',
      layout = {
        'x x x x x x _ _ x x x x x x',
        'x x x x x x _ _ x x x x x x',
        'x x x x x x _ _ x x x x x x',
        '_ _ _ _ x x x x x x _ _ _ _',
      },
      comment_preview = {
        keymap_overrides = {},
      },
    }
    require('qmk').setup(conf)
  end,
}
