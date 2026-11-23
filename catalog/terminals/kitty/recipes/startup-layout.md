---
capability: startup-layout
tool: kitty
os: macos, linux
verified: 2026-11-23 (docs, kitty 0.51)
sources: https://sw.kovidgoyal.net/kitty/sessions/, https://sw.kovidgoyal.net/kitty/conf/
---
# Startup layout (sessions) in kitty
A session file lists OS windows, tabs, layouts and the programs to run. Load it with `startup_session` or `kitty --session`.
## Config
`kitty.conf`:
```
startup_session {xdg-config}/kitty/default.session
```
`default.session`:
```
new_os_window
os_window_size 120c 36c
new_tab main
layout splits
cd ~
launch --title "edit"
launch --location=vsplit
launch --location=hsplit --bias=40
focus
```
## Notes
- Keywords: `new_os_window`, `new_tab [title]`, `layout <name>`, `cd <path>`, `launch [options] [cmd]`, `os_window_size`, `focus`. `launch` cannot create tabs or OS windows inside a session.
- Run once from a shell: `kitty --session path/to/file.session`.
- `startup_session` default is `none`. Relative `cd` paths resolve against the session file directory.
- Build look `layout.arrangement` (pane tree, see render.md) as `launch --location=vsplit|hsplit` lines; `layout.panes` is only a description.
