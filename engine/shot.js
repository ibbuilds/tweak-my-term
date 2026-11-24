'use strict';
// Screenshot of the terminal, so the agent can compare the real result with the anchor
// and the preview. Windows: the newest terminal window (or one whose title matches), never other apps.
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
  [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  public struct RECT { public int L, T, R, B; }
}
"@
[void][TmtWin]::SetProcessDPIAware()
# Only terminal windows: never capture whatever other app is in front (it may be private).
$terms = 'WindowsTerminal','alacritty','wezterm-gui','kitty','ghostty','Hyper','Tabby','rio','contour','OpenConsole'
$title = ${JSON.stringify(title || '')}
$wins = Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 -and $terms -contains $_.ProcessName }
if ($title) { $wins = $wins | Where-Object { $_.MainWindowTitle -like "*$title*" } }
$p = $wins | Sort-Object StartTime -Descending | Select-Object -First 1
if (-not $p) { throw "no terminal window open$(if ($title) { " with '$title' in its title" }): open the terminal (e.g. wt) and run tmt shot again" }
$h = $p.MainWindowHandle
if ([TmtWin]::IsIconic($h)) { [void][TmtWin]::ShowWindow($h, 9) }
Start-Sleep -Milliseconds ${Math.round(delay * 1000)}
$r = New-Object TmtWin+RECT
[void][TmtWin]::GetWindowRect($h, [ref]$r)
$w = $r.R - $r.L; $hh = $r.B - $r.T
if ($w -le 0 -or $hh -le 0) { throw 'window has no size' }
$bmp = New-Object System.Drawing.Bitmap $w, $hh
$g = [System.Drawing.Graphics]::FromImage($bmp)
# PrintWindow renders the window itself (2 = full content, works for GPU-drawn terminals), even if covered.
$dc = $g.GetHdc(); $ok = [TmtWin]::PrintWindow($h, $dc, 2); $g.ReleaseHdc($dc)
if (-not $ok) { throw 'could not render the terminal window' }
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
