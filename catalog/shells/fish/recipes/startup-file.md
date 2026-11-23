---
capability: startup-file
tool: fish
os: macos, linux
verified: 2026-11-23 (docs, fish 4.9.3 "The fish language: Configuration files")
sources: https://fishshell.com/docs/current/language.html, https://fishshell.com/docs/current/faq.html, https://fishshell.com/docs/current/tutorial.html
---
# Where interactive fish config goes
`~/.config/fish/config.fish` (or `$XDG_CONFIG_HOME/fish/config.fish`) is the one file, read by every fish (interactive or not, login or not). Snippets in `conf.d/*.fish` run before it. Guard interactive-only code with `status is-interactive`.

## Config
`~/.config/fish/config.fish`:
```fish
if status is-interactive
    set -g fish_greeting                 # empty greeting
    abbr -a gs 'git status -sb'          # abbreviation expands as you type
    alias ll 'ls -lah'                   # alias = autoloaded wrapper function
    # third-party init goes here, e.g.: starship init fish | source
end
```
Organized layout:
```
~/.config/fish/config.fish        # run last
~/.config/fish/conf.d/10-env.fish # snippets: read in name order, before config.fish
~/.config/fish/functions/foo.fish # autoloaded on first call of `foo` (one function per file)
~/.config/fish/completions/foo.fish
```

## Notes
- Order: `conf.d` snippets (user dir, then system, then vendor dirs) -> `config.fish`. Same-named files in the user dir shadow system ones.
- Unlike bash there is no `.bashrc`/`.profile` split; use `status is-login` / `status is-interactive` inside the files.
- Prefer `functions/` autoloading over defining many functions in `config.fish`: files load only when used, which keeps startup fast (tutorial and docs both recommend it).
- `set -U` creates universal variables stored by fish itself (`~/.config/fish/fish_variables`); do not hand-edit that file.
- Prompt functions also live in `functions/` (`fish_prompt.fish`).
- See what you changed from defaults: `fish_delta`. Syntax-check a file without running it: `fish --no-execute file.fish`.
- Windows: no native build; WSL or MSYS2 only.
