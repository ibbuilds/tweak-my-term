-- quiet: calm dark WezTerm look (tweak-my-term preset). Same file on Windows, macOS, Linux.
local wezterm = require 'wezterm'
local config = wezterm.config_builder()

-- WezTerm bundles JetBrains Mono and the Nerd Font symbols, so nothing to install.
config.font = wezterm.font_with_fallback { 'JetBrains Mono', 'Symbols Nerd Font Mono' }
config.font_size = 12.5
config.line_height = 1.15
config.harfbuzz_features = { 'calt=1', 'liga=1' }
config.bold_brightens_ansi_colors = false

config.colors = {
  foreground = '#D5D8DE',
  background = '#16181D',
  cursor_bg = '#8FB3C9',
  cursor_border = '#8FB3C9',
  cursor_fg = '#16181D',
  selection_bg = '#2F3A47',
  selection_fg = '#EEF0F3',
  ansi = { '#3A3F4A', '#D47E7E', '#9DBF8F', '#D9BE85', '#82A8C9', '#B596C4', '#82BDB8', '#C5C9D1' },
  brights = { '#6B7280', '#E39A9A', '#B3D1A6', '#E6D09E', '#9DBDDB', '#C9AED6', '#9DD0CB', '#EEF0F3' },
  tab_bar = {
    background = '#16181D',
    active_tab = { bg_color = '#16181D', fg_color = '#8FB3C9' },
    inactive_tab = { bg_color = '#16181D', fg_color = '#6B7280' },
    inactive_tab_hover = { bg_color = '#1E2128', fg_color = '#C5C9D1' },
    new_tab = { bg_color = '#16181D', fg_color = '#6B7280' },
    new_tab_hover = { bg_color = '#1E2128', fg_color = '#C5C9D1' },
  },
}

config.window_padding = { left = 18, right = 18, top = 14, bottom = 10 }
config.window_decorations = 'INTEGRATED_BUTTONS|RESIZE'
config.use_fancy_tab_bar = false
config.hide_tab_bar_if_only_one_tab = true
config.tab_bar_at_bottom = true
config.enable_scroll_bar = false
config.default_cursor_style = 'SteadyBar'
config.initial_cols = 140
config.initial_rows = 38
config.audible_bell = 'Disabled'
config.visual_bell = { fade_in_duration_ms = 60, fade_out_duration_ms = 120, target = 'CursorColor' }

-- Windows: start PowerShell instead of cmd.exe. Change to Git Bash if you prefer:
-- { 'C:\\Program Files\\Git\\bin\\bash.exe', '-l', '-i' }
if wezterm.target_triple:find 'windows' then
  config.default_prog = { 'powershell.exe', '-NoLogo' }
end

return config
