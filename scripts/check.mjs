#!/usr/bin/env node
// Guards the three invariants that make this repo a design system rather than
// three copies of a stylesheet:
//   1. every var(--x) a kit uses resolves against colors_and_type.css
//   2. no kit hardcodes a brand hex that a token already holds
//   3. every preview links files that exist and declares a @dsCard
// Also reports (without failing) where the shared class vocabulary has drifted
// between kits, since converging that changes live rendering and is a decision,
// not a lint.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const KITS = ["blog/blog.css", "talks/talks.css", "govbuy/govbuy.css"].map((p) =>
  join("ui_kits", p),
);
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const errors = [];

// Brand hexes that have a token. Anything here appearing raw in a kit is drift.
const TOKEN_FOR_HEX = {
  "#E5197F": "--pink", "#FF2D8A": "--pink-hot", "#B30E61": "--pink-deep",
  "#5A0830": "--pink-ink", "#14110F": "--ink", "#2A2622": "--ink-2",
  "#5C544C": "--ink-3", "#8A8077": "--ink-4", "#1F1B17": "--rule",
  "#F4EFE7": "--paper", "#EBE4D8": "--paper-2", "#DDD3C2": "--paper-3",
  "#FBF8F2": "--bone", "#221E1A": "--night-2", "#3A332D": "--night-3",
  "#D8CFC4": "--fg-on-ink-2", "#4A443E": "--rule-on-ink",
};

const defined = (css) => new Set([...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]));
const canon = defined(read("colors_and_type.css"));

for (const kit of KITS) {
  const css = read(kit);
  const local = defined(css);
  for (const [, tok] of css.matchAll(/var\(\s*(--[\w-]+)/g))
    if (!canon.has(tok) && !local.has(tok))
      errors.push(`${kit}: var(${tok}) resolves nowhere`);
  for (const [hex] of css.matchAll(/#[0-9a-fA-F]{6}\b/g)) {
    const tok = TOKEN_FOR_HEX[hex.toUpperCase()];
    errors.push(
      tok
        ? `${kit}: raw ${hex} — use var(${tok})`
        : `${kit}: raw ${hex} is off-palette — add a token or justify it`,
    );
  }
}

// Previews: dead stylesheet/image links and missing cards are silent breakage,
// because a broken card just renders blank in the Design System pane.
for (const f of readdirSync(join(ROOT, "preview")).filter((f) => f.endsWith(".html"))) {
  const p = join("preview", f);
  const html = read(p);
  if (!/<!--\s*@dsCard\b/.test(html)) errors.push(`${p}: no @dsCard marker`);
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    if (/^(https?:)?\/\//.test(ref)) continue;
    if (!existsSync(resolve(ROOT, dirname(p), ref))) errors.push(`${p}: dead ref ${ref}`);
  }
}

// --- advisory: shared-vocabulary drift between kits ---
const topLevelRules = (css) => {
  const out = new Map();
  const stripped = css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/@media[^{]*\{(?:[^{}]|\{[^{}]*\})*\}/g, "");
  for (const [, sel, body] of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const s = sel.trim();
    if (!/^\.[a-zA-Z][\w-]*$/.test(s) || out.has(s)) continue;
    out.set(s, new Set(body.split(";").map((d) => d.replace(/\s+/g, "").toLowerCase()).filter(Boolean)));
  }
  return out;
};
const byKit = KITS.map((k) => topLevelRules(read(k)));
const shared = [...byKit[0].keys()].filter((c) => byKit.every((m) => m.has(c)));
const drifted = shared.filter((c) => {
  const [a, b, d] = byKit.map((m) => [...m.get(c)].sort().join("|"));
  return !(a === b && b === d);
});

console.log(`tokens in canon        ${canon.size}`);
console.log(`shared classes         ${shared.length} (${drifted.length} drifted between kits)`);
if (drifted.length) console.log(`  drifted: ${drifted.join(", ")}`);

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}
console.log("\nOK");
