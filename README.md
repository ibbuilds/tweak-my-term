# berserk-terminal

Dotfiles for a dark, fast, minimal Windows Terminal with **Git Bash** and **Windows
PowerShell**: blood-moon ASCII art, a Templar-cross dossier, one prompt design across both
shells, and fuzzy everything. Tuned for startup speed on Windows, where every process
costs 10–60 ms.

There is no installer. These are plain config files: read them, copy what you want.

![Git Bash in Windows Terminal with this setup](docs/screenshot.png)

## What you get

- **Art**: an original engraving-style scene (a blood moon, a fallen warrior curled on a
  hill of red-lit grass) painted by [`scene.js`](home/.config/eclipse/art/scene.js) and
  turned into a pixel/ASCII background by [`build.ps1`](home/.config/eclipse/art/build.ps1).
  The built image is included.
- **Dossier**: on each new tab, an ASCII Templar cross and a short system block, drawn
  first so the tab has content in ~0.3 s ([fastfetch](https://github.com/fastfetch-cli/fastfetch)).
- **Prompt**: two lines, the same in bash and PowerShell: path, git branch and state, how
  long the last command took, its exit code, and the project's runtimes.
- **Line editing**: plain readline in bash, so typing costs nothing (as in `cmd`); ↑/↓
  search history by what you've typed. PSReadLine in PowerShell adds history predictions.
- **Fuzzy tools**: [fzf](https://github.com/junegunn/fzf) on `ctrl+r` (history), `ctrl+t`
  (files) and `alt+c` (cd), [zoxide](https://github.com/ajeetdsouza/zoxide) `z`, plus `fe`,
  `rgf`, `gb`, `glog`, `fkill` and `port`. Run `keys` for the full sheet.
- **Windows Terminal**: color scheme and theme, tab icons, shell integration (jump between
  commands, select the last output) and a quake drop-down window. No animations, no
  acrylic, no transparency and no shader: an opaque window redraws the least.

| Measured on one machine | Stock Git Bash and profile | This setup |
|---|---|---|
| Git Bash, prompt ready | ~1.65 s | ~0.4 s |
| Git Bash, cost per keystroke | ~0 ms | ~0 ms |
| Git Bash, Enter in a git repo | – | ~45 ms (one `git status`); ~2 ms on an empty Enter |
| PowerShell, profile | ~0.55 s | ~0.47 s |

Why no [ble.sh](https://github.com/akinomyoga/ble.sh) (inline hints and syntax colors
for bash)? On Windows it costs 24–60 ms per keystroke and ~0.9 s per new tab. Inline
hints are left to PowerShell, where PSReadLine draws them natively.

Most of the bash gain comes from starting `usr\bin\bash.exe` directly, which skips Git's
launcher and `/etc/profile`; [`profile.bash`](home/.config/bash/profile.bash) sets up the
same environment without extra processes.

## Requirements

- Windows 10/11, [Windows Terminal](https://aka.ms/terminal), [Git for Windows](https://gitforwindows.org)
- Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) and Symbols Nerd Font Mono
  (`NerdFontsSymbolsOnly` from [Nerd Fonts](https://www.nerdfonts.com/font-downloads))
- CLI tools on `PATH`: `fzf fd ripgrep eza bat delta zoxide fastfetch lazygit`
  (any package manager works: winget, scoop or choco). The aliases (`ls` → eza,
  `diff` → delta) and the dossier expect them.
- Optional: PSReadLine 2.2 or newer for history predictions in PowerShell
  (`Install-Module PSReadLine -Scope CurrentUser -Force`). Windows ships 2.0, which works
  without them.
- Optional: Node.js, only to rebuild the art.

## Setup

Back up your own files first; these replace them.

1. **Copy the config.** Everything under [`home/`](home) mirrors your home folder
   (`%USERPROFILE%`). Copy the files you want to the same paths.
2. **PowerShell.** Add this line to your profile (`notepad $PROFILE`):
   ```powershell
   . "$HOME\.config\eclipse\eclipse.ps1"
   ```
3. **Windows Terminal.** [`terminal/settings.json`](terminal/settings.json) is a complete
   example. Merge the parts you want into yours (Settings → Open JSON file): the
   `schemes`, `themes`, `profiles.defaults` and the Git Bash profile. Paths use
   `%USERPROFILE%`, so they work as they are. The Git Bash profile assumes Git is
   installed in `C:\Program Files\Git`.
4. **Git (optional).** Colored diffs through delta and a `git lg` graph:
   ```powershell
   git config --global include.path "~/.config/git/eclipse.gitconfig"
   ```
5. Open a new tab.

## Make it yours

| Want | Do |
|---|---|
| Your own background | `powershell -File ~/.config/eclipse/art/build.ps1 -Base my-picture.png` (needs Node.js) builds a new image, points Windows Terminal at it and removes the previous build. Tune it with `-BaseDim`, `-Pixel`, `-GlyphA` and `-Bloom`. Add `-OutFile art.png` to only write the image. |
| Machine-specific paths and aliases | Copy [`local.example.bash`](home/.config/bash/local.example.bash) to `~/.config/bash/local.bash` and keep it out of version control. |
| A quieter tab | `ECLIPSE_QUIET=1` hides the dossier. |

## Layout

```
home/                      mirrors your home folder
  .bashrc                  load order: fast profile -> env -> dossier -> modules
  .config/bash/            env, profile, shell, history, theme, completion, tools,
                           aliases, functions, prompt
  .config/eclipse/         eclipse.ps1 (PowerShell), dossier.jsonc, art/
  .config/git/             eclipse.gitconfig (delta colors), git-prompt.sh (keeps Git's
                           default prompt out of the way)
  .config/bat, lazygit     their configs, in the same palette
  .inputrc                 readline settings for bash
terminal/settings.json     Windows Terminal example settings
```

## License

[MIT](LICENSE). The art in this repo is generated by its own code. Tools it configures
keep their own licenses.
