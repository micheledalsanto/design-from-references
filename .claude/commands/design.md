---
description: Create a design (Figma or code) learning from the reference dataset + the webartist method
argument-hint: "[optional category]"
---

Start the **design-from-references** flow.

Invoke the `design-from-references` skill and follow its full procedure:
1. `Glob data/datasets/*/dataset.json` for the available categories. If the requested category is missing or thin → invoke the `dataset-builder` agent (online research) to build it.
2. **Ask for category + cluster** (from the dataset) — unless the user already provided it here: $ARGUMENTS
3. Read the research from the dataset (`data/datasets/<category>/dataset.json`) and **look at the source sites' screenshots**. REAL fonts and colours come from there.
4. Apply the **webartist** skill directives (light interview → research = dataset → traceable observed→applied table → plan → UX/WCAG/anti-slop checks → build → critique).
5. Build the design (default: Figma via MCP, split across multiple pages; or code if requested) and verify with screenshots next to the references.

Golden rule: every colour/type/structure choice must cite a dataset reference. Learn from the best, don't copy them.
