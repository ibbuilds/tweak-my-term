# Polish: compare the real terminal with the anchor

After apply + verify, the user opens a new window (settings and profiles load on new
sessions). Then:

1. `tmt shot` captures the foreground window into `<run>/shots/` (or `--title <text>` for
   a specific window, `--delay 3` to give the user time to focus it). If capture isn't
   possible (remote, Wayland without grim), ask the user for a screenshot.
2. Look at the screenshot next to `anchor.png` and `preview.html`. Check:
   - **Colors**: background tone and accent match; ANSI colors in `ls`/`git status` are
     the planned ones (a wrong scheme name or a profile that overrides the default).
   - **Readability**: text over the background image is clear where text actually sits,
     including over the bright parts. If not: move the image first (alignment, mirror,
     crop), then a local shade (`--for-text`), then lower the image opacity. An even
     veil is the last resort; it flattens the picture.
   - **Font**: right family and size; icons render (a box or `?` = no Nerd Font glyphs:
     fix font face or fallback); no clipped glyphs (line height).
   - **Layout**: padding, crop of the background, prompt alignment and segment order,
     right prompt not overlapping, tab/title bar as planned.
   - **Speed**: prompt appears instantly; `tmt measure` numbers within budget.
3. Fix small issues in a new run (`tmt new`, stage the changed files, plan, approve,
   apply, verify). Keep each fix small so it's easy to review and undo.

Stop when it matches the preview the user approved, or the user is happy. Report what
you could not match and why.
