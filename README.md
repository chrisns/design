# CNS Design System

The visual and content system behind **cns.me** — Chris Nesbitt-Smith's blog, talks catalogue and side projects. Pink-forward, editorially typeset, closer to a small independent press than a tech consultancy.

This repo is the canonical source. It syncs to a Claude Design project, and the sites consume it as an npm dependency.

```
npm i github:chrisns/design
```

---

## Where it comes from

Earlier versions of this system were reconstructed from public web sources. This one is not: it was extracted from the CSS the three production sites actually serve.

| Surface | Repo | Extracted from |
|---|---|---|
| [blog.cns.me](https://blog.cns.me) | `chrisns/newsletter` (11ty) | `/assets/style.css` |
| [talks.cns.me](https://talks.cns.me) | `chrisns/talks` (marp) | inline `<style>` |
| [govbuy.run.cns.me](https://govbuy.run.cns.me) | `chrisns/govbuy` | inline `<style>` |

The blog stylesheet turned out to be three files concatenated, with the boundary comments intact, so the layers split back out losslessly:

```
blog.css lines    1– 317  →  colors_and_type.css
                318– 593  →  the site/catalogue layer
                594–2161  →  the blog layer
```

That confirmed what the sites are: hand-pasted copies of one system that has since drifted. Making this repo canonical is what stops the drift.

---

## Layout

| Path | What it is |
|---|---|
| `tokens.css` | **The tokens.** Colour, type, spacing, radii, shadows, motion, layout, and the font `@import`. Nothing but custom properties. |
| `colors_and_type.css` | `tokens.css` plus the semantic type layer (`.h1`, `.lede`, `.eyebrow`, `code`, `p`) and a base reset. |
| `preview/*.html` | Cards for the Claude Design pane. Each links the real kit CSS and uses real class names, so a preview cannot drift from the thing it documents. |
| `ui_kits/blog/` | blog.cns.me — masthead, lead post, post grid, year archive, prose, figures, author block. |
| `ui_kits/talks/` | talks.cns.me — guilloche masthead, hero, talk grid, schedule, booking strip, colophon. |
| `ui_kits/govbuy/` | govbuy.run.cns.me — the data-dense app surfaces: tables, stat rows, bars, chips, connector cards, form fields. |
| `ui_kits/slides-legacy/` | The marp slide theme, **unconverted**. See below. |
| `assets/` | Logos, icons, sample imagery. |
| `scripts/check.mjs` | `npm test`. Guards the invariants below. |
| `SKILL.md` | Agent Skill descriptor. |

---

## Consuming it

**Pick the right entry point.** This matters more than it looks:

| You want | Link |
|---|---|
| Tokens only — no element or class rules | `tokens.css` |
| Tokens + semantic type + base reset | `colors_and_type.css` |

`colors_and_type.css` styles bare `p`, `code`, `a`, `hr` and classes like `.label` and `.numeral`. Only **blog.cns.me** has ever had that layer. talks and govbuy inlined the `:root` block alone, so handing them the full file silently restyles their `<code>` elements and mono labels. Both take `tokens.css`.

Then the kit:

```html
<link rel="stylesheet" href="…/tokens.css">
<link rel="stylesheet" href="…/ui_kits/talks/talks.css">
```

`tokens.css` `@import`s all three fonts at the union of every weight the three sites request. **Consumers should not add their own font tag.**

### The one visual change

Fraunces is a variable font, and a browser clamps to the heaviest instance you actually requested. The three sites asked for different italic ranges — blog 400–500, govbuy 400–600, talks 400–700 — so the shared union (400–700) renders italic display text on blog and govbuy a notch heavier than before. It is closer to the `font-weight: 900` those rules actually specify. Affected: the italic `me` in the wordmark, and `em` inside display headings. talks is unaffected, and renders byte-identically.

---

## What the check enforces

`npm test` fails the build on:

1. **A `var(--x)` that resolves nowhere**, in a kit or in `colors_and_type.css` itself. Caught govbuy referencing `--ease` and `--maxw`, which never existed — they are `--ease-out` and `--maxw-page`.
2. **A raw brand hex where a token exists.** 35 literals across the three kits are now `var()`. A design system where changing `--pink` doesn't change everything is decoration.
3. **A preview with a dead reference or no `@dsCard` marker.** A broken card renders blank in the Design pane and nobody notices.

It also fails if `colors_and_type.css` starts defining tokens of its own — they belong in `tokens.css`, once.

It *reports*, without failing, drift in the shared class vocabulary. That is a decision, not a lint — see below.

---

## Known drift

**21 class names are defined in all three kits. Two have identical definitions.**

`.brand-me` and `.rule` agree. The other 19 — `.page`, `.masthead`, `.eyebrow`, `.btn-primary`, `.btn-ghost`, `.section-header`, `.sh-title`, `.colophon` and the rest — have forked. blog and talks stay close (a `gap` here, a `grid-template-columns` there). govbuy is the outlier: tighter spacing, a pill ghost button, a smaller section title.

Converging them changes live rendering on three deployed sites, so it is deliberately **not** done here. `npm test` prints the list every run.

**Two govbuy neutrals were promoted to tokens.** `#D8CFC4` and `#4A443E` — muted text and a hairline on an ink surface — existed only as literals. The system had `--fg-on-ink` but no muted or rule variant, so govbuy invented them. They are now `--fg-on-ink-2` and `--rule-on-ink`.

**Some components are defined but unused.** No live post uses the three hero-plate variants (`.hero-letterpress`, `.hero-duotone`, `.hero-typographic`) or `.pull-quote` — every post ships `.post-hero-photo` and a plain `<blockquote>`. Roughly 300 lines of CSS with no consumer. Kept for now because they are the system's expressive range, but they are the first thing to delete if the blog CSS needs slimming.

**The thumbnail gradient block is duplicated four times** in `ui_kits/blog/blog.css`. Left as-is because it matches what production serves.

**The slide theme never got the rebrand.** `ui_kits/slides-legacy/cns.css` is the marp theme behind every deck. It uses a blue-grey and amber palette and `@import-theme "gaia"` — no pink, no Fraunces. It is captured here as-is, unconverted, with no preview card: it extends a marp base that cannot be rendered faithfully in a standalone HTML page.

---

## Verifying a change

Rendering equivalence is checked by diffing computed styles, not by eyeballing. Load the production page and the kit page in two same-origin iframes, freeze animations (`animation:none`), and compare ~26 computed properties per element:

| Page | Elements compared | Identical |
|---|---|---|
| talks | 674 | **674** |
| blog | 568 | 566 — 2 italic glyph widths |
| govbuy | 867 | 862 — 2 italic glyph widths, 3 JS-driven chat nodes |

Freezing animations matters: without it the blog masthead pulse and govbuy's chat demo sample at different points in their timelines and produce dozens of phantom colour diffs.

## Content fundamentals

The voice is **dry, British, and unimpressed by jargon**. Chris has spent twenty years in and around government and large enterprise, and writes like someone who has seen the same mistake five times and is fond enough of you to warn you about it.

### Voice

- **First-person singular.** "I", "my", "I've been".
- **Address the reader as "you".** Conversational, direct.
- **British English.** organisation, optimise, behaviour, programme.
- **Plain words over corporate ones.** "stuff" is fine. "synergise" is not.
- **Long sentences are welcome.** Semicolons do real work here.
- **Italics for asides and emphasis** — *"government digital stuff"*.
- **Square-bracketed qualifiers** for precision: `Policy as [versioned] Code`. A brand mannerism; keep it.
- **`No.NN` for catalogue items.** Keep the period.
- **Plain four-digit years** for tags — `2022`, `2025`. Not Roman numerals.
- **Full British dates** in captions: `14th May 2022`.
- **`§NN` section markers** as structural navigation.

### Casing and punctuation

Sentence case for headings; no Title Case Everywhere. ALL CAPS only for the mono eyebrow. Oxford comma. Smart quotes. Hyphenated compound modifiers: *citizen-facing*, *cloud-native*.

### Never

- "Synergy", "leverage" as a verb, "10x", "rockstar", "supercharge".
- "In today's fast-paced world", "navigate the complexities of".
- **Emoji.** The Fraunces italic and a well-placed `❦` cover anything decorative.
- Hype gradients, pastel palettes, Dribbble curves.

---

## Visual foundations

**Editorial meets electric.** A 1960s exhibition catalogue for a Modernist printer, except the spot colour is hot magenta and it knows it.

### Colour

`--pink` **#E5197F** is the brand — hot, saturated, magenta-leaning. "The trousers." It goes on type, rules and fills, and it is never decorative or apologetic. `--pink-hot` for hover and spotlight only. `--pink-deep` for links and press states. `--ink` **#14110F** is a warm near-black, never pure black. `--paper` **#F4EFE7** is warm cream — there are no cool greys in this system.

Pink is *the* colour. Don't dilute it with a secondary accent. The contrast story is **pink + ink + cream**: three voices, no chorus.

### Type

- **Display — Fraunces.** Variable serif at heavy weights, `opsz` cranked to 144 at the largest sizes. Italic Fraunces is a featured style: use it for the keyword inside a headline.
- **Body — Hanken Grotesk.** 400/500/600/700.
- **Mono — JetBrains Mono.** Eyebrows, labels, code, catalogue numerals.

Display in Fraunces, body in Hanken, structural metadata in mono. The mono labels are a brand mannerism and should appear regularly.

### Shape and surface

Flat colour, no gradients. Hairline `1px` rules divide content the way they do in a print magazine; a `2px` editorial rule sits above section eyebrows. **Square corners by default** — `--r-3` (8px) is the cap for a card, and the pill is reserved for primary buttons. Shadows are mostly `--sh-0`; `--sh-pink` is a coloured glow reserved for the primary button on hover, and only there.

No frosted glass, no backdrop blur, no animated gradients, no floating blobs, no parallax.

### Layout

Generous margins. Max content width **1080px**, max page width **1320px**, prose capped at **68ch** always. Asymmetric print-magazine compositions are encouraged. `§NN` section numbering is a layout primitive on long pages.

### Imagery

Warm-toned, often desaturated; monochrome stage shots read very on-brand. Every image sits in a `1px` ink hairline frame with a mono caption beneath — *"Plate I — The author at GitOpsCon, 2022"*. Photography over illustration; no vector mascots, no abstract blob art.

### Iconography

The vocabulary is closer to a printer's ornament case than a UI icon library: `§`, `❦`, `†`, `‡`, `·`, `—`, and 🦩 as a colophon break. SVG marks in `assets/icons/` exist only for external identities (GitHub, LinkedIn, mail, external-link); they are `currentColor` and sized to the body line-height. If a UI surface genuinely needs more glyphs, add a stroke set at 1.5px — but the answer is usually a mono label instead.

---

## Fonts

Fraunces, Hanken Grotesk and JetBrains Mono are all open-source and loaded from Google Fonts by `colors_and_type.css`. To self-host, drop `.woff2` files in `fonts/` and swap the `@import` for `@font-face` blocks — the token names don't change.

## Licence

MIT for the code. The name, wordmark and likeness of Chris Nesbitt-Smith are not covered — fork the system, not the identity.
