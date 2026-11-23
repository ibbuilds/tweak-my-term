---
capability: shell-integration
tool: windows-terminal
os: windows
verified: 2026-11-23 (docs, windows-terminal 1.25.3131.0)
sources: https://learn.microsoft.com/windows/terminal/tutorials/shell-integration
---
# Shell integration in Windows Terminal
The shell writes OSC 133 marks (prompt, command, output, exit code) and OSC 9;9 (current directory, a Windows path). Windows Terminal turns them into scrollbar marks, prompt-to-prompt navigation, command and output selection, and new tabs that open in the same directory. Marks are stable since 1.21.

## Config
Terminal side, in `profiles.defaults` and `actions`/`keybindings`:
```jsonc
"showMarksOnScrollbar": true,
"autoMarkPrompts": true,
```
```jsonc
{ "command": { "action": "scrollToMark", "direction": "previous" }, "id": "User.mark.prev" },
{ "command": { "action": "scrollToMark", "direction": "next" }, "id": "User.mark.next" },
{ "command": { "action": "selectOutput", "direction": "prev" }, "id": "User.select.output" },
{ "command": { "action": "selectCommand", "direction": "prev" }, "id": "User.select.command" }
```
`cmd.exe` (exact line from the docs; persist with `setx PROMPT ...`):
```bat
PROMPT $e]133;D$e\$e]133;A$e\$e]9;9;$P$e\$P$G$e]133;B$e\
```
PowerShell and Bash need a prompt function; use the scripts in the official tutorial (it provides `pwsh`, Oh My Posh, Bash 4.4+, Fish).

## Notes
- The escape sequences, per the docs: `OSC 133;A` prompt start, `133;B` command start, `133;C` output start, `133;D;<exit>` command finished, `OSC 9;9;<CWD>` working directory. `OSC` is ESC `]`, `ST` is ESC `\` or BEL.
- In WSL or Git Bash the CWD must be translated to a Windows path (`wslpath -w`, `cygpath -w`).
- `autoMarkPrompts` adds a mark on Enter even without shell integration, and the docs call it needed for cmd and pwsh integration.
- Before 1.21 the keys were `experimental.autoMarkPrompts` and `experimental.showMarksOnScrollbar` (Preview only).
- Existing prompts (Starship, Oh My Posh, custom) must keep the marks in the right order; wrap the original prompt between 133;A and 133;B as the tutorial shows.
