if (Get-Command starship.exe -CommandType Application -ErrorAction Ignore) { Invoke-Expression (&starship init powershell) }
