---
capability: performance
tool: oh-my-posh
os: windows, macos, linux
verified: 2026-11-23 (docs and upstream issues, oh-my-posh 33.x)
sources: https://ohmyposh.dev/docs/configuration/general, https://ohmyposh.dev/docs/configuration/streaming, https://ohmyposh.dev/docs/faq, https://github.com/JanDeDobbeleer/oh-my-posh/issues/7539
---
# Keep Oh My Posh fast
Two costs: shell start (generated init script) and each prompt render (one process, then segments). Prompt render is usually 10-120 ms; start-up in PowerShell on Windows is the one that hurts.

## Config
Measure where time goes:
```sh
oh-my-posh debug            # per-segment ms, "Run duration", config + cache paths
oh-my-posh debug --plain
```
Theme-level switches:
```json
{
  "version": 4,
  "async": true,
  "streaming": 100
}
```
- `async: true` loads the prompt in the background and starts with the shell's default prompt (supported pwsh/powershell, zsh, bash, fish). Upstream recommends it for the slow cold start.
- `streaming: <ms>`: runs one `oh-my-posh serve` process per shell session so each prompt avoids a process start ("the largest cost on Windows"); pending segments show `placeholder` (default `...`) until ready. Supported in powershell, zsh, fish, cmd. Disable with env `POSH_DISABLE_STREAMING` if a host misbehaves.
- Use a local `--config` file; theme names and URLs download on shell start.
- Disable the update notice if start-up hangs on network: `oh-my-posh disable notice` (reported in issue #5309; also see the `upgrade` config key).

Cache the PowerShell init (profile pattern from a public benchmark; regenerates when config or exe is newer):
```powershell
$cfg = "$HOME/.config/oh-my-posh/config.omp.json"
$cache = Join-Path $env:TEMP 'omp-init.ps1'
if (-not (Test-Path $cache) -or (Get-Item $cfg).LastWriteTime -gt (Get-Item $cache).LastWriteTime) {
  oh-my-posh init pwsh --config $cfg --print | Out-File $cache -Encoding utf8
}
. $cache
```

## Notes
- Data points (not measured on this machine): PowerShell 7.6.1, v29.14.0: `init | iex` added ~1.9 s to a cold start while the prompt rendered in ~12 ms (issue #7539, closed with "use async"); a cached init script still costs ~250 ms of parsing in a separate benchmark post. `oh-my-posh --version` adds ~20 ms per process once Defender trusts the binary.
- On this machine every extra process at shell start costs 10-60 ms, and Windows Defender real-time scanning of the exe, theme and profile can multiply that; adding exclusions helps but weakens protection.
- Trim segments that call external tools (git on big repos, kubectl, battery); `oh-my-posh debug` shows each one. Run `git gc` for slow repo paths.
- Windows PowerShell 5.1 and 7 both pay the init-script parse cost; bash/zsh/fish pay mostly the process start.
- For minimal cost on Windows prefer Starship (one small init) or `async`/`streaming` here.
