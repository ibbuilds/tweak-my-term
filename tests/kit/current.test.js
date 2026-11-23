'use strict';
// Reading what the user's terminal looks like today from captured config files.
const mkTmp = require('../_tmp');
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { readCurrent } = require('../../kit/current');

function captured(files) {
  const dir = mkTmp('tmt-cur-');
  for (const [rel, text] of Object.entries(files)) {
    const f = path.join(dir, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
  }
  return dir;
}

const WT_SCHEME = {
  name: 'Dusk', background: '#16141F', foreground: '#D6D0E0', cursorColor: '#C9A0F0', selectionBackground: '#3A3350',
  black: '#1E1B29', red: '#D9798A', green: '#8FBF9A', yellow: '#E0C08A', blue: '#8AA4E0', purple: '#C9A0F0', cyan: '#86C5C9', white: '#C8C2D4',
  brightBlack: '#5D5670', brightRed: '#E896A4', brightGreen: '#A8D4B2', brightYellow: '#ECD3A6', brightBlue: '#A6BBEC', brightPurple: '#D9BCF5', brightCyan: '#A3D6D9', brightWhite: '#EEEAF4',
};

test('Windows Terminal: default profile font, padding, opacity and scheme colors', () => {
  const dir = captured({
    'windows-terminal/settings.json': `// comment
{
  "defaultProfile": "{b}",
  "profiles": {
    "defaults": { "colorScheme": "Dusk", "font": { "face": "JetBrainsMono Nerd Font", "size": 13, "cellHeight": "1.25" }, "padding": "16, 12", "opacity": 90, "useAcrylic": true },
    "list": [ { "guid": "{a}", "name": "PowerShell" }, { "guid": "{b}", "name": "Git Bash", "cursorShape": "bar" } ]
  },
  "schemes": [ ${JSON.stringify(WT_SCHEME)} ],
}`,
  });
  const wt = readCurrent(dir).terminals['windows-terminal'];
  assert.strictEqual(wt.scheme, 'Dusk');
  assert.strictEqual(wt.palette.background, '#16141F');
  assert.strictEqual(wt.palette.ansi.magenta, '#C9A0F0');
  assert.deepStrictEqual(wt.font, { family: 'JetBrainsMono Nerd Font', size: 13, lineHeight: 1.25 });
  assert.deepStrictEqual(wt.window.padding, [12, 16, 12, 16]);
  assert.strictEqual(wt.window.opacity, 0.9);
  assert.strictEqual(wt.window.blur, true);
  assert.strictEqual(wt.window.cursorShape, 'bar');
});

test('Windows Terminal: no scheme and no font means the stock look (Campbell, Cascadia Mono)', () => {
  const dir = captured({ 'windows-terminal/settings.json': '{ "profiles": { "defaults": {}, "list": [] } }' });
  const wt = readCurrent(dir).terminals['windows-terminal'];
  assert.strictEqual(wt.scheme, 'Campbell');
  assert.strictEqual(wt.stock.palette, true);
  assert.strictEqual(wt.palette.background, '#0C0C0C');
  assert.strictEqual(wt.font.family, 'Cascadia Mono');
  assert.deepStrictEqual(wt.window.padding, [8, 8, 8, 8]);
});

test('Windows Terminal: startupActions with split-pane count as panes', () => {
  const dir = captured({ 'windows-terminal/settings.json': '{ "startupActions": "new-tab -p Bash ; split-pane -V btop ; split-pane -H", "profiles": { "list": [] } }' });
  assert.strictEqual(readCurrent(dir).terminals['windows-terminal'].layout.panes, 3);
});

test('kitty: colors, font, padding and background opacity from kitty.conf', () => {
  const dir = captured({
    'kitty/kitty.conf': [
      'font_family      Iosevka Term', 'font_size 12.5', 'modify_font cell_height 120%', 'window_padding_width 10 20',
      'background_opacity 0.85', 'background #1d2021', 'foreground #ebdbb2', 'color1 #cc241d', 'color9 #fb4934', 'cursor_shape beam',
    ].join('\n'),
  });
  const k = readCurrent(dir).terminals.kitty;
  assert.strictEqual(k.palette.background, '#1D2021');
  assert.strictEqual(k.palette.ansi.red, '#CC241D');
  assert.strictEqual(k.palette.ansi.brightRed, '#FB4934');
  assert.deepStrictEqual(k.font, { family: 'Iosevka Term', size: 12.5, lineHeight: 1.2 });
  assert.deepStrictEqual(k.window.padding, [10, 20, 10, 20]);
  assert.strictEqual(k.window.opacity, 0.85);
  assert.strictEqual(k.window.cursorShape, 'bar');
});

test('Alacritty: TOML colors, font and padding', () => {
  const dir = captured({
    'alacritty/alacritty.toml': [
      '[window]', 'padding = { x = 14, y = 8 }', 'opacity = 0.95', '[font]', 'size = 11.0', '[font.normal]', 'family = "Hack Nerd Font"',
      '[colors.primary]', 'background = "#2e3440"', 'foreground = "#d8dee9"', '[colors.normal]', 'red = "#bf616a"',
    ].join('\n'),
  });
  const a = readCurrent(dir).terminals.alacritty;
  assert.strictEqual(a.palette.background, '#2E3440');
  assert.strictEqual(a.font.family, 'Hack Nerd Font');
  assert.strictEqual(a.font.size, 11);
  assert.deepStrictEqual(a.window.padding, [8, 14, 8, 14]);
});

test('WezTerm: lua settings read best-effort (scheme name, font, size, padding, opacity, splits)', () => {
  const dir = captured({
    'wezterm/wezterm.lua': `local wezterm = require 'wezterm'
local config = wezterm.config_builder()
config.color_scheme = 'Tokyo Night'
config.font = wezterm.font('Fira Code')
config.font_size = 13.0
config.window_background_opacity = 0.9
config.window_padding = { left = 20, right = 20, top = 10, bottom = 10 }
wezterm.on('gui-startup', function(cmd)
  local tab, pane, window = wezterm.mux.spawn_window(cmd or {})
  pane:split { direction = 'Right' }
end)
return config`,
  });
  const w = readCurrent(dir).terminals.wezterm;
  assert.strictEqual(w.scheme, 'Tokyo Night');
  assert.strictEqual(w.palette, null);
  assert.deepStrictEqual(w.font, { family: 'Fira Code', size: 13, lineHeight: null });
  assert.deepStrictEqual(w.window.padding, [10, 20, 10, 20]);
  assert.strictEqual(w.window.opacity, 0.9);
  assert.strictEqual(w.layout.panes, 2);
});

test('shell rc files: prompt engine, fetch and multiplexer at startup', () => {
  const dir = captured({
    'bash/.bashrc': 'alias ll="ls -l"\neval "$(starship init bash)"\nfastfetch\n',
    'powershell/Microsoft.PowerShell_profile.ps1': 'oh-my-posh init pwsh --config ~/x.omp.json | Invoke-Expression\n',
    'zsh/.zshrc': '[ -z "$TMUX" ] && exec tmux new -A -s main\n',
  });
  const c = readCurrent(dir);
  assert.deepStrictEqual(c.prompt, { bash: 'starship', powershell: 'oh-my-posh', zsh: 'default' });
  assert.deepStrictEqual(c.startup.fetch, ['fastfetch']);
  assert.strictEqual(c.startup.multiplexer, 'tmux');
});

test('a hand-written PS1 is a hand-rolled prompt, not the default', () => {
  const dir = captured({ 'bash/.bashrc': "PS1='\\[\\e[35m\\]\\w\\[\\e[0m\\] > '\n" });
  assert.strictEqual(readCurrent(dir).prompt.bash, 'hand-rolled');
});
