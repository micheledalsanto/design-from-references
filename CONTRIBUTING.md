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
   Screenshots (`*.png`) are gitignored on purpose — they're heavy and
   full-page captures of third-party sites don't belong in the repo. Anyone
   can regenerate them locally with `dataset-builder`.

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

## Reporting issues

Real run reports are gold: which gate slowed you down, where the output was
still generic, where the dataset was too thin. Include the category, the mode
(Fast/Standard/Studio) and, if possible, a screenshot of the result.
