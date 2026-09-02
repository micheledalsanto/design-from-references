# Contributing

Thanks for your interest! The most valuable thing you can contribute is a
**reference dataset for a new category** — every category makes the system
useful to more people.

## Contribute a dataset (the flywheel 🎡)

A dataset teaches the system the *measured* aesthetics of a category
(restaurants, portfolios, SaaS, fintech apps…). To contribute one:

1. Clone the repo, open it in [Claude Code](https://claude.com/claude-code) and run:

   ```text
   "Use the dataset-builder agent for the '<your category>' category"
   ```

   The agent researches real award-winning/acclaimed sites, measures their
   fonts and colours via `getComputedStyle`, and writes
   `data/datasets/<category-slug>/` with a `dataset.json` index plus a
   `design.md` analysis per site.

2. **Review the output before opening a PR:**
   - 6–8 real sites, with at least 1–2 that break the category stereotype
     (no monotonous datasets);
   - fonts/colours are actually measured, not guessed;
   - each `design.md` has usable "How to apply" notes;
   - 2–3 style clusters with meaningful labels.

3. Open a PR with **`dataset.json` + the `design.md` files only**.
   Screenshots (`*.png`) are heavy full-page captures of third-party sites and
   don't belong in the repo. Anyone can regenerate them locally with
   `dataset-builder`.

   > **Heads up — you have to force-add them.** `.gitignore` currently excludes
   > the whole of `/data/datasets/`, not just the images, so following the
   > instruction above as written produces an empty PR and git says nothing.
   > Until that rule is narrowed, add the text files explicitly:
   >
   > ```bash
   > git add -f data/datasets/<category>/dataset.json \
   >            data/datasets/<category>/*/design.md
   > ```
   >
   > Check what you actually staged with `git status` before pushing.

Category slug convention: single word or camelCase (e.g. `fintechApps`), no
hyphens where avoidable.

## Contribute to the skills/agents

- The orchestrator lives in `.claude/skills/design-from-references/` (lean
  `SKILL.md` + on-demand `references/`); the design method in
  `.claude/skills/webartist/`; the parallel agents in `.claude/agents/`.
- Keep the split: **method** (what to think about) vs **tooling notes** (how
  to call Figma/MCP). State each rule once — link, don't repeat.
- Skill/agent content is English; keep any user-facing trigger phrases in the
  frontmatter `description` intact.
- If you touch `scripts/contrast.js`, run the checks locally:

  ```bash
  node .claude/skills/design-from-references/scripts/contrast.js "#fff:#000"   # exit 0
  node .claude/skills/design-from-references/scripts/contrast.js "#777:#999"   # exit 1
  node .claude/skills/design-from-references/scripts/contrast.js "nope"        # exit 2
  ```

  CI runs the same assertions plus JSON validation on every PR.

- If you touch `datasetTally.js` or `designNotesScan.js`, run them against the
  committed fixture — that is what CI does:

  ```bash
  node .claude/skills/design-from-references/scripts/datasetTally.js \
    longevityClinic --dataset-root test/fixtures/datasets
  node .claude/skills/design-from-references/scripts/designNotesScan.js \
    longevityClinic --dataset-root test/fixtures/datasets
  ```

  `test/fixtures/datasets/` holds the text half of one real dataset (no
  screenshots, ~100 KB) so the counting assertions run against measured data.
  It exists because `data/datasets/` is gitignored, which used to leave those
  CI steps either iterating an empty glob or crashing on a missing directory.
  **Treat the fixture as frozen**: three CI assertions pin exact numbers from
  it (`light 9 | dark 1`, 7 sites above 56px, alignment `unknown` for all 10).
  Editing it to make a test pass removes the reason the test exists.

## Reporting issues

Real run reports are gold: which gate slowed you down, where the output was
still generic, where the dataset was too thin. Include the category, the mode
(Fast/Standard/Studio) and, if possible, a screenshot of the result.
