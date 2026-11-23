---
capability: prompt
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, GNU bash 5.3.9 / Git for Windows 2.54)
sources: https://www.gnu.org/software/bash/manual/html_node/Controlling-the-Prompt, https://www.gnu.org/software/bash/manual/html_node/Interactive-Shell-Behavior, https://starship.rs/guide/
---
# Custom or third-party prompt in bash
The prompt is `$PS1` (expanded each time it is shown); `PROMPT_COMMAND` runs before every prompt and is the hook for dynamic prompts. Third-party prompts install themselves by setting both.

## Config
Own prompt (colors wrapped in `\[ \]` so readline counts width correctly):
```bash
__prompt() {
  local rc=$?                                   # capture first
  local red='\[\e[38;2;224;32;30m\]' dim='\[\e[38;2;110;98;100m\]' rst='\[\e[0m\]'
  PS1="${dim}\w${rst}"
  ((rc)) && PS1+=" ${red}✘ $rc${rst}"
  PS1+=$'\n❯ '
}
PROMPT_COMMAND=__prompt                         # bash >= 5.1: PROMPT_COMMAND+=(__prompt) also works
```
Third party (cache the init output, see startup-speed):
```bash
eval "$(starship init bash)"                               # starship.rs
eval "$(oh-my-posh init bash --config ~/.config/omp.json)" # ohmyposh.dev
```

## Notes
- Always wrap non-printing escapes in `\[ ... \]`; unwrapped escapes break line wrapping and history navigation.
- `PROMPT_COMMAND` is an array since bash 5.1 (`PROMPT_COMMAND+=(fn)`); macOS /bin/bash 3.2 only accepts a string: `PROMPT_COMMAND="fn;$PROMPT_COMMAND"`.
- No native right prompt or transient prompt. A transient prompt needs ble.sh (24-60 ms per keystroke on Windows, measured) or a `bind -x` hack; the Eclipse preset skips it for speed.
- Cost: every `$(git ...)` in the prompt is a fork (10-60 ms on Windows). Run `git status` once per prompt, or read `.git/HEAD` with shell builtins.
- `PS0` (bash 4.4+) is printed after Enter, before the command runs; `PS2` is the continuation prompt; `PS4` is the xtrace prefix.
- Glyph width (Nerd Font icons, emoji) depends on the terminal; keep wide icons outside `\[ \]` so they count as printed.
