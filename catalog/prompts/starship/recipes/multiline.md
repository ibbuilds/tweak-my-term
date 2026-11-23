---
capability: multiline
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/config/, https://starship.rs/advanced-config/
---
# Two-line prompt and continuation prompt
Put `$line_break` in `format` for a second input line, control the blank line between prompts with `add_newline`, and set the prompt shown for wrapped input with `continuation_prompt`.

## Config
```toml
# ~/.config/starship.toml
add_newline = true                      # blank line between prompts (default true)
format = """
$directory$git_branch$git_status$fill$cmd_duration
$character"""
continuation_prompt = "[∙](bright-black) "     # default value; shown after a backslash-continued line

[fill]
symbol = " "
```
A boxed look using plain format characters:
```toml
format = '''
┌───────────────────> $directory$git_branch
└─> '''
```
Continuation prompt is supported in bash, zsh and PowerShell (docs list).

## Notes
- Use `$line_break` or a literal newline inside a TOML multi-line string; a trailing `\` inside `"""..."""` joins lines.
- `[line_break] disabled = true` removes the module-provided breaks (useful for a one-line prompt).
- `$fill` is a Starship module for padding between left and right content on one line; it stretches to the terminal width.
- Always keep `$character` last so the cursor sits after the symbol and vi-mode symbols (`vimcmd_symbol`) still work.
