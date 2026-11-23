---
name: inspire
description: Find terminal looks that match what the user asks for - searches 4,000+ r/unixporn rices (screenshots + dotfiles repos), looks at each screenshot, judges the terminal window inside it, and shows a varied shortlist (different layouts, compositions and palettes). Use when the user wants terminal or dotfiles inspiration, ideas, examples, "show me options", or doesn't know what look they want.
argument-hint: "[mood, scheme, terminal or tool words]"
---

# Inspiration

Query: $ARGUMENTS

Inspiration is the reference for what a great terminal looks like. Metadata (scheme name,
WM, tools) can't tell you that; the screenshots can. So you search, then you look.

1. `tmt detect` (skip if already done this session) to know the OS, terminal and shells.
2. Turn the request into searches. Use the user's own words plus what they imply: mood
   ("calm", "retro", "dense"), scheme, terminal, layout ("tiling", "single floating
   terminal", "splits", "transparent over wallpaper"). Run 2-3 searches with different
   words; results are varied by design (no repeated scheme, WM or author).
   `tmt inspire <words> --os <os> --limit 12 --json`. For a fresh draw instead of the most
   upvoted: `--sort random --seed <n>`; for current styles: `--sort new`.
   `tmt inspire --facets` shows which schemes and terminals exist.
3. **Look at the screenshots.** `tmt inspire <same words> --limit 12 --save all <run>/inspire/`
   downloads them (local reference only). Open each image and find the terminal
   window(s). Most screenshots are whole desktops: bars, docks, wallpaper, browsers, music
   widgets. Judge only what lives inside the terminal window, plus how the window sits on
   the screen if the user wants that too. Skip shots where the terminal is tiny, hidden, or
   not the point. For each one you keep, note:
   - layout: single window, splits/panes, tabs, multiplexer, how much empty space;
   - composition: where the image/art sits vs where text goes, padding, alignment;
   - palette: background tone, accent, how many colors carry weight;
   - type: font feel, size, line height;
   - prompt: lines, segments, symbols; and what else is on screen (fetch, TUI apps);
   - what makes it look good (or not) in one honest line.
   Read [../setup/references/design.md](../setup/references/design.md) for what to judge.
4. Show 3-6 candidates that differ from each other (layout, composition, palette), each
   matching the request: title, screenshot link, the notes above in two lines, and what
   transfers to the user's OS. Colors, font, prompt, padding, background art, fetch and
   TUI themes transfer anywhere; tiling WM layout, bars and compositor blur don't (on
   Windows/macOS say what the closest equivalent is).
5. When the user picks one (or mixes two), continue with the `setup` skill. To use the
   terminal from a screenshot as the anchor, cut it out first:
   `tmt art treat <run>/inspire/rice-<id>.png <run>/anchor.png --crop X,Y,W,H`.

For deep research (reading dotfiles repos too), delegate to the `inspiration-scout`
subagent so screenshots and repo files stay out of your context.

Screenshots are linked in answers and never rehosted or committed. Data: awesome-dotfiles
(r/unixporn), the same set as dotfiles.lol.
