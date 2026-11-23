---
capability: performance
tool: starship
os: windows, macos, linux
verified: 2026-11-23 (docs, starship 1.27.0)
sources: https://starship.rs/config/, https://starship.rs/advanced-config/
---
# Keep Starship fast
Starship renders by running one process per prompt and probing the filesystem and external tools for each active module. Find slow modules with `starship timings`, then disable them, narrow their detection, or raise their timeouts.

## Config
```sh
starship timings          # modules taking >=1 ms or producing output, with times
starship explain          # what each visible module is and why it shows
starship module git_status   # render one module
```
```toml
# ~/.config/starship.toml
scan_timeout    = 30      # ms to scan files in the current dir (default 30)
command_timeout = 500     # ms for external commands (default 500)

# render only the modules you want instead of $all
format = "$directory$git_branch$git_status$character"

[git_status]
disabled = true           # in huge repos or on WSL /mnt/c

[custom.slow]
command = "slow-tool"
detect_files = ["Cargo.toml"]
ignore_timeout = false    # default: honour command_timeout
```
`STARSHIP_LOG=error` hides the "command timed out" warnings (secondary source).

## Notes
- Cost model: one `starship init` process at shell start, one `starship prompt` per prompt; on Windows each process costs 10-60 ms (machine-measured), on Linux/macOS a few ms. To avoid the init process you can save `starship init <shell> --print-full-init` to a file and source it (flag mentioned in upstream discussions; not benchmarked here).
- `git_status` is the usual culprit on large repos and on WSL Windows drives; the docs offer `windows_starship = '/mnt/c/.../starship.exe'` under `[git_status]` for the WSL case.
- Language modules (nodejs, python, rust...) shell out to read a version; each costs a process on Windows. `disabled = true` the ones you do not need, or use `starship preset no-runtimes`.
- A command that exceeds `command_timeout` is dropped from that prompt and a warning is printed; raise it per need rather than globally.
- Transient/right prompts add no process unless you define custom functions that call `starship module`.
