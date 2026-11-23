---
capability: prompt
tool: powershell
os: windows, macos, linux
verified: 2026-11-23 (machine for the prompt function, Enter handler and escape-char forms on 5.1; docs for PowerShell 7 `e and starship/oh-my-posh)
sources: https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_prompts, https://learn.microsoft.com/en-us/powershell/module/psreadline/set-psreadlinekeyhandler, https://starship.rs/guide/
---
# Custom or third-party prompt in PowerShell
The prompt is the output of a function named `prompt`, called before each input line. Define it in `$PROFILE`; return a string (ANSI escapes allowed).

## Config
```powershell
$E = [char]27                                     # works in 5.1 and 7; "`e" only in 7+
function global:prompt {
  $ok = $?; $code = $global:LASTEXITCODE          # capture before anything else runs
  $dir = $PWD.Path.Replace($HOME, '~')
  $bad = if (-not $ok) { " $E[31m✘$E[0m" } else { '' }
  "$E[90m$dir$E[0m$bad`n$E[32m❯$E[0m "
}
```
Third party:
```powershell
Invoke-Expression (& starship init powershell --print-full-init | Out-String)   # starship.rs
oh-my-posh init pwsh --config "$HOME\.config\omp.json" | Invoke-Expression        # ohmyposh.dev (works in 5.1 too)
```
Transient prompt (collapse the old two-line prompt to `❯ cmd` on Enter), PSReadLine >= 2.0:
```powershell
Set-PSReadLineOption -ExtraPromptLineCount 1
Set-PSReadLineKeyHandler -Key Enter -ScriptBlock {
  $line = $null; $cur = $null; $errs = $null
  [Microsoft.PowerShell.PSConsoleReadLine]::GetBufferState([ref]$line, [ref]$cur)
  $null = [System.Management.Automation.Language.Parser]::ParseInput($line, [ref]$null, [ref]$errs)
  if (-not ($errs | Where-Object IncompleteInput)) {   # only when the command is complete
    $global:Transient = $true                          # your prompt returns a short form when set
    [Microsoft.PowerShell.PSConsoleReadLine]::InvokePrompt()
  }
  [Microsoft.PowerShell.PSConsoleReadLine]::AcceptLine()
}
```
(Your `prompt` must clear `$global:Transient` after rendering the short form.)

## Notes
- Escape character: `[char]27` everywhere; the `` `e `` escape exists only in PowerShell 6+ (Windows PowerShell 5.1 does not parse it).
- Windows PowerShell 5.1 has no `$PSStyle`; PowerShell 7.2+ does (`$PSStyle.Foreground.Red`).
- `$?` and `$LASTEXITCODE` change with every command inside `prompt`; read them first. `$LASTEXITCODE` is only set by native programs.
- Cost: `prompt` runs after every command. Avoid spawning `git` unless inside a repo (look for a `.git` dir by walking parents with `Test-Path`, then call git once). A process spawn is ~10-60 ms on Windows.
- Window/tab title: `$Host.UI.RawUI.WindowTitle = ...` inside `prompt`.
- Set `[Console]::OutputEncoding = [Text.Encoding]::UTF8` so glyphs print right in 5.1.
- Multi-line prompts: set `-ExtraPromptLineCount` to the number of extra lines (the preset uses 1).
