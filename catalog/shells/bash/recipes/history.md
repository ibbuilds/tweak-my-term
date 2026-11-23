---
capability: history
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, bash 5.3.9 / Git for Windows 2.54)
sources: https://www.gnu.org/software/bash/manual/html_node/Bash-History-Facilities, https://www.gnu.org/software/bash/manual/html_node/Bash-Variables
---
# Bash history: size, sharing, dedupe, secrets
History lives in `$HISTFILE` (default `~/.bash_history`) and is written when a shell exits. Set sizes, append mode and filters in `.bashrc`.

## Config
```bash
HISTFILE=~/.bash_history
HISTSIZE=100000                   # in memory
HISTFILESIZE=200000               # on disk
HISTTIMEFORMAT='%F %T  '          # timestamps in `history`
HISTCONTROL=ignoreboth:erasedups  # ignorespace + ignoredups + drop older duplicates
HISTIGNORE='ls:ll:cd:pwd:clear:exit:*--token*:*TOKEN=*:*PASSWORD=*:*SECRET=*:*API_KEY=*'
shopt -s histappend cmdhist lithist histverify   # append, keep multi-line cmds, confirm !! expansion
# share between open panes: write after every command
PROMPT_COMMAND="history -a${PROMPT_COMMAND:+;$PROMPT_COMMAND}"
```

## Notes
- `histappend` is essential: without it the last shell to exit overwrites the file.
- A leading space is not recorded with `ignorespace`/`ignoreboth`; use it for one-off secrets.
- `history -a` appends new lines, `history -n` reads lines other shells wrote, `history -c` clears memory. Reading others' history into every prompt (`history -a; history -n`) is slow on big files; append-only is the cheap default.
- `HISTIGNORE` patterns match the whole line with `*` globbing; `&` means the previous line.
- If `PROMPT_COMMAND` is already an array (bash 5.1+), use `PROMPT_COMMAND+=('history -a')` instead of the string form above.
- Windows (Git Bash): the file is `%USERPROFILE%\.bash_history`. Startup cost grows with `HISTFILESIZE` because the file is parsed at start; measure before going far past ~200k lines.
