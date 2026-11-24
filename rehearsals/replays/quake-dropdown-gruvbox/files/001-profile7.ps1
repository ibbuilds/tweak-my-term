# gruvbox-quake: zoxide, fzf, bat (all already installed)
if (Get-Command zoxide -ErrorAction SilentlyContinue) { Invoke-Expression (& { (zoxide init powershell | Out-String) }) }
if (Get-Command bat -ErrorAction SilentlyContinue) { $env:BAT_THEME = 'gruvbox-dark'; Set-Alias cat bat -Option AllScope }
if (Get-Command fzf -ErrorAction SilentlyContinue) {
  $env:FZF_DEFAULT_OPTS = '--color=bg+:#3c3836,bg:#1d2021,fg:#d4be98,fg+:#ddc7a1,hl:#d8a657,hl+:#d8a657,pointer:#ea6962,prompt:#a9b665,info:#928374,border:#928374 --height=40% --layout=reverse'
  Set-PSReadLineKeyHandler -Chord Ctrl+f -ScriptBlock { $f = (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object FullName | fzf --preview 'bat --color=always {}'); if ($f) { [Microsoft.PowerShell.PSConsoleReadLine]::Insert("`"$f`"") } }
}
Set-Alias ll Get-ChildItem
