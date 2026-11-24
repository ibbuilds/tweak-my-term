---
name: setup
description: Build or restyle the user's terminal on Windows, macOS or Linux - colors, font, background image or animation, prompt, layout, fetch art and CLI tools - from an image, a mood, a rice or a description, applied with a diff, approval, verification and undo. Use when the user wants to change, theme, rice, redesign, set up or "make it look like" their terminal, shell prompt or dotfiles, shares a picture of a terminal they like, or asks for a terminal for a mood or aesthetic.
argument-hint: "[what you want, an image path/URL, or a rice link]"
---

# Build a terminal look

Request: $ARGUMENTS

You deliver the finished terminal, first time. Work through the stages in order. Every
stage leaves a file in the run folder, so the work survives context loss and the user can
see it. `tmt` is on PATH (plugin `bin/`); if not, use `node ${CLAUDE_PLUGIN_ROOT}/engine/cli.js`.

Never edit live config files directly (a hook blocks it). Write drafts into the run folder,
stage them with `tmt stage`, and let `tmt apply` write them after the user approves.

## 0. Start

```
tmt status            # an unfinished run? finish it or ask
tmt new --note "<one line of the request>"
tmt detect            # facts: OS, terminals, shells, tools, fonts, existing configs
tmt capture           # copies their configs (and files the rc files source) + current.json
tmt audit             # audit.md: what to keep, improve, or add, judged by the design rules
```

Read the detect output and `audit.md` before asking anything. Don't ask what you can
detect. You are improving the user's terminal, not replacing it: everything under **Keep**
stays (palette, prompt, aliases, keybindings) unless the request is to change it; the
**Improve** and **Missing** lines are where the new look starts; **Facts** (layout, shader,
fetch, multiplexer) are what the new layout builds on. Read `current.json` for exact
values (hexes, font, padding) and reuse them in look.json for whatever you keep.

## 1. Brief → `brief.md` in the run folder

Read [references/brief.md](references/brief.md). Capture in the user's words: what they
want it to look and feel like, which terminal and shells, what must keep working (aliases,
keybindings, habits), speed budget, and whether installs are allowed. Ask at most 3 short
questions, only for what changes the result, as options with your recommended default
(see "How to ask" there). Mood words ("vaporwave", "cozy", "like paper") mean concrete
palettes, art, fonts and layouts: read [references/moods.md](references/moods.md). If the
user is vague or says "surprise me", go to Inspire.

Record style and layout separately, and the scope: a layout-only request keeps the
user's palette, font and prompt and skips the anchor and palette work (the palette in
`current.json` goes in look.json for the preview); a style-only request keeps their
arrangement. "Better", "more complex", "upgrade it" with nothing else: keep every Keep line,
fix every Improve/Missing line, and raise the layout one step with inspiration (single
window → 2-3 panes with a job each; panes → a dashboard). Write the audit's Keep list
into the brief's "Must keep".

## 2. Inspire: real examples that match the request

Every terminal is different, and nothing in this repo is a look to copy. What tells you
what "better" means for this user is real work by people who care: 4,000+ r/unixporn
rices with screenshots and dotfiles. Do this for every request, not only vague ones; a
precise request ("gruvbox, minimal, kitty") still needs examples to set the bar. A named
scheme fixes the colors, not the padding, prompt, bars or layout; "I trust you" or
"approved in advance" hands you the choices, which raises the bar rather than removing
this step. Skip it only when the user says so.

Follow the `inspire` skill ([../inspire/SKILL.md](../inspire/SKILL.md)), or hand it to the
`inspiration-scout` subagent to keep screenshots out of your context:
- search style and layout separately when the user cares about both: style with their
  words (mood, scheme, terminal), layout with `--layout tiling|floating|panes|dashboard|scrolling`
  ([references/layout.md](references/layout.md)); judge each example only on its own axis;
  results are varied on purpose, and `--sort random --seed n` draws a fresh set;
- download and **look at** the screenshots; they are whole desktops, so judge the terminal
  window inside each one (layout, composition, palette, type, prompt);
- judge them with [references/design.md](references/design.md).

Vague request or "show me options": show 3-6 that differ from each other and let the
user pick, mix, or reject. Precise request: pick 3+ matching examples yourself, say what
you're taking from each, and keep going.

