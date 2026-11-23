# Render: configs from the look

Write each file into the run folder (e.g. `<run>/out/wezterm.lua`), then stage it. The
run folder is printed by `tmt new` and `tmt status`.

## Choosing the write kind

| File | Kind | Why |
|---|---|---|
| A file only the look owns (theme file, `starship.toml`, `wezterm.lua` when none exists, fastfetch config, art) | `write` | whole file |
| User's rc file: `.bashrc`, `.zshrc`, `config.fish`, `$PROFILE`, `.gitconfig` | `block` | only the marked block changes; one line that sources the look's own file is best |
| JSON config with user content: Windows Terminal `settings.json` | `merge-json` | keys merge; profiles match by guid/name, schemes by name, actions by id, keybindings by keys |
| Existing whole-file config the user tuned (`kitty.conf`, `alacritty.toml`) | `write` a new include file + `block`/`write` an include line | keep theirs, layer ours (`include` in kitty, `import` in alacritty, `config-file` in ghostty) |

Pattern that keeps undo clean: put the look in its own files under
`~/.config/<look-name>/` and add one include/source line to each user file.

## Per-tool recipes

`${CLAUDE_PLUGIN_ROOT}/catalog/<category>/<id>/recipes/*.md` give the exact syntax for
colors, font, background, opacity, padding, prompt, keybindings, and the tool's validate
command, with the date it was verified. Follow them over memory: config keys change
between versions (check the detected version against the recipe's `verified` note).

## Shell startup budget

- Initialize prompt tools with their native init (`starship init`, `oh-my-posh init`), and
  cache the init script when the tool supports it.
- No plugin managers for 1-2 plugins; source the plugin file directly.
- Lazy-load slow things (nvm, conda, completions) on first use.
- `tmt measure --before` gives the baseline; aim to stay within the budget or not slower
  than before + 100 ms.

## Cross-shell consistency

When the user has several shells, generate the same prompt and colors for each (starship
config shared; LS_COLORS/EZA_COLORS from the palette; `$PSStyle`/PSReadLine colors for
PowerShell; fish `set -U fish_color_*`). Map palette roles, not raw hexes, so all shells
agree.

## Validation

Every staged config should have a check: tools' own (`wezterm --config-file x ls-fonts`,
`kitty +runpy`, `starship config`? → see recipes), syntax (`bash -n`, `zsh -n`,
`fish --no-execute`, PowerShell parser: automatic), JSON parse (automatic).
`tmt stage check -- <cmd>` adds one.
