---
capability: window-rules
tool: glazewm
os: windows
verified: 2026-11-23 (docs, glazewm v3.10.1)
sources: https://github.com/glzr-io/glazewm#config-window-rules, https://github.com/glzr-io/glazewm#faq, https://github.com/glzr-io/glazewm/blob/main/packages/wm-common/src/parsed_config.rs
---
# Window rules in GlazeWM
A rule runs `commands` when a window matches. `match` is a list; entries are OR'ed, and the fields inside one entry (`window_process`, `window_class`, `window_title`) are AND'ed. Matchers: `equals`, `regex`, `not_equals`, `not_regex`. `window_process` is the exe name without `.exe`.

## Config
```yaml
window_rules:
  # Float one terminal at a fixed size
  - commands: ['set-floating --centered --width 1000px --height 650px']
    match:
      - window_process: { regex: '(?i)^alacritty$' }
        window_title: { equals: 'scratch' }

  # Send terminals to workspace 2
  - commands: ['move --workspace 2']
    match:
      - window_process: { equals: 'WindowsTerminal' }
      - window_process: { equals: 'wezterm-gui' }

  # Never tile a window
  - commands: ['ignore']
    match:
      - window_process: { equals: 'zebar' }
```

## Notes
- Likely process names: Windows Terminal `WindowsTerminal`, WezTerm `wezterm-gui`, Alacritty `alacritty`. They are not listed in the GlazeWM docs; confirm with `glazewm query windows`, Winlister or AutoHotkey Window Spy.
- Rules fire on `manage` and `title_change` by default (`on:` overrides) and `run_once` is true by default, so each window triggers a rule once.
- New windows start in `window_behavior.initial_state` (`'tiling'` by default). Use `set-floating` rules for exceptions, or set `'floating'` and tile with `set-tiling` rules.
- `--width` and `--height` take lengths such as `800px` or `50%`.