The references decide more than colors: which layout (panes, a fetch or clock beside the
shell, tabs), which tools (fetch, multiplexer, file manager, monitors), the prompt, the
window chrome and icons. Look at each terminal element in the screenshots and take the
ones that fit the user's needs. Write them into `brief.md` as a `References:` section, one
line each: `- <link> take: <what you use from it>`. Save each one's screenshot into the run
(`tmt inspire ... --save <n> <run>/refs`) and Read it: judge the image, not the search text.
`tmt plan` blocks until there are 3+ links and 3+ images in `refs/`;
an element's `why` can cite them ("ref 2: clock pane").

## 3. Visual anchor → `anchor.png`

Every look has one anchor image that defines it. Read [references/anchor.md](references/anchor.md).
Sources, in this order: the user's own image/URL → the chosen rice screenshot
(`tmt inspire --save <n> <run>/`, then `tmt art treat ... --crop X,Y,W,H` to cut out the
terminal) → generated (`tmt art scene`, or a custom paint script
against the kit raster API) → an image tool the user already has. Show the anchor to the
user (path or preview) before continuing. ASCII/ANSI logos come from `tmt art ascii`.

## 4. Style → design tokens

Read [references/style.md](references/style.md). From the anchor:
- `tmt art palette anchor.png --mode dark|light` → 16 ANSI + bg/fg/cursor/selection/accent,
  contrast-fixed. Or import a named scheme with `tmt art scheme <file>`.
- Choose font (Nerd Font for icons), size, line height, padding, opacity/blur,
  cursor, tab/title bar, prompt layout (segments, one or two lines, transient), and
  density. Judge every choice with [references/design.md](references/design.md).
- Arrangement (panes, what runs where, startup layout, dropdown): from the brief's layout
  line, write `layout.arrangement` in look.json ([references/layout.md](references/layout.md));
  build it natively first.
- Background: `tmt art treat anchor.png bg.png --fit WxH --for-text look.json` reads the
  composition (where the subject sits vs where text goes) and applies the lightest fix; act on
  its notes (move the subject) before adding veil. It keeps text
  readable over the image.

## 5. Look spec → `look.json`

Write `look.json` in the run folder following `${CLAUDE_PLUGIN_ROOT}/schemas/look.schema.json`
(example: `${CLAUDE_PLUGIN_ROOT}/tests/kit/fixtures/look.json`, a test fixture showing the shape, not a look to copy). Check it:
`tmt look check look.json`, then `tmt stage look look.json`.

## 6. Fit: which tools deliver each part on this OS

Read [references/parts.md](references/parts.md) and [references/fit.md](references/fit.md).
For each part (palette, font, background, prompt, terminal, layout, each themed tool) use
whatever gets a working result fastest: what the user has, a rice's files for the user's
own tools, the official port of a named scheme, the catalog recipe, or your own file. The
outcome counts, not the source. Shortcuts when they fit:
- the chosen rice (inspiration pick with a repo): its `parts:` line in the `tmt inspire`
  output lists its files per tool (your installed tools marked "yours": --get those), wallpapers
  and license (`tmt parts rice <repo>` for the
  full list); `tmt parts rice <repo> --get <path...>` saves them into the run
  folder. Adapt them (paths, fonts, OS); without a license take values, not whole files.
- a named scheme: `tmt parts port <scheme> <app> [--flavor f] --get` for every app in the look
  (terminal, prompt, multiplexer, btop, editor...). Any of 1,000+ schemes works ("Gruvbox Dark Hard").
Write the parts and their sources in `brief.md`. For each part, find the tool
that does it on the user's OS: `tmt catalog cap <capability>` and `tmt catalog show <id>`.
Prefer what is already installed. If something can't be done on their terminal (e.g. GIF
background, shaders, blur), say so and give the closest alternative, or propose a
terminal that can (and what switching costs). Tools missing from the catalog: research the
current official docs, and mark the result "unverified" to the user.

## 7. Preview → user approves the look

`tmt art preview look.json --out <run>/preview.html --swatch <run>/swatch.png --png <run>/preview.png`.
`--png` renders the page with a local Chrome/Edge/Chromium/Brave: read that image yourself
and fix what looks wrong (contrast, clipped text, a pane that reads as empty) before the
user sees it. Then open or link the HTML. Get a yes on the look (colors, font, background,
prompt, arrangement) before rendering configs. Iterate here; it's cheap.

## 8. Render configs → staged files

Read [references/render.md](references/render.md) and each tool's recipes in
`${CLAUDE_PLUGIN_ROOT}/catalog/<category>/<id>/recipes/`. Write every config into the
run folder, then stage it:

