---
capability: modules
tool: fastfetch
os: windows, macos, linux
verified: 2026-11-23 (Configuration and Format-String wiki pages; module list from `fastfetch --list-modules` 2.71.0; a custom config run on Windows 11)
sources: https://github.com/fastfetch-cli/fastfetch/wiki/Configuration, https://github.com/fastfetch-cli/fastfetch/wiki/Format-String-Guide
---
# Choose and format modules

`modules` is an ordered array. An entry is a module name string (defaults) or an object with `type` and options (`key`, `format`, `keyColor`, ...). Modules not listed are not run, which is the main startup lever.

## Config
```jsonc
{
  "$schema": "https://github.com/fastfetch-cli/fastfetch/raw/dev/doc/json_schema.json",
  "display": { "key": { "width": 8 }, "separator": "  " },
  "modules": [
    { "type": "title", "format": "{#bold_white}{user-name}{#}@{host-name}" },
    "break",
    { "type": "os",      "key": "os",   "format": "{name} {version}" },
    { "type": "uptime",  "key": "up",   "format": "{formatted}" },
    { "type": "cpu",     "key": "cpu",  "format": "{name} ({cores-logical} threads)" },
    { "type": "memory",  "key": "mem",  "format": "{used} / {total} ({percentage})" },
    { "type": "disk",    "key": "disk", "folders": "/" },
    { "type": "shell",   "key": "sh",   "format": "{pretty-name} {version}" },
    { "type": "terminal","key": "term", "format": "{pretty-name}" },
    "break",
    { "type": "custom", "format": "{#light_black}ctrl+r history   ctrl+t files   z jump" }
  ]
}
```
Available module types (2.71.0): Battery BIOS Bluetooth BluetoothRadio Board Bootmgr Break Brightness Btrfs Camera Chassis Codec Command Colors CPU CPUCache CPUUsage Cursor Custom DateTime DE Display Disk DiskIO DNS Editor Font Gamepad GPU Host Icons InitSystem Kernel Keyboard LM Loadavg Locale LocalIp Logo Media Memory Monitor Mouse NetIO OpenCL OpenGL OS Packages PhysicalDisk PhysicalMemory Player PowerAdapter Processes PublicIp Separator Shell Sound Swap Terminal TerminalFont TerminalSize TerminalTheme Title Top Theme TPM Uptime Users Version Vulkan Wallpaper Weather WM Wifi WMTheme Zpool (`fastfetch --list-modules`).
Discover the format variables per module: `fastfetch -h cpu-format`. Inspect real values: `fastfetch -s cpu:memory --format json`.
Format string tools: `{name:10}` truncate, `{name<20}` pad right, `{name>20}` pad left, `{name|20}` center (2.64.0+), `{$ENV_VAR}` environment variable, `{#color}` color, `{#}` reset, `{-}` stop output.
Hide a key: `"key": " "` (one space) prints only the value.
Add a one-line hint row: the `Custom` module with a `format` string. `Colors` draws a palette strip (`"symbol": "block"`), handy to show the active ANSI palette.

## Notes
- Show only what is real and cheap: avoid `PublicIp`, `Weather`, `Wifi`, `LocalIp`, `Packages` (slow on some systems) and `Command` (runs a shell command) in a shell-start banner. Measure with `time fastfetch -c <file>` / the PowerShell `Measure-Command`.
- Module lists differ by OS: `Packages`, `WM`, `DE` matter on Linux; on Windows `OS`, `Host`, `CPU`, `GPU`, `Memory`, `Disk`, `Shell`, `Terminal` are the useful ones.
- Disk module takes `folders` (Windows `C:\`, Unix `/`); the Eclipse config uses `"folders": "C:\\"`.
- `hideType: "integrated"` on GPU hides integrated GPUs (used in a working config).
- A key with `"type"` unknown or a misspelled option is an error (`--show-errors`).
- Percent display: `percent.type` bitmask (num, bar, colored); see `theme.md`.
