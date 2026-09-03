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

3. **Share it in an issue, not a PR.** `/data/datasets/` is gitignored in
   full, deliberately: a dataset is a set of third-party site names, URLs and
   measurements, and this repo does not redistribute them. Open an issue
   titled `dataset: <category>` and attach `dataset.json` plus the `design.md`
   files as a zip. Leave the screenshots out — they are heavy full-page
   captures of other people's sites, and anyone can regenerate them locally
   with `dataset-builder`.

   What that gets you: the category gets reviewed, the recipe gets discussed,
   and useful measurements can be folded into the skills' rules. What it will
   not do is add your dataset to the repo, because nothing ships bundled —
   every user builds the categories they need locally.

   > The one exception is `test/fixtures/datasets/`, force-added on purpose so
   > CI has measured data to count against. It is one category, text only, and
   > it is frozen. See "Run the tests" below.

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
- The `nameGate.js` hook in `.claude/hooks/` blocks `create_new_file` when a
  Figma file name carries an AI tell. It must **fail open** on every error
  path: a hook that wedges the tool is worse than one that misses a bad name.

## Run the tests

One command, no dependencies, Node 20+:

```bash
npm test
```

That is exactly what CI runs — `.github/workflows/ci.yml` is now four lines
that call it. Run it before you push; the assertions used to live inline in
the workflow, which meant nobody could run them locally and a YAML edit broke
the quoting without anyone noticing.

`test/fixtures/datasets/` holds the text half of one real dataset (no
screenshots, ~100 KB) so the counting assertions run against measured data. It
exists because `data/datasets/` is gitignored, which used to leave those CI
steps either iterating an empty glob or crashing on a missing directory.

**Treat the fixture as frozen.** Several assertions pin exact numbers from it
(`light 9 | dark 1`, 7 sites above 56px, alignment `unknown` for all 10,
`SURFACE TREATMENT` stated exactly once). Each number is a mistake this repo
actually made: a design built on the 1 dark reference out of 10, a
hand-written ">56px is slop" ban the measurement disproved, a loose regex that
turned 2 into 7. Editing the fixture to make a test pass removes the reason
the test exists — fix the script instead.

## Reporting issues

Real run reports are gold: which gate slowed you down, where the output was
still generic, where the dataset was too thin. Include the category, the mode
(Fast/Standard/Studio) and, if possible, a screenshot of the result.
