# Originality Engine (gate 2.5 — blocking, the heart)

Before the full visual plan, complete ALL of these points. Show Thesis +
Territories + your choice to the user before building.

**Write the answers to `<tmp>/originality.json` and run the gate** — the shape
below maps one-to-one onto the six points:

```json
{
  "thesis": "This interface is built around the idea of …, expressed through …, to make users understand …",
  "territories": [
    { "name": "…", "concept": "…", "breaks": "what it BREAKS versus the references" }
  ],
  "chosen": "<one of the territory names>",
  "chosenBecause": "…",
  "antiCopyDistance": ["hero composition", "section rhythm", "typographic hierarchy"],
  "signature": { "name": "…", "description": "…" },
  "defaults": [{ "default": "gradient hero", "replacedWith": "…" }],
  "ruleBreak": "the single controlled rule-break"
}
```

```
node <skill root>/scripts/originalityCheck.js --file <tmp>/originality.json --mode standard
```

`antiCopyDistance` accepts only the seven dimensions in §3 — free text there
would let "it just feels different" count as distance. The gate checks that
the work was **done**, never that it was **good**: that judgement is the
user's, so showing them is still mandatory.

1. **Creative Thesis** (1 sentence, mandatory format):
   *"This interface is built around the idea of [concept], expressed through
   [visual system], to make users feel/understand [effect]."*
   It must be able to belong only to THIS brand.
2. **Three Creative Territories** — 3 distinct directions; for each: concept +
   visual metaphor, what it takes from the references, **what it breaks**,
   image treatment, type mood, risk, why it's memorable. **Pick one** and
   justify the choice.
3. **Anti-Copy Distance** — the chosen direction must differ from the references
   in ≥3 dimensions among: hero composition, section rhythm, visual metaphor,
   navigation logic, image treatment, signature interaction, typographic
   hierarchy. If it recalls a single reference too closely → back to the
   Territories.
4. **Signature Element** (mandatory) — a proprietary element recognizable even
   without the logo, derived from the thesis, applicable across screens (visual
   grammar / motion pattern / layout mechanic / custom component / interaction
   ritual). NOT valid: a generic gradient, rounded cards, a big font, a stock
   hero.
5. **Make It Less Expected** — list 5 choices an AI would default to for this
   category (e.g. gradient hero, huge centered headline, floating dashboard,
   blue CTA, alternating image/text sections) and **replace ≥3** with more
   distinctive *but usable* alternatives. Plus a single intentional
   **Controlled Rule-Break** that improves memorability/comprehension (not
   decorative). If the break turns out **odd or confusing** (it fails the
   One-Screen test or the UX>Originality Gate Priority), **discard it**:
   distinctive ≠ bizarre. (E.g. a vertical-index nav can feel "odd" if it isn't
   crystal clear — verify it, or use a conventional nav plus another signature.)
6. **Trend Filter** — don't use a visual trend just because it's popular. Every
   trend must be coherent with the thesis, useful to the UX, differentiated in
   execution, sustainable over time. If a choice feels "Awwwards generic 2026"
   (festival genericity, not SaaS-template genericity), transform it.
