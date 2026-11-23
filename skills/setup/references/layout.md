# Layout

Layout is how things are arranged: how many shells are visible, where, at what size, and
what starts in them. Style is how it all looks (palette, type, art, prompt). Users often
want one without the other ("my colors are fine, I want three panes"), so the brief
records them separately, inspiration is searched for each, and each is judged on its own.

## Find examples of the layout

`tmt inspire [style words] --layout <kind> --os <os>`; the kind comes from the user's words:

| User says | `--layout` | What it is |
|---|---|---|
| "tiled", "i3/hyprland look", "windows side by side" | `tiling` | several windows tiled by a window manager, gaps between them |
| "one terminal", "floating", "centered", "clean desktop" | `floating` | one or a few free windows, usually sized to content |
| "splits", "panes", "tmux", "editor + shell + logs" | `panes` | splits inside one terminal window |
| "dashboard", "monitor", "widgets", "HUD" | `dashboard` | many small panels: system monitor, music, clock, fetch |
| "scrolling", "niri", "paper" | `scrolling` | a strip of windows that scrolls sideways |

The kind is inferred from the window manager and tools, so confirm it on each screenshot.
For layout examples judge only the arrangement (pane count and proportions, gaps, what
sits where, empty space); ignore their colors. For style examples, ignore arrangement.

## Spec it, show it, get a yes

Write the arrangement into look.json as a pane tree, so the preview draws it and the
configs are built from it:

```json
"layout": { "multiplexer": "native", "gap": 0, "arrangement": { "split": "row", "sizes": [60, 40],
  "panes": [ { "run": "nvim", "focus": true },
             { "split": "column", "panes": [ { "run": "shell" }, { "run": "btop" } ] } ] } }
```

`tmt art preview` shows each pane with a mock of its program, the focused one in the
accent. The user approves the arrangement with the look. Keep `gap` at what will really
render: 0 for splits inside one terminal, the WM's gap when each pane is a window.

## Build it on the user's OS

Read `catalog/capabilities.json` for the user's terminal before choosing (`splits`, `tabs`,
`startup-layout`, `layouts`, `quake`, `padding`), then the linked recipe.

| Layout | Inside the terminal (preferred: no new tools) | Needs more |
|---|---|---|
| panes | native splits + startup layout: Windows Terminal (Windows), WezTerm (all OSes), kitty (macOS/Linux); Ghostty and iTerm2 split but have no layout file | zellij layout file (all OSes) or tmux (macOS/Linux, WSL) when the terminal has no splits (Alacritty, foot) or the user wants sessions that survive closing |
| dashboard | panes with one job each: monitor (btop), files (yazi), git (lazygit), fetch, clock | the same tools on every OS; widgets outside the terminal (eww, conky, Rainmeter, Übersicht) are desktop tools, out of scope unless asked |
| floating single window | window size in columns/rows, padding, hidden title bar/tabs, opacity (terminal recipes) | centering or a fixed position: an OS tool or WM rule |
| dropdown (quake) | Windows Terminal, kitty, Ghostty, iTerm2 (partial); see the `quake` recipes | a hotkey launcher or WM scratchpad |
| tiling / scrolling | approximate with splits inside one full-screen terminal | a tiling window manager (`catalog/window-managers/`): Windows GlazeWM (or komorebi: paid license for any commercial or work use), macOS AeroSpace or yabai, Linux Hyprland, sway, i3 or niri; KDE/GNOME have built-in or extension tiling (not cataloged) |

Rules:
- Prefer what the user's terminal does natively; a multiplexer adds keybindings to learn,
  a window manager changes how the whole desktop works. Offer those only when the layout
  needs them, say why, and install only with the user's yes.
- Window managers are in the catalog (`tmt catalog cap gaps`, `window-rules`,
  `autostart`): their configs are staged and applied like any other. Installing one is a
  bigger change than a theme: explain what it does to the whole desktop, get a clear yes,
  and if the user already runs one, style theirs instead of switching.
- A layout that works on Windows works on macOS and Linux too (they have more options),
  so describe it in terms of panes and sizes, then map it to the user's tools.
- Make it start that way: a startup layout or session file, not "split it by hand".
- Apply design.md: 2-4 panes, one job each, one gap value, one bg across panes, focus
  shown by border or dimming (inactive-pane dimming: WezTerm, kitty, tmux).
