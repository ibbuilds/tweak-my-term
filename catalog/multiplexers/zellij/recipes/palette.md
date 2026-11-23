---
capability: palette
tool: zellij
os: windows, macos, linux
verified: 2026-11-23 (docs and bundled dracula.kdl, zellij 0.46.0)
sources: https://zellij.dev/documentation/themes.html, https://raw.githubusercontent.com/zellij-org/zellij/main/zellij-utils/assets/themes/dracula.kdl, https://raw.githubusercontent.com/zellij-org/zellij/main/zellij-utils/assets/config/default.kdl
---
# Themes
A theme is a KDL `themes { <name> { ... } }` block, in `config.kdl` or one file per theme in `<config dir>/themes/`. Select it with `theme "<name>"`, or pair `theme_dark`/`theme_light` for automatic switching. Colours are decimal `R G B` triples (0-255), not hex.

## Config
Component-based format (current; bundled themes use it). Map from the look spec:

```kdl
// ~/.config/zellij/config.kdl  (or themes/tmt.kdl)
themes {
    tmt {
        // text on the base background; emphasis_N: orange, cyan, green, magenta in the bundled dracula
        text_unselected {
            base {palette.foreground.rgb}
            background {palette.background.rgb}
            emphasis_0 {palette.ansi.yellow.rgb}
            emphasis_1 {palette.ansi.cyan.rgb}
            emphasis_2 {palette.ansi.green.rgb}
            emphasis_3 {palette.ansi.magenta.rgb}
        }
        text_selected     { base {palette.foreground.rgb}  background {palette.selectionBackground.rgb}  emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        ribbon_selected   { base {palette.background.rgb}  background {palette.accent.rgb}  emphasis_0 {palette.ansi.red.rgb} emphasis_1 {palette.ansi.yellow.rgb} emphasis_2 {palette.ansi.magenta.rgb} emphasis_3 {palette.ansi.blue.rgb} }
        ribbon_unselected { base {palette.background.rgb}  background {palette.ansi.white.rgb}  emphasis_0 {palette.ansi.red.rgb} emphasis_1 {palette.ansi.brightBlack.rgb} emphasis_2 {palette.ansi.blue.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        ribbon_hover      { base {palette.background.rgb}  background {palette.ansi.brightWhite.rgb}  emphasis_0 {palette.ansi.red.rgb} emphasis_1 {palette.ansi.brightBlack.rgb} emphasis_2 {palette.ansi.blue.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        table_title       { base {palette.accent.rgb}      background {palette.background.rgb}  emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        table_cell_selected   { base {palette.foreground.rgb} background {palette.selectionBackground.rgb} emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        table_cell_unselected { base {palette.foreground.rgb} background {palette.background.rgb} emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        list_selected   { base {palette.foreground.rgb} background {palette.selectionBackground.rgb} emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        list_unselected { base {palette.foreground.rgb} background {palette.background.rgb} emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.green.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        frame_selected  { base {palette.accent.rgb}  background 0  emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.cyan.rgb} emphasis_2 {palette.ansi.magenta.rgb} emphasis_3 {palette.ansi.magenta.rgb} }
        frame_highlight { base {palette.ansi.yellow.rgb} background 0 emphasis_0 {palette.ansi.magenta.rgb} emphasis_1 {palette.ansi.yellow.rgb} emphasis_2 {palette.ansi.yellow.rgb} emphasis_3 {palette.ansi.yellow.rgb} }
        exit_code_success { base {palette.ansi.green.rgb} background 0 emphasis_0 {palette.ansi.cyan.rgb} emphasis_1 0 0 0 emphasis_2 {palette.ansi.magenta.rgb} emphasis_3 {palette.ansi.brightBlack.rgb} }
        exit_code_error   { base {palette.ansi.red.rgb}   background 0 emphasis_0 {palette.ansi.yellow.rgb} emphasis_1 {palette.ansi.yellow.rgb} emphasis_2 {palette.ansi.magenta.rgb} emphasis_3 {palette.ansi.cyan.rgb} }
        multiplayer_user_colors {
            player_1 {palette.ansi.magenta.rgb}
            player_2 {palette.ansi.brightBlack.rgb}
            player_3 {palette.ansi.green.rgb}
            player_4 {palette.ansi.yellow.rgb}
            player_5 {palette.ansi.cyan.rgb}
            player_6 {palette.ansi.brightYellow.rgb}
            player_7 {palette.ansi.red.rgb}
            player_8 {palette.ansi.brightMagenta.rgb}
            player_9 {palette.ansi.brightGreen.rgb}
            player_10 {palette.ansi.brightRed.rgb}
        }
        terminal_colors {          // used by the Zellij terminal window (`zellij terminal`)
            black {palette.ansi.black.rgb}   red {palette.ansi.red.rgb}   green {palette.ansi.green.rgb}   yellow {palette.ansi.yellow.rgb}
            blue {palette.ansi.blue.rgb}     magenta {palette.ansi.magenta.rgb}   cyan {palette.ansi.cyan.rgb}   white {palette.ansi.white.rgb}
            bright_black {palette.ansi.brightBlack.rgb}   bright_red {palette.ansi.brightRed.rgb}   bright_green {palette.ansi.brightGreen.rgb}   bright_yellow {palette.ansi.brightYellow.rgb}
            bright_blue {palette.ansi.brightBlue.rgb}     bright_magenta {palette.ansi.brightMagenta.rgb}   bright_cyan {palette.ansi.brightCyan.rgb}   bright_white {palette.ansi.brightWhite.rgb}
        }
    }
}
theme "tmt"
// automatic dark/light:  theme_dark "tmt"   theme_light "tmt-light"   (set both)
```
`{palette.X.rgb}` stands for the token's hex converted to three decimals (e.g. `#1e1e2e` becomes `30 30 46`). Legacy short form (shown commented in the default config): `fg bg red green yellow blue magenta orange cyan black white` each as `R G B`.

## Notes
- Component names and their `base`/`background`/`emphasis_0..3` attributes are from the bundled dracula theme; `background 0` is as the bundled themes write it for transparent-looking frames.
- Edit a theme in `config.kdl` for live reload; files in `<config dir>/themes` are also picked up live. `zellij options --theme NAME` tries one for a session. The community plugin `theme-tester` shows every component.
- Bundled themes (see https://zellij.dev/documentation/theme-list.html) can be used as-is; `classic` is the pre-0.44 default.
- Set `explicit_theme_hue "dark"` if the host terminal misreports its colour scheme.
- Frame style: `pane_frames true|false`, `pane_frame_style "titles"|"full"|"none"`, `ui { pane_frames { rounded_corners true border_style "single" } }` (default.kdl).
