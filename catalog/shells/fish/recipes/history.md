---
capability: history
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 `history`, `fish_should_add_to_history` and Interactive use pages)
sources: https://fishshell.com/docs/current/cmds/history.html, https://fishshell.com/docs/current/cmds/fish_should_add_to_history.html, https://fishshell.com/docs/current/interactive.html
---
# History in fish
History is on by default, stored in `~/.local/share/fish/fish_history` (`$XDG_DATA_HOME/fish/fish_history`), duplicates are removed automatically, and a command starting with a space is not stored. Little needs configuring.

## Config
```fish
history                           # list (pager)
history search --contains docker
history delete --contains 'secret'   # delete matching items (interactive confirmation)
history merge                     # read other sessions' new entries now
history clear                     # wipe, asks to confirm
```
Session name / disable storage:
```fish
set -x fish_history work          # writes to $XDG_DATA_HOME/fish/work_history from now on
set -x fish_history ''            # empty: history is not stored at all
# or private mode (hides old history and writes nothing): fish --private    # or set fish_private_mode 1
```
Keep matching commands out of history (fish 4.0+; the function takes over ALL filtering, including the leading-space rule):
```fish
# ~/.config/fish/functions/fish_should_add_to_history.fish
function fish_should_add_to_history
    string match -qr '^\s' -- $argv[1]; and return 1                       # keep the leading-space rule
    string match -qr '(TOKEN|PASSWORD|SECRET|API_KEY)=' -- $argv[1]; and return 1
    return 0                                                               # 0 = store
end
```

## Notes
- Up/Down search by the text already typed; Alt-Up/Down search for the word under the cursor; Ctrl-R opens the history pager; autosuggestions come from history.
- Searches are case-insensitive unless the search string contains an uppercase character.
- History is added before the command runs, so `$status` cannot be checked in `fish_should_add_to_history` (docs).
- `fish_history` is a session name, not a path (unlike `HISTFILE`); setting it to anything other than `fish`/`default` also stops fish from importing bash history.
- `history save` forces a write to disk; `history append` adds commands without executing them.
- Docs list no `HISTSIZE` equivalent; do not rely on a specific cap.
