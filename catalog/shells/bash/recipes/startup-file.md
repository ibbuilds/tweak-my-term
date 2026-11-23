---
capability: startup-file
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, GNU bash 5.3.9 / Git for Windows 2.54; Linux/macOS rules from the Bash manual)
sources: https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files
---
# Where interactive bash config goes
Interactive non-login shells read `~/.bashrc`; login shells read the first of `~/.bash_profile`, `~/.bash_login`, `~/.profile`. Put everything in `~/.bashrc` and make `~/.bash_profile` source it.

## Config
`~/.bash_profile`:
```bash
# login shells (macOS Terminal, ssh, Git Bash --login) load the interactive config too
[ -f "$HOME/.bashrc" ] && . "$HOME/.bashrc"
```
`~/.bashrc`:
```bash
# environment first: runs for every shell that reads .bashrc
[ -f ~/.config/bash/env.bash ] && . ~/.config/bash/env.bash
[[ $- == *i* ]] || return        # everything below is interactive-only
for _m in prompt history completion aliases; do
  [ -f ~/.config/bash/$_m.bash ] && . ~/.config/bash/$_m.bash
done
unset _m
```

## Notes
- Which file runs: interactive login = `/etc/profile` then one of `.bash_profile/.bash_login/.profile`; interactive non-login = `.bashrc`; non-interactive = only the file named by `$BASH_ENV`. Test with `shopt -q login_shell && echo login`.
- Git Bash (Windows): Windows Terminal and VS Code profiles usually run `bash.exe --login -i`, so `.bash_profile` runs. Starting `C:\Program Files\Git\usr\bin\bash.exe -i` directly is a non-login shell: `/etc/profile` is skipped (first content ~0.35 s instead of ~0.9 s via `git-bash.exe`, measured), and MSYSTEM/PATH must be rebuilt in `.bashrc` (e.g. `export MSYSTEM=MINGW64; . /etc/msystem; export PATH=...`).
- macOS: bash 3.2 at `/bin/bash`; Terminal.app is always a login shell, so without the `.bash_profile` -> `.bashrc` bridge your `.bashrc` is never read. macOS default shell is zsh; to change it add the brew bash to `/etc/shells`, then `chsh -s <path>`.
- Debug: `bash --norc` (skip rc), `bash --noprofile`, `bash --rcfile file`. Syntax check without running: `bash -n file`.
