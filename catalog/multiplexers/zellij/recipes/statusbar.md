---
capability: statusbar
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs, zellij 0.46.0)
sources: https://zellij.dev/documentation/creating-a-layout.html, https://raw.githubusercontent.com/zellij-org/zellij/main/zellij-utils/assets/config/default.kdl
---
# Tab bar and status bar
Zellij's bars are plugin panes defined in the layout. The tab bar, status bar and compact bar are one built-in plugin, `zellij:bars`, with a `role`; the aliases `tab-bar`, `status-bar` and `compact-bar` are predefined.

## Config
Layout with both bars (this is the default layout shape):
```kdl
// ~/.config/zellij/layouts/default.kdl
layout {
    pane size=1 borderless=true {
        plugin location="tab-bar"
    }
    pane
    pane size=2 borderless=true {
        plugin location="status-bar"
    }
}
```
Single compact bar, or none:
```kdl
layout {
    pane
    pane size=1 borderless=true {
        plugin location="compact-bar"
    }
}
```
Apply it by name: `default_layout "compact"` in `config.kdl` (bundled `compact`) or `zellij --layout /path/file.kdl`. Hide/show bars at runtime with the `ToggleBars` action (`Shift z` in pane mode); start hidden with `bars_hidden_on_start true`. Other options: `simplified_ui true` (no arrow-font glyphs; needs no Nerd/Powerline font), `session_indicator false`, `pane_frames false`.

## Notes
- Bar colours come from the theme (`ribbon_selected`, `ribbon_unselected`, `text_unselected`); see the palette recipe.
- There is no per-segment format string like tmux's `status-right`; to show custom data use a plugin (the plugins recipe), e.g. a community status-bar plugin loaded in the bar pane's `plugin location="file:..."`.
- The tab bar also shows an indicator for other sessions (`session_indicator`).
- `size=1` for tab bar/compact bar, `size=2` for the two-line status bar (keybinding hints).
