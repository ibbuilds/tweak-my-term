---
capability: install-init
tool: aerospace
os: macos
verified: 2026-11-23 (docs, aerospace 0.21.3-Beta)
sources: https://nikitabobko.github.io/AeroSpace/guide, https://github.com/nikitabobko/homebrew-tap/blob/main/Casks/aerospace.rb
---
# Install and first config for AeroSpace
```sh
brew install --cask nikitabobko/tap/aerospace      # installs AeroSpace.app and the aerospace CLI
open -a AeroSpace                                  # first launch: allow Accessibility when asked
cp /Applications/AeroSpace.app/Contents/Resources/default-config.toml ~/.aerospace.toml
aerospace --version
```

## Notes
- Config is looked up at `~/.aerospace.toml`, then `$XDG_CONFIG_HOME/aerospace/aerospace.toml` (`~/.config` if unset). No file means built-in defaults.
- The default config has `config-version = 2`. Keep it: the `on-window-detected` examples in the window-rules recipe assume it.
- The default config ships alt-based bindings, gaps at 0 and `persistent-workspaces` for 1-9 and A-Z. Trim what the look does not need.
- The cask needs macOS 13+ and strips the quarantine attribute because the app is not notarized.
- No SIP changes needed. Run only one tiling window manager (not together with yabai).
