---
capability: quake
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/kittens/quick-access-terminal/
---
# Quick access terminal (quake) in kitty
`kitten quick-access-terminal` (kitty 0.42.0+) shows a drop-down window; run it again to hide it. Configure it in `quick-access-terminal.conf`.
## Config
`{xdg-config}/kitty/quick-access-terminal.conf`:
```
edge top
lines 25
columns 80
background_opacity {window.opacity}
hide_on_focus_loss no
start_as_hidden no
```
## Notes
- Linux: bind `kitten quick-access-terminal` to a key in the window manager or desktop settings. Uses the Wayland layer shell; the page also says X11 works.
- macOS: run it once, then assign a shortcut under System Settings > Keyboard > Keyboard Shortcuts > Services > General ("Quick access to kitty").
- Other keys: `edge` (`top`, `background`, `center`, `center-sized`, `none`), `layer` (default `overlay`; use `top` for IME on Linux), `focus_policy exclusive` (Wayland only), `app_id`, `output_name`, `margin_*`, `kitty_conf` / `kitty_override` (for example `kitty_override font_size=20`).
- `kitten quick-access-terminal --if-running=new-tab htop` runs a program in the running instance.
- `grab_keyboard` does not work on macOS.
