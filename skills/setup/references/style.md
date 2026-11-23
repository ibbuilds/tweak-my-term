# Style: from anchor to tokens

## Palette

`tmt art palette anchor.png --mode dark` extracts dominant colors and maps them to the
16 ANSI slots + background, foreground, cursor, selection, accent, then fixes lightness
so text passes contrast. Check it with `tmt art contrast look.json [--image bg.png]`.

Rules that keep a palette usable:
- ANSI slots keep their meaning: red = errors/deletions, green = success/additions,
  yellow = warnings, blue = directories/info, magenta = special, cyan = links/types.
  Tools (ls, git, compilers) assume this; shift hues toward the anchor but don't swap them.
- Foreground vs background ≥ 7:1 (AAA) for body text; each ANSI color ≥ 4.5:1 except
  black/brightBlack (used for dim text, ≥ 2:1 is fine).
- Bright variants are brighter (dark mode) and distinct from normals.
- Selection must keep fg readable (≥ 3:1 for fg on selection).
- Cursor: the accent, high contrast against bg.
- One accent color carries the identity (prompt symbol, active tab, cursor). The rest
  stays quiet.

Named schemes (Catppuccin, Tokyo Night, Gruvbox, Nord, Rosé Pine, Dracula, Everforest,
Kanagawa, Solarized): use the official ports listed in
`${CLAUDE_PLUGIN_ROOT}/catalog/palettes/` when the user names one; import with
`tmt art scheme <file>`.

## Font

- Nerd Font variants are needed for prompt icons and file icons (eza, yazi, starship).
  Either a patched family ("JetBrainsMono Nerd Font") or the plain font + "Symbols Nerd
  Font Mono" fallback (Windows Terminal, WezTerm, kitty support fallback chains).
- Pick by mood: JetBrains Mono / Cascadia Code (neutral, ligatures), Iosevka (narrow,
  dense), Fira Code (friendly), Hack / DejaVu Sans Mono (classic), IBM Plex Mono
  (corporate), Monaspace (texture), VT323 / Departure Mono / Terminus (retro, pixel),
  Maple Mono / Victor Mono (cursive italics).
- Size 11-14 pt, line height 1.2-1.3 (see design.md). Ligatures only if the user likes them.
- `tmt stage font <Name>` installs per-user from the Nerd Fonts release.

## Layout and chrome

Decide and record in look.json: padding (8-24 px), opacity (1.0 unless the anchor is the
desktop itself), acrylic/blur (OS-dependent), title bar and tabs (hidden/integrated),
scrollbar (hidden), cursor shape and blink, window size, bell (visual). Panes and
startup arrangement: [layout.md](layout.md).

## Prompt

Segments in priority order: cwd (shortened), git branch + dirty state, exit status,
duration of slow commands, then context only when relevant (venv, node version in a
project, ssh host, root). One line for minimal looks; two lines when the path is long or
the look is "dashboard". Transient prompt (collapse old prompts) for clean scrollback.
Speed: the prompt must render in < 50 ms; avoid spawning git per segment (starship and
oh-my-posh cache).

## Effects (only where supported)

Background image + opacity, acrylic/vibrancy, shaders (CRT, bloom, scanlines: Windows
Terminal pixel shaders, Ghostty custom shaders, WezTerm none), cursor trail (Ghostty
shaders, kitty `cursor_trail`), animated GIF (WezTerm, kitty no). Retro effects cost
readability; offer them as a toggle.
