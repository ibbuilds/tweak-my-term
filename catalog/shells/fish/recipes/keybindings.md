---
capability: keybindings
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 bind and interactive docs)
sources: https://fishshell.com/docs/current/cmds/bind.html, https://fishshell.com/docs/current/interactive.html, https://fishshell.com/docs/current/cmds/fish_key_reader.html
---
# Key bindings in fish
`bind KEYS COMMAND` binds a key to a fish command or a built-in input function. Put binds in `config.fish` or in a function named `fish_user_key_bindings`.

## Config
```fish
# ~/.config/fish/functions/fish_user_key_bindings.fish
function fish_user_key_bindings
    bind ctrl-right forward-word
    bind ctrl-left backward-word
    bind alt-e edit_command_buffer            # or: bind alt-e 'commandline -r ""'
    bind ctrl-g 'git status -sb; commandline -f repaint'
    bind ctrl-backspace backward-kill-word
    # vi mode: bind -M insert ctrl-c kill-whole-line repaint
end
```
Find out a key's name: run `fish_key_reader`, press the key, copy the `bind ...` line it prints. List: `bind` (user bindings), `bind --all`, `bind --function-names` (available input functions), `bind --key-names`.

## Notes
- Key names (fish >= 4.0 syntax): modifiers `ctrl-`, `alt-`, `shift-`, `super-`; names are case-sensitive; sequences are comma-separated: `ctrl-x,ctrl-e`. On older fish (3.x) use `\cX`, `\e` escape syntax.
- Switch style: `fish_vi_key_bindings` / `fish_default_key_bindings`, or `set -g fish_key_bindings fish_vi_key_bindings`.
- `--mode`/`-M` selects the bind mode (`default` = vi normal, `insert`); `-m` changes mode after the binding runs.
- If a binding runs a script that changes the command line, finish with `commandline -f repaint` (bind docs: end with the `repaint` input function).
- Erase a binding: `bind -e KEYS`. Preset vs user: `--preset` / `--user`.
- Terminals must send distinguishable sequences for chords like ctrl-backspace; `fish_key_reader` shows whether the terminal sends anything different.
