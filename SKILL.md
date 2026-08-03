---
name: cns-design
description: Generate well-branded interfaces and assets for Chris Nesbitt-Smith (cns.me) — a pink-forward editorial design system covering his blog, talks catalogue, side projects, decks and throwaway prototypes. Contains design tokens, content and voice rules, brand assets, and UI kits extracted from the three production sites.
user-invocable: true
---

Read `README.md` for the full content, visual and iconography rules. `colors_and_type.css` is the single source of truth for tokens — never redeclare a colour, size or easing that already has a token.

**Building a visual artefact** (deck, mock, prototype): write static HTML, link `colors_and_type.css`, and copy what you need out of `assets/`. Link a `ui_kits/*` stylesheet too if you want the real components rather than raw tokens.

**Working on production code**: read the rules here to design fluently in the brand, and pull the tokens in as a dependency (`npm i github:chrisns/design`) rather than copying values.

**Invoked with no other guidance**: ask what is being built (deck? blog post? one-pager? new site surface?), ask a couple of focused questions about audience and scope, then act as an expert designer and output either HTML artefacts or production code as the need dictates.

## Quick reference

- **Brand colour** `--pink` `#E5197F`. Saturated magenta. The "trousers" colour. Confident, structural, never decorative.
- **Type lock** Fraunces display (900, italic keyword inside the headline) · Hanken Grotesk body · JetBrains Mono for eyebrows, `§NN` markers, `No.NN` numerals and code.
- **Palette discipline** pink + ink + cream. No secondary accent, no gradients, no cool greys.
- **Shape** square by default; 8px is the card cap; the pill is only for primary buttons. Mostly flat — `--sh-pink` is reserved for the primary button hover.
- **Measure** prose caps at 68ch, always.
- **Voice** dry, British, first-person, semicolons welcome. Sentence case. Plain four-digit years, not Roman numerals. **No emoji.** No "synergy".
- **Kits** `ui_kits/blog` (editorial), `ui_kits/talks` (catalogue), `ui_kits/govbuy` (data-dense app). `ui_kits/slides-legacy` is the unconverted marp theme — do not treat it as on-brand.

## Gotchas

- Load `colors_and_type.css` **before** any kit CSS; kits assume the tokens exist and define none of their own.
- Do not add a Google Fonts tag. The tokens file imports all three families at the union of every weight the sites use; a second tag is how weight mismatches creep in.
- The three kits share 21 class names and only two definitions agree. If you are copying a component, take it from one kit — do not mix `.masthead` from talks with `.sh-row` from govbuy.
