---
capability: shell-integration
tool: wezterm
os: windows, macos, linux
verified: 2026-11-23 (docs, wezterm 20240203-110809-5046fc22)
sources: https://wezterm.org/shell-integration.html
---
# Shell integration in WezTerm
WezTerm understands OSC 7 (current directory), OSC 133 (prompt, input and output zones) and OSC 1337 (user vars). The shell has to emit them. With OSC 7, new tabs and panes open in the current directory; with OSC 133 you can jump between prompts and select command output.

## Config
Bash or Zsh: source WezTerm's integration script from the shell rc file (script lives in the WezTerm repo under `assets/shell-integration/`; Fedora, Debian and Arch packages enable it automatically for Bash and Zsh):
```bash
# ~/.bashrc  (path to wezterm.sh: copy it from the repo, see the shell-integration docs)
[ -f ~/.config/wezterm/wezterm.sh ] && . ~/.config/wezterm/wezterm.sh
```
PowerShell, OSC 7 only (from the official docs):
```powershell
function prompt {
    $p = $executionContext.SessionState.Path.CurrentLocation
    $osc7 = ""
    if ($p.Provider.Name -eq "FileSystem") {
        $ansi_escape = [char]27
        $provider_path = $p.ProviderPath -Replace "\\", "/"
        $osc7 = "$ansi_escape]7;file://${env:COMPUTERNAME}/${provider_path}${ansi_escape}\"
    }
    "${osc7}PS $p$('>' * ($nestedPromptLevel + 1)) ";
}
```
cmd.exe, OSC 7 through the prompt variable (in `wezterm.lua`):
```lua
config.set_environment_variables = {
  prompt = '$E]7;file://localhost/$P$E\\$E[32m$T$E[0m $E[35m$P$E[36m$_$G$E[0m ',
}
```

## Notes
- Jump between prompts with the `ScrollToPrompt` key assignment (needs OSC 133); bind it in `config.keys`.
- Starship users on PowerShell: emit OSC 7 from `Invoke-Starship-PreCommand` (documented pattern) because Starship owns the prompt.
- Inside tmux, set `allow-passthrough on` for OSC 1337 user vars.
- WSL: use a `WslDomain` (see the profiles recipe) so WezTerm tracks the directory inside WSL.
- Verify by opening a new tab from a shell that has changed directory: it should start in that directory.
