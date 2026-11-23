'use strict';
// Screenshot of the terminal, so the agent can compare the real result with the anchor
// and the preview. Windows: the foreground window (or one whose title matches).
// macOS: screencapture. Linux: grim, gnome-screenshot, spectacle or ImageMagick import.

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const sys = require('./sys');

const PS = (out, title, delay) => `
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Drawing
Add-Type @"
using System; using System.Runtime.InteropServices;
public class TmtWin {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("dwmapi.dll")] public static extern int DwmGetWindowAttribute(IntPtr h, int a, out RECT r, int s);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  public struct RECT { public int L, T, R, B; }
}
"@
[void][TmtWin]::SetProcessDPIAware()
Start-Sleep -Milliseconds ${Math.round(delay * 1000)}
$h = [TmtWin]::GetForegroundWindow()
$title = ${JSON.stringify(title || '')}
if ($title) {
  $p = Get-Process | Where-Object { $_.MainWindowHandle -ne 0 -and $_.MainWindowTitle -like "*$title*" } | Select-Object -First 1
  if (-not $p) { throw "no window title contains '$title'" }
  $h = $p.MainWindowHandle
}
$r = New-Object TmtWin+RECT
if ([TmtWin]::DwmGetWindowAttribute($h, 9, [ref]$r, 16) -ne 0) { [void][TmtWin]::GetWindowRect($h, [ref]$r) }
$w = $r.R - $r.L; $hh = $r.B - $r.T
if ($w -le 0 -or $hh -le 0) { throw 'window has no size' }
$bmp = New-Object System.Drawing.Bitmap $w, $hh
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($r.L, $r.T, 0, 0, $bmp.Size)
$bmp.Save(${JSON.stringify(out)}, [System.Drawing.Imaging.ImageFormat]::Png)
"$w x $hh"
`;

function shot({ dir, title = '', delay = 0.5, exec = sys.exec } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `shot-${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}.png`);
  const osName = paths.platform();
  let r;
  if (osName === 'windows') {
    r = exec('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', PS(out, title, delay)], { timeout: 30000 });
  } else if (osName === 'macos') {
    r = exec('screencapture', ['-x', '-T', String(Math.max(0, Math.round(delay))), out], { timeout: 30000 });
  } else {
    const tries = [['grim', [out]], ['gnome-screenshot', ['-f', out]], ['spectacle', ['-b', '-n', '-o', out]], ['import', ['-window', 'root', out]]];
    const found = tries.find(([c]) => sys.which(c));
    if (!found) throw new Error('no screenshot tool found: install grim (Wayland) or ImageMagick (X11)');
    r = exec(found[0], found[1], { timeout: 30000 });
  }
  if (r.status !== 0 || !fs.existsSync(out)) throw new Error(`screenshot failed: ${(r.stderr || r.stdout).trim().slice(0, 400)}`);
  return out;
}

module.exports = { shot };
