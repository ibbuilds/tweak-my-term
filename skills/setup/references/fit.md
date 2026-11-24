# Fit: the look onto this OS

`look.json` is tool-neutral. Fit decides which tool delivers each part here.

## Look up capabilities

```
tmt catalog list                       # tools known, by category and OS
tmt catalog cap <capability>           # which tools support it, on which OS, with recipe
tmt catalog show <tool-id>             # install ids, config paths, validate command, notes
tmt catalog paths                      # config files that exist on this machine (*)
```

Capability ids live in `${CLAUDE_PLUGIN_ROOT}/schemas/capabilities.json` (e.g.
`background-image`, `background-animated`, `shaders`, `ligatures`, `font-fallback`,
`opacity`, `blur`, `tabs`, `splits`, `ssh-domains`, `transient-prompt`,
`right-prompt`, `autosuggestions`, `syntax-highlighting`, ...). A recipe is the tested
way to do that thing with that tool; read it before writing config.

## Decision order

Only free tools: open source or free to use, with no paid license, subscription or account
wall for any use. If the only way to get something is paid, say so and give the closest free option.

1. What the user uses today (detect), if it can deliver the look.
2. Else the smallest change that can: add a prompt tool before switching shells; switch
   terminal only for things the current one can't do (e.g. animated background, shaders).
3. Cross-shell tools (starship, fzf, zoxide, eza, bat) so every shell gets the same look.

## Per OS defaults

| | Windows | macOS | Linux |
|---|---|---|---|
| Terminal | Windows Terminal (image bg, pixel shaders, acrylic) or WezTerm | Ghostty, WezTerm, kitty, iTerm2 | kitty, Ghostty, WezTerm, Alacritty, foot (Wayland), Konsole/GNOME Terminal |
| Shells | PowerShell 5.1/7, Git Bash, Nushell; zsh/fish only via WSL/MSYS2 | zsh (default), fish, bash | bash, zsh, fish |
| Prompt | oh-my-posh (PowerShell), starship (all) | starship, powerlevel10k, pure | starship, p10k, pure |
| Installs | winget, scoop (no admin) | brew | apt/dnf/pacman/zypper (sudo: the user runs it), flatpak --user, brew |
| Fonts | per-user `%LOCALAPPDATA%\Microsoft\Windows\Fonts` + registry | `~/Library/Fonts` | `~/.local/share/fonts` + fc-cache |

Windows notes: Windows PowerShell 5.1 ships PSReadLine 2.0 (no predictions);
install PSReadLine ≥ 2.2 from PSGallery for list predictions and colors. Profiles may be
UTF-16; tmt keeps encodings. `$PROFILE` lives under Documents (may be OneDrive-redirected;
the `{ps-profile}` token resolves it). WT settings: `{wt-settings}`.

## When it can't be done

Say it plainly, give the closest alternative, and record both in brief.md, e.g.
"Windows Terminal can't play a GIF background; I used one still frame plus a subtle
scanline shader. WezTerm could animate it; switching costs re-creating your WT profiles."

## Tools outside the catalog

Research the official docs (current version), write the config, and validate it with the
tool's own check command via `tmt stage check -- <cmd>`. Tell the user it's unverified.
Check its license first: free tools only (see Decision order).

## Leftovers from the previous look

A merge keeps every key the new look doesn't set. Before planning, read the captured config
for settings that would draw over or fight the new look: a pixel shader
(`experimental.pixelShaderPath` in Windows Terminal, `custom-shader` in Ghostty), a
background image or opacity on another level (profile vs defaults), an old color scheme on
the profile that opens. Remove each in the same plan: in a `merge-json` fragment set the key
to `null` and it is deleted. Then check `tmt shot` shows the new look, not the old one.
