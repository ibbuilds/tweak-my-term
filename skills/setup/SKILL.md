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
```

Read the detect output before asking anything. Don't ask what you can detect.

## 1. Brief → `brief.md` in the run folder

Read [references/brief.md](references/brief.md). Capture in the user's words: what they
want it to look and feel like, which terminal and shells, what must keep working (aliases,
keybindings, habits), speed budget, and whether installs are allowed. Ask at most 3 short
questions, only for what changes the result. If the user is vague or says "surprise me",
go to Inspire.

## 2. Inspire: real examples that match the request

Every terminal is different, and nothing in this repo is a look to copy. What tells you
what "better" means for this user is real work by people who care: 4,000+ r/unixporn
rices with screenshots and dotfiles. Do this for every request, not only vague ones; a
precise request ("gruvbox, minimal, kitty") still needs examples to set the bar.

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
user pick, mix, or reject. Precise request: pick 2-3 matching examples yourself, say what
you're taking from each, and keep going. Write what you took into `brief.md`.

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
- Arrangement (panes, what runs where, startup layout, dropdown): build it from the
  brief's layout line with [references/layout.md](references/layout.md), natively first.
- Background: `tmt art treat anchor.png bg.png --fit WxH --for-text look.json` reads the
  composition (where the subject sits vs where text goes) and applies the lightest fix; act on
  its notes (move the subject) before adding veil. It keeps text
  readable over the image.

## 5. Look spec → `look.json`

Write `look.json` in the run folder following `${CLAUDE_PLUGIN_ROOT}/schemas/look.schema.json`
(example: `${CLAUDE_PLUGIN_ROOT}/tests/kit/fixtures/look.json`, a test fixture showing the shape, not a look to copy). Check it:
`tmt look check look.json`, then `tmt stage look look.json`.

## 6. Fit: which tools deliver each part on this OS

Read [references/fit.md](references/fit.md). For each part of the look, find the tool
that does it on the user's OS: `tmt catalog cap <capability>` and `tmt catalog show <id>`.
Prefer what is already installed. If something can't be done on their terminal (e.g. GIF
background, shaders, blur), say so and give the closest alternative, or propose a
terminal that can (and what switching costs). Tools missing from the catalog: research the
current official docs, and mark the result "unverified" to the user.

## 7. Preview → user approves the look

`tmt art preview look.json --out <run>/preview.html --swatch <run>/swatch.png`. Open or
link it. Get a yes on the look (colors, font, background, prompt) before rendering
configs. Iterate here; it's cheap.

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
