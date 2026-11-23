---
capability: window-rules
tool: niri
os: linux
verified: 2026-11-23 (docs, niri 26.04)
sources: https://github.com/niri-wm/niri/wiki/Configuration:-Window-Rules, https://github.com/niri-wm/niri/wiki/Configuration:-Miscellaneous
---
# Window rules in niri
`window-rule { match ...; <properties> }`. `match` takes `app-id="<regex>"`, `title="<regex>"` and flags like `is-floating=true`, `at-startup=true`. Several `match` lines in one rule are alternatives (any); properties on one `match` line must all hold. Later rules override earlier ones. Find an app-id with `niri msg pick-window` or `niri msg windows`.

## Config
Terminal app-ids: `kitty`, `foot`, `Alacritty`, `org.wezfurlong.wezterm`, `com.mitchellh.ghostty`.
```kdl
window-rule {
    match app-id=r#"^(kitty|foot|Alacritty|org\.wezfurlong\.wezterm|com\.mitchellh\.ghostty)$"#
    opacity 0.92
    default-column-width { proportion 0.5; }
    // open-on-workspace "term"       // needs a named workspace, see below
}
// floating scratch terminal, started with e.g. `foot --app-id scratch`
window-rule {
    match app-id="^scratch$"
    open-floating true
    default-column-width { proportion 0.6; }
    default-window-height { proportion 0.5; }
}
workspace "term"
```

## Notes
- `open-on-workspace` only works with a named workspace declared at the top level (`workspace "term"`); otherwise the window opens on the focused workspace.
- Opening properties (`default-column-width`, `open-floating`, `open-on-workspace`, `open-maximized`) apply once when the window opens; `opacity`, `geometry-corner-radius`, `border` and `focus-ring` apply continuously.
- `opacity` multiplies the whole window including text; do not combine it with the terminal's own background opacity.
- Rounded corners are a window rule too: see the borders recipe.
