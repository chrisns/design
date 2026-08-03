# Slide theme — legacy, not on brand

`cns.css` is the marp theme behind every deck in `chrisns/talks`. It is captured here verbatim so the current slide look is at least recorded. **It is not part of the design system.**

- Blue-grey and amber palette — no `--pink`, no `--ink`, no `--paper`.
- Set in the marp default faces — no Fraunces, no Hanken Grotesk.
- `@import-theme "gaia"`, so it only renders correctly through the marp toolchain.

There is no preview card for it, because a standalone HTML page cannot faithfully reproduce a gaia-based marp theme, and a preview that lied would be worse than none.

Converting it is a separate job: it re-renders every existing deck, so it needs its own review.
