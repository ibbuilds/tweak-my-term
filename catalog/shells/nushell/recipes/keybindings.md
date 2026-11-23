---
capability: keybindings
tool: nushell
os: windows, macos, linux
verified: 2026-11-23 (docs; 0.117 release notes for the replace-vs-append behavior; event field names from the Nushell book keybinding chapter)
sources: https://www.nushell.sh/blog/2026-11-09-nushell_v0_117_0.html, https://www.nushell.sh/book/line_editor.html, https://www.nushell.sh/commands
---
# Key bindings in nushell
Custom bindings are records in the `$env.config.keybindings` list. Since 0.117, assigning the list replaces ALL defaults (including Tab completion and the Ctrl-R history menu), so always append with `++=`.

## Config
```nu
# restore a clean default list, then append (stays stable if config.nu is sourced twice)
$env.config.keybindings = (config default).keybindings
$env.config.keybindings ++= [
  {
    name: clear_screen_ctrl_t
    modifier: control
    keycode: char_t
    mode: emacs
    event: { send: clearscreen }
  }
  {
    name: ctrl_g_status
    modifier: control
    keycode: char_g
    mode: [emacs vi_insert]
    event: { send: executehostcommand, cmd: "git status -sb" }
  }
]
```
Discover:
```nu
keybindings listen        # press a key to see its keycode/modifiers
keybindings list          # valid modifiers, keycodes, modes, events
keybindings default       # the default bindings
```

## Notes
- Fields: `name`, `modifier` (`none`, `control`, `alt`, `shift`, combinations such as `control_shift`), `keycode` (`char_x`, `backspace`, `enter`, `up`, `f2`...), `mode` (`emacs`, `vi_normal`, `vi_insert`, or a list), `event` (`{ send: ... }`, `{ edit: ... }`, `{ until: [ ... ] }`, or a list of events).
- `until` tries events in order until one works: e.g. open menu else complete.
- Bindings that need an old config rewritten: before 0.117 `$env.config.keybindings = [...]` merged; now it replaces. `$env.config = {...}` with `keybindings`/`menus` inside replaces them too.
- Invalid entries are rejected at assignment in 0.117 (the old list stays, and in `config.nu` the rest of the script stops), so test after editing: `nu -c "print ok"` or open a new session.
- `executehostcommand` types and runs a Nushell command line, so it appears in history like any command.
- Reedline's own movement/editing keys are not in the list and stay.
- Terminal support limits chords (Ctrl-Backspace, Ctrl-Enter often indistinguishable); confirm with `keybindings listen`.
