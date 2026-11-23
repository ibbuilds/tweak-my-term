---
capability: layouts
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Layout, https://github.com/niri-wm/niri/wiki/Tabs, https://raw.githubusercontent.com/niri-wm/niri/main/resources/default-config.kdl
---
# Layouts in niri
Windows are arranged in columns on an infinite strip to the right. A new window opens in a new column next to the focused one; windows stacked in one column share its width. Set the starting width in `layout`.

## Config
```kdl
layout {
    default-column-width { proportion 0.5; }      // two columns fill the screen
    preset-column-widths { proportion 0.33333; proportion 0.5; proportion 0.66667; }
    center-focused-column "never"
    // default-column-display "tabbed"             // new columns start as tabs
}
binds {
    Mod+BracketLeft  { consume-or-expel-window-left; }
    Mod+BracketRight { consume-or-expel-window-right; }
    Mod+Comma  { consume-window-into-column; }
    Mod+Period { expel-window-from-column; }
    Mod+R { switch-preset-column-width; }
    Mod+W { toggle-column-tabbed-display; }
}
```

## Terminal left, two stacked right
1. Open terminal 1, then terminal 2 (new column on the right) and terminal 3 (a third column, focused).
2. Run `consume-or-expel-window-left` on terminal 3 (`Mod+BracketLeft`, or `niri msg action consume-or-expel-window-left`): it drops under terminal 2. Both columns are 50% wide.

## Notes
- `consume-window-into-column` pulls the window on the right into the focused column; `expel-window-from-column` pushes the bottom window out to a new column.
- Tabbed columns (niri 25.02+) show a tab indicator on the side and switch with `focus-window-up/down`.
- `empty-workspace-above-first`, `always-center-single-column` and `center-focused-column "on-overflow"` change how the strip scrolls.
- Workspaces are vertical (`focus-workspace-up/down`), independent of columns.
