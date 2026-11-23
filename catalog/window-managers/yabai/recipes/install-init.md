---
capability: install-init
tool: yabai
os: macos
verified: 2026-11-23 (docs, yabai 7.1.25)
sources: https://github.com/asmvik/yabai/wiki/Installing-yabai-(latest-release), https://github.com/asmvik/yabai/wiki/Configuration, https://github.com/asmvik/skhd
---
# Install and first config for yabai
```sh
brew install asmvik/formulae/yabai asmvik/formulae/skhd
mkdir -p ~/.config/yabai ~/.config/skhd
touch ~/.config/yabai/yabairc ~/.config/skhd/skhdrc
chmod +x ~/.config/yabai/yabairc
yabai --start-service        # prompts for Accessibility: tick yabai in System Settings
skhd --start-service         # same for skhd; restart it once after allowing
yabai --version
```

## Minimal `~/.config/yabai/yabairc`
```sh
#!/usr/bin/env sh
yabai -m config layout bsp
yabai -m config window_placement second_child
```

## Notes
- yabairc is run by `sh` at start. Without the exec bit it is interpreted, with it executed; set the bit and keep a shebang.
- Config lookup order: `$XDG_CONFIG_HOME/yabai/yabairc`, `~/.config/yabai/yabairc`, `~/.yabairc`.
- Do not load the scripting addition (`yabai --load-sa`, the sudoers line, `csrutil`). It needs SIP partially disabled and is not required for tiling; see the tool notes for which features it gates.
- skhd also needs Secure Keyboard Entry off in the terminal (a terminal setting) to see key events.
- Run only one tiling window manager (not together with AeroSpace).