```
tmt stage write      <target> <file>   # whole file you own (theme files, tool configs)
tmt stage block      <target> <file>   # lines in a user's rc file (.bashrc, .zshrc, $PROFILE, .gitconfig)
tmt stage merge-json <target> <file>   # keys in a JSON config (Windows Terminal settings.json)
tmt stage install    <manager> <id>    # only what the look needs and the user allowed
tmt stage font       <NerdFontName>
tmt stage shell      <bash|zsh|fish|powershell|pwsh|nu>   # shells to time
tmt stage check      -- <cmd> [args]   # extra validation
```

A look is the whole terminal, never only a background or a color scheme. Cover every
shell and terminal in `detect.json`:
- each terminal: color scheme, font, cursor, padding, background, window/tab theme; in
  Windows Terminal put them in `profiles.defaults` so every profile (PowerShell, cmd, Git
  Bash, dev shells) gets them;
- each shell: prompt, banner/fetch, line-editor colors and tool colors (`LS_COLORS`, eza,
  grep, fzf, bat, git pager, lazygit);
- an existing setup (a custom prompt, a banner): override it from a block at the end of the
  rc file and quiet its banner (an env var in the terminal profile), so `tmt restore` brings
  it back unchanged.
- the window: a Windows Terminal `theme` (tab row, frame) as well as the scheme, and any
  start layout the user asked for (side panes with a fetch, a clock).
Decide every element in catalog/elements.json for each detected shell and terminal (tab and
window icons, titles, scrollbar, selection, completion menu, pager, responsiveness ...) as
look.json `elements["<tool>.<element>"] = { "choice": ..., "why": <the user need> }`, or
"keep". "keep" is not allowed for what the look restyles (catalog/elements.json `restyle`:
scheme, font, cursor, background, frame, tab row and style, tab and window icons, unfocused,
pane dividers, startup layout, prompt, title, banner, responsiveness): the user's old icons
or banner clash with a new look. Draw icons with `tmt art icon` (one motif per shell profile,
an `.ico` for the app shortcut). The why ties each choice to the brief: ask the user when a need is unknown instead
of guessing. Also decide `prompt`, `onStart`, `tools`, `layout` and `window` ("none" is a
decision). Prompts keep the user's other hooks (append to `PROMPT_COMMAND`, don't replace
it) and read git state without a subprocess per prompt on Windows. `tmt plan` lists what is
"Not restyled", what the look "leaves undecided" and the "Elements undecided"; fix all before asking for approval.

Targets use `~` and tokens (`{wt-settings}`, `{ps-profile}`, `{xdg-config}` ...). Keep
the user's existing settings: use `block` and `merge-json` over `write` for files the user
already has. Respect `tmt measure --before` budget: no slow plugins or framework loaders
when a faster equivalent exists.

## 9. Plan → approve → apply

```
tmt measure --before
tmt plan
```

Show the user the plan: files created/changed with the important diff lines, installs,
fonts. Ask for approval in plain words. Only after a clear yes:
`tmt approve <hash>` then `tmt apply` (add `--allow-installs` only if the user agreed to
installs). Installs that need sudo are printed for the user to run.

## 10. Verify, measure

`tmt verify` (every config's own check must pass), then `tmt measure` (startup vs
budget). On failure: read the output, fix in a new run, or `tmt restore`. Never leave the
machine half-applied; the Stop hook enforces this.

## 11. Polish

Ask the user to open a new terminal window, then `tmt shot` (or ask for a screenshot).
Compare it with `anchor.png`, `preview.html` and the inspiration examples you chose, and
critique it with [references/design.md](references/design.md): colors, contrast, font rendering,
background crop, prompt alignment, icon glyphs (tofu boxes = missing Nerd Font). Fix
small issues in a new run (`tmt new`, stage, plan, approve, apply). Read
[references/polish.md](references/polish.md).

## Finish

Tell the user: what changed (files, tools), how to undo (`tmt restore <run-id>`), startup
times before/after, and anything that couldn't be done with the closest alternative.

## Rules

- The user approves the look (preview) and the plan (diff) before anything is written.
- One run = one coherent change. Never write outside a run.
- Don't install what wasn't asked for. Prefer per-user installs.
- Generated or user-owned images only. Third-party screenshots are linked; download one
  only as the user's anchor, kept local.
- Never print secrets from existing configs (tokens in rc files, env exports).
- No shell access (can't run `tmt`)? Say so, change nothing, and give the exact `tmt`
  commands. If you also offer hand edits, put "copy the file first" (backup) as step 1.
- A trial window (e.g. `wt -w new ...` with the planned panes, to see that they start) is
  fine before approval; it changes no config. Close it when done (stop the processes it
  started) and say you did, so nothing is left running on the user's desktop.
