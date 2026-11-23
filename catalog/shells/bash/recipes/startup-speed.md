---
capability: startup-speed
tool: bash
os: windows, macos, linux
verified: 2026-11-23 (machine, Git for Windows 2.54 / bash 5.3.9, Windows 11; medians of 5 runs)
sources: https://www.gnu.org/software/bash/manual/html_node/Bash-Startup-Files, https://gitforwindows.org/
---
# Make bash start fast
Startup cost is dominated by process spawns (forks, `$(...)`, external tools), especially on Windows where each costs 10-60 ms. Measure first, then remove or cache the expensive lines.

## Config
Measure:
```bash
time bash -i -c exit                      # total (Linux/macOS/Git Bash)
bash --norc --noprofile -i -c exit        # baseline without your config
# per-line trace with timestamps (bash 5.0+):
PS4='+ $EPOCHREALTIME ' bash -xi -c exit 2> /tmp/bash-trace.log
```
Windows PowerShell timing wrapper: `Measure-Command { & 'C:\Program Files\Git\usr\bin\bash.exe' -i -c exit }`.

Cache a tool's init script instead of running `eval "$(tool init bash)"` every start:
```bash
_cache_init() {   # _cache_init <name> <command...>
  local n=$1 f=$HOME/.cache/shell/$1.bash b; shift
  b=$(type -P "$1") || return
  if [[ ! -s $f || $b -nt $f ]]; then mkdir -p "${f%/*}"; "$@" > "$f"; fi
  . "$f"
}
_cache_init starship starship init bash
```
Windows Terminal: start the shell directly to skip Git's launcher, e.g. profile command line `"C:\Program Files\Git\usr\bin\bash.exe" -i` (no `--login`), and rebuild PATH/MSYSTEM in `.bashrc`.

## Notes
- Measured (Windows 11, Git for Windows 2.54, median of 5): `usr\bin\bash.exe --norc -i -c exit` 20 ms; `bin\bash.exe --norc --noprofile` 35 ms; `bin\bash.exe -l -i` with stock `/etc/profile` 258 ms; `usr\bin\bash.exe -i` with a modular rc 158 ms. First visible content via `git-bash.exe` ~0.9 s vs ~0.35 s starting `usr\bin\bash.exe -i` directly.
- Typical culprits: nvm (100-500 ms; use fnm/lazy-load), conda/pyenv/rbenv `init` (50-300 ms), `eval "$(...)"` of any tool, sourcing all of `bash-completion` or git completion (~30 ms), `$(git ...)`/`$(date)` in rc, `cygpath`/`which` calls.
- Use builtins: `${var//\//}` instead of `$(echo | sed)`, `[[ -d ]]` instead of `test`/`ls`, `printf -v` instead of `$(printf)`.
- Lazy-load heavy tools: define a stub function (`nvm() { unset -f nvm; . ~/.nvm/nvm.sh; nvm "$@"; }`).
- Windows: ble.sh costs 24-60 ms per keystroke and ~0.9 s per new tab (measured); do not use it there.
- Target: under ~150 ms on Windows, under ~30 ms on Linux/macOS.
