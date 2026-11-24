# Parts: assemble the look from what already exists

A terminal look is a set of parts: colors, font, background, prompt, terminal settings,
layout, and the themed tools inside it (multiplexer, editor, monitor, file manager, fetch,
visualizer...). Almost every part already exists somewhere, made and tuned by someone
who cared. Your job is to find each part, fit it to the user's OS and terminal, and
connect the parts so they read as one look. Write something yourself only when nothing
existing fits, and say so.

## For each part, in this order

1. **What the user already has** (`current.json`, `audit.md` Keep lines): keep it unless
   the request changes it.
2. **The chosen rice's dotfiles** (the `repo` link of the inspiration pick): read the
   repo's files for that part (e.g. `.config/kitty/kitty.conf`, `starship.toml`,
   `tmux.conf`, `btop` theme, fastfetch config, wallpaper). `tmt parts rice <repo>` lists
   them per tool with the wallpapers and license; `--get <path...>` saves them into the run
   folder (or `git clone --depth 1` into the run folder), never into the user's config. Adapt, don't paste: their paths, fonts, OS and terminal differ from the user's.
   Check the repo license; with none, take ideas and values (colors, sizes, layout), not
   whole files. Credit the repo in `brief.md` and the look's `source` fields.
3. **Official ports of a named scheme**: when the palette is a known scheme (Catppuccin,
   Gruvbox, Tokyo Night, Rose Pine, Nord, Dracula, Everforest, Kanagawa...), its
   maintainers publish hand-tuned files per app (`github.com/catppuccin/<app>`,
   `github.com/dracula/<app>`, `folke/tokyonight.nvim` extras, `rose-pine/<app>`...). Use
   those for every tool they cover: `tmt parts port <scheme> <app> [--flavor f] --get`
   finds and saves them (other schemes fall back to the iTerm2-Color-Schemes export for
   that terminal). Palettes themselves: `catalog/palettes/sources.json`
   (1,000+ schemes, flat formats).
4. **Catalog recipes** (`tmt catalog cap <capability>`, `tmt catalog show <tool>`): the
   per-OS, per-terminal config with `{palette.*}` tokens. Fill the tokens from look.json.
5. **Your own** (written from the tool's current docs), marked unverified to the user.

## Backgrounds and art

1. The user's image or the one they pick from inspiration (downloaded into the run
   folder as their anchor, kept local, never published).
2. The rice's wallpaper, only when the user chose that rice and the repo allows it; same
   rule: local, for them.
3. A photo or artwork the user chooses from a free-license source (they pick it; you link
   it; record the source and license).
4. Generated: `tmt art scene` presets or a paint script (see [anchor.md](anchor.md)).
Then `tmt art treat ... --for-text` so text stays readable.

## Tools

Prefer tools already installed (`tmt detect`); otherwise the catalog's free tools for
each job (`tmt catalog cap <capability>`). One tool per job. A dashboard is existing TUIs
(btop, cava, tty-clock/peaclock, cmatrix/unimatrix, fastfetch, yazi, lazygit, ncmpcpp...)
started in panes by the terminal or multiplexer layout, each themed by step 2-4 above.

## Connect them

The parts must agree: one palette across terminal, prompt, multiplexer, editor and every
TUI (same background or deliberate tiles, same accent), one font with the glyphs the
prompt and tools use, padding and borders consistent between terminal and multiplexer,
and startup order that works (terminal → multiplexer layout → programs in panes).
List the parts and their sources in `brief.md` under **Parts** before rendering:

```
Parts:
- palette: Catppuccin Macchiato (iterm2-color-schemes) + accent mauve
- terminal: kitty, from <rice repo> kitty.conf (padding, tab bar), adapted to macOS
- prompt: starship, catppuccin/starship palette
- layout: kitty session (catalog kitty/startup-layout), panes from <rice>
- btop: catppuccin/btop theme; cava: own config from palette
- background: user's ~/Pictures/x.png, treated --for-text
```
