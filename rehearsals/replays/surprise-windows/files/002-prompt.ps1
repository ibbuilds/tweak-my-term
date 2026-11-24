# neon-void prompt (PowerShell 5.1 and 7). No process spawn per prompt.
[Console]::OutputEncoding = [Text.Encoding]::UTF8
function global:prompt {
  $ok = $?
  $E = [char]27
  $dir = $PWD.Path.Replace($HOME, '~')
  $b = ''
  $d = $PWD.Path
  while ($d) {
    $h = Join-Path $d '.git\HEAD'
    if (Test-Path -LiteralPath $h) { $b = (Get-Content -LiteralPath $h -TotalCount 1) -replace '^ref: refs/heads/', ''; break }
    $d = Split-Path $d -Parent
  }
  $s = "`n$E[38;2;34;214;230m$dir$E[0m"
  if ($b) { $s += " $E[38;2;255;43;214m$b$E[0m" }
  if (-not $ok) { $s += " $E[38;2;255;92;122m✘$E[0m" }
  $s + "`n$E[38;2;255;43;214m❯$E[0m "
}
