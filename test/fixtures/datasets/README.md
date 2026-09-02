# Test fixture — not a reference dataset

`data/datasets/` is gitignored on purpose: reference material is third-party
(site names, URLs, full-page screenshots) and is generated locally per category
by the `dataset-builder` agent.

That left CI with nothing to test. Five steps iterated `data/datasets/*/`, which
on a clean checkout expands to a literal unmatched glob, and three more called
`readdirSync("data/datasets")` or hardcoded the `longevityClinic` category — so
the suite either passed vacuously or crashed with ENOENT while the README
carried a green badge.

This directory holds the **text half** of one real dataset — `dataset.json` plus
one `design.md` per site, about 100 KB, no screenshots. It exists so the counting
assertions run against real measured data:

- the `light 9 | dark 1 -> LIGHT` background verdict, the count a rejected design
  got wrong by hand;
- `7` sites above 56px, the measurement that disproved a hand-written rule;
- `TEXT ALIGNMENT` staying `unknown` for all 10 notes — silence must stay silence.

If those numbers change because the fixture was edited, the tests are no longer
testing what they claim. Treat this data as frozen: regenerate the real dataset
in `data/datasets/` instead.
