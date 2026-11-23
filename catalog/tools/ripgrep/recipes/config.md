---
capability: config
tool: ripgrep
os: windows, macos, linux
verified: 2026-11-23 (docs GUIDE.md; rg 15.2.0)
sources: https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md#configuration-file
---
# ripgrep configuration file

ripgrep has no default config location. Create a file with one flag per line and point `RIPGREP_CONFIG_PATH` at it. Lines starting with `#` are comments.

## Config
```
# ~/.ripgreprc
# Search hidden files except VCS dirs
--hidden
--glob=!.git/*
--glob=!node_modules/*

# Smart case and prettier defaults
--smart-case
--max-columns=200
--max-columns-preview
--colors=line:style:bold
```
```sh
export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"
```
```powershell
[Environment]::SetEnvironmentVariable('RIPGREP_CONFIG_PATH', "$HOME\.ripgreprc", 'User')
```
Rules (GUIDE): flag and value either on one line joined by `=` (`--max-columns=150`) or on two lines; `--max-columns 150` on one line does not work. Command-line flags override the file.
Colors: see `theme.md`. Per-project rules: `.rgignore` and `.ignore` files.

## Notes
- Debug: `rg --debug pattern 2>&1 | head` shows which config file was read; `rg --no-config` skips it.
- `--glob=!.git/*` with `--hidden` keeps `.git` out of results; same idea as fd's global ignore.
- The config applies to every `rg` call from that environment, including scripts; keep it to defaults.
