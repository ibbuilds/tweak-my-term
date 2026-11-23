---
capability: line-editing
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 "Interactive use")
sources: https://fishshell.com/docs/current/interactive.html, https://fishshell.com/docs/current/cmds/fish_vi_key_bindings.html
---
# Line editing in fish
Everything is built in: autosuggestions (from history and completions, shown in grey), syntax highlighting, a searchable pager for completions and history, abbreviations, emacs and vi key bindings. No plugins needed.

## Config
```fish
# ~/.config/fish/config.fish
if status is-interactive
    # vi mode (default is emacs): set -g fish_key_bindings fish_vi_key_bindings
    set -g fish_key_bindings fish_default_key_bindings

    # autosuggestion color; syntax colors are fish_color_* (see colors recipe)
    set -g fish_color_autosuggestion 6e6264

    # abbreviations expand when you press space/enter, and the expanded text is stored in history
    abbr -a gco 'git checkout'
    abbr -a -- .. 'cd ..'
end
```

## Notes
- Accept the suggestion: Right arrow or Ctrl-F accepts all; Alt-Right/Alt-F accepts one word (see `bind` output for exact keys in your version).
- Ctrl-R opens history search in a pager (repeat Ctrl-R for the next page); Up/Down search history for the text already typed.
- Switch modes at runtime with `fish_vi_key_bindings` / `fish_default_key_bindings`; `fish_vi_cursor` sets the cursor shape per mode.
- Abbreviations (`abbr`) beat aliases for interactive use: you see the real command before running it (docs).
- Disable suggestions: `set -g fish_autosuggestion_enabled 0`.
- Edit the command line in `$EDITOR`: Alt-E or Alt-V.
- Syntax highlighting is not a plugin and costs no startup time; colors are variables, see colors recipe.
