---
description: Create a design (Figma or code) learning from the reference dataset + the webartist method
argument-hint: "[optional category]"
---

Start the **design-from-references** flow.

Invoke the `design-from-references` skill and follow its full procedure:
1. `Glob data/datasets/*/dataset.json` for the available categories. If the requested category is missing or thin → invoke the `dataset-builder` agent (online research) to build it.
2. **Ask for category + cluster** (from the dataset) — unless the user already provided it here: $ARGUMENTS
3. Read the research from the dataset (`data/datasets/<category>/dataset.json`) and **look at the source sites' screenshots**. REAL fonts and colours come from there.
4. **COUNT the references before fixing any direction (gate 2a, blocking).** Run both:
   - `node .claude/skills/design-from-references/scripts/datasetTally.js <category> [--cluster "…"]` — background lightness, free accent hue bands, slop-flagged fonts, type pairing, shared sections. Writes `<tmp>/<category>-constraints.md`.
   - `node .claude/skills/design-from-references/scripts/designNotesScan.js <category> [--quotes]` — hero composition, photography, headline size, stat blocks, press logos, read from the `design.md` notes. `unknown` means *go look at the screenshot*, never guess.

   Print the tally, then **follow the majority**. Overruling a verdict needs a stated reason and the user's agreement, recorded in the file's Deviations table.
5. Apply the **webartist** skill directives (light interview → research = dataset → traceable observed→applied table → plan → UX/WCAG/anti-slop checks → build → critique). Re-read the constraints file when fixing tokens and type.
6. Build the design (default: Figma via MCP, split across multiple pages; or code if requested) and verify with screenshots next to the references — passing `design-verifier` the constraints file path so the built screen is checked against the counted verdicts too.

Golden rule: every colour/type/structure choice must cite a dataset reference. Learn from the best, don't copy them — and when a choice contradicts the count, it needs a stated reason, not a feeling.
