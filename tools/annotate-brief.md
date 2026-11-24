# Annotator brief (v3)

You annotate r/unixporn screenshots for tweak-my-term. Each screenshot is a whole desktop:
wallpaper, bars, docks, browsers, widgets, and somewhere in it zero or more **terminal
windows**. You record facts about the terminals only, so an agent can later find "a busy
dashboard with btop and a clock" or "one calm window over a picture" without looking at
thousands of images.

## Input

A batch folder with `manifest.json` (id, file, title, wm, colorscheme, tools) and the
screenshots it names. The tools list is the poster's claim; trust the picture.

## Output

Write `annotations.json` in the batch folder: a JSON array, one object per manifest entry,
in manifest order, following `schemas/rice-annotation.schema.json` exactly (no other keys).
Add `"checked": "<today YYYY-MM-DD>"` and `"by": "<your model name>"`.

## How to read a screenshot

Open every image with the Read tool and look carefully before writing.

**What is a terminal window.** A rectangle of monospace text on a flat or translucent
background: shell prompts, command output, fetch blocks (logo + key/value info), TUI apps
(btop/htop, cava bars, tty-clock digits, pipes, cmatrix, vim/neovim with line numbers,
ranger/yazi/lf columns, ncmpcpp, lazygit, calcurse). NOT terminals: status bars/panels
(polybar, waybar, top-of-screen strips with workspaces and clock), docks, app launchers
(rofi/wofi menus), notifications, conky widgets drawn on the wallpaper, browsers, GUI
editors (VS Code), image viewers, music players with album-art GUIs, eww widgets. If you
can't tell whether a monospace panel is a terminal or a desktop widget, it is a terminal
only if it has a window frame/border or a prompt.

**box**: the terminal window's outer edge (including its padding and border), as fractions
of the full image: `[x, y, width, height]`, three decimals. Estimate from where the edges
sit relative to the image size (e.g. left edge about a third across = 0.333). Be accurate to
about 2% of the image; tight is better than loose. One box per terminal **window**; a window
split into panes (tmux, zellij, terminal splits) is one box with `panes` > 1.

**shows**: what runs inside, most prominent first (`shell` for a plain prompt/output,
`fetch`, `monitor` for btop/htop/bottom, `editor`, `file-manager`, `clock`, `visualizer` for
cava, `music` for ncmpcpp/cmus/spotify-tui, `pipes`, `matrix`, `art` for ASCII/ANSI art,
bonsai, images in the terminal, `git` for lazygit/tig, `chat`, `mail`, `calendar`,
`weather`, `logs`, `notes`, `browser` for a text browser, else `other`).

**surface**: `opaque` (solid background), `translucent` (wallpaper visible through it),
`image` (a picture drawn inside the terminal itself, e.g. kitty icat or a background image).

**focus**: `terminal` if terminals are most of what the shot is showing off; `mixed` if
they share it with GUI apps/widgets; `other` if no terminal, or only tiny/covered ones.

**layout** (the terminals only): `single` one window; `panes` one window split; `tiling`
several windows edge to edge with gaps; `floating` several overlapping or freely placed
windows; `dashboard` four or more windows/panes each doing one job (monitor, clock, fetch,
visualizer...); `scrolling` a horizontal strip (niri/PaperWM); `none` no terminal visible.

**complexity** (terminals only): 1 one terminal with a shell; 2 one terminal with a fetch
or art, or two areas; 3 three or four areas, or one full TUI app; 4 four to six areas with
several TUI apps; 5 six or more areas, a wall.

**tone**: the terminals' background: `dark`, `light` or `mixed`. **accent**: the single
color that recurs in prompt/borders/highlights, as `#RRGGBB` uppercase, only if clear.
**prompt**: `not-visible`, `minimal` (one short line, one glyph), `two-line`, `powerline`
(colored segment chips), `boxed` (prompt drawn in a box/frame), `other`.

**mood**: up to 3 from the schema list that a person would use to describe the terminals.

**note**: one line, max 200 chars, on what makes the terminal part work or fail
(composition, palette discipline, padding, readability), in plain words.

## Rules

- Collages (several screenshots stacked or tiled in one image): annotate every terminal in
  every part; boxes stay fractions of the whole image. Judge layout and complexity by the
  busiest part, not the sum of all parts.
- Borderless dark tiles with terminal content (a prompt, cava bars, a fetch block) are
  terminals. GUI Emacs and GUI editors are not, and neither is VS Code's integrated terminal.
- `panes` counts tmux/zellij/terminal splits only, not splits inside vim.
- Collage focus: `mixed` when any part is mostly a GUI app; dark and light variants of
  one rice: `tone: mixed`. No terminal at all: `mood: []` is fine.
- Tiny terminals (overview thumbnails, under about 5% of the image width): still box them,
  but set `focus` to `other` unless a bigger terminal is also visible.

- One entry per manifest id, even when there is no terminal (`focus: other`, `layout:
  none`, `terminals: []`, `complexity: 1`, `prompt: not-visible`).
- Don't guess from the title or tools; when the picture contradicts the tags, the picture
  wins.
- Never copy text from the screenshot that identifies a person (usernames, hostnames,
  paths with names, emails) into `note`.
- When done, validate your batch: `node tools/annotate.js validate <batch folder>` (writes
  nothing). Fix every reported problem and run it again until it prints `ok`. Don't run
  `merge`; the coordinator merges all batches.
