---
capability: env
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, Git for Windows 2.54 / bash 5.3.9; docs for Linux/macOS)
sources: https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files, https://www.msys2.org/docs/filesystem-paths/
---
# Environment variables and PATH in bash
Export variables in `~/.bashrc` (or a file it sources) so they exist in every interactive shell, including non-login terminals. Keep PATH edits idempotent.

## Config
```bash
export EDITOR=nvim PAGER=less LESS='-R -F'
export LANG=${LANG:-en_US.UTF-8}

pathadd() {                      # prepend once; ignores missing dirs
  [ -d "$1" ] || return
  case ":$PATH:" in *":$1:"*) ;; *) PATH="$1:$PATH" ;; esac
}
pathadd "$HOME/.local/bin"
pathadd "$HOME/bin"
export PATH
```

## Notes
- Git Bash (Windows): `$PATH` is POSIX-style (`/c/Users/x/bin:/usr/bin:...`) converted from the Windows PATH at start; paths with spaces need quoting. Use forward slashes or `/c/...` forms.
- MSYS path conversion rewrites argument strings that look like POSIX paths when calling Windows programs; disable per command with `MSYS_NO_PATHCONV=1 cmd /c ...` or `MSYS2_ARG_CONV_EXCL='*'`.
- Persist for all Windows programs (not just bash): `setx NAME value` (new processes only). Variables set in `.bashrc` live only in bash and its children.
- Rebuilding the MSYS env without `/etc/profile` (fast start): export `MSYSTEM`, source `/etc/msystem`, build `PATH` from `$MINGW_PREFIX/bin:/usr/bin:$ORIGINAL_PATH`; avoid `cygpath` forks, use `${TMP//\//}` style substitutions.
- macOS: GUI apps do not read `.bashrc`; use `launchctl setenv` or a LaunchAgent for GUI-visible variables. `/etc/profile` runs `path_helper` for login shells.
- Non-interactive scripts do not read `.bashrc`; only `$BASH_ENV` is sourced. Put variables other tools need in `~/.profile`/`~/.bash_profile` (login) or in the tool's own config.
- Secrets: keep them in a separate untracked file (`[ -f ~/.config/bash/secrets.bash ] && . ...`), never in a committed dotfiles repo.
