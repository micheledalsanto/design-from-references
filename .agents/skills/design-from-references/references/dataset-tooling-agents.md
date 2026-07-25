# Dataset, Agents, Robustness, Tooling, Templates

## Dataset & categories (gate 0)
`Glob data/datasets/*/dataset.json` → the available categories are the datasets
present. If the project has none, sample datasets ship at the repo/plugin root
(`<skill root>/../../../data/datasets/`, text only — no screenshots): use them
in place or copy the category into the project. If the requested category has
no dataset (or it's thin/monotonous/stale) → invoke the **`dataset-builder`**
agent to build it with online research, then proceed. Don't invent references.

**Dataset — expected shape** (`data/datasets/<category-slug>/dataset.json`,
written by `dataset-builder`; if a field is missing degrade gracefully, don't
hallucinate):
```
{ category, researchedAt,
  sites:[{ url, slug,
           screenshots:{desktop, mobile},   // paths relative to the category folder
           design,                          // <site>/design.md — usable analysis
           fonts:{display,body,mono}, colors:[#…], bg:#…, accent:#…,
           structure:[…], mood:[…], whatWorks, avoid }],
  clusters:[{ label, memberUrls:[…], summary }] }
```
On-disk structure: `data/datasets/<cat>/dataset.json` +
`data/datasets/<cat>/<site>/{desktop.png, mobile.png, design.md}`.
→ **`fonts`/`colors` are REAL values measured online: USE THEM (see PLAN),
don't pick at random.** **Look at the full-page screenshots (desktop+mobile)
and read the `design.md` files** for composition and "how to apply". If the
file is thin/monotonous, extend it with `dataset-builder`.

## Agent Contracts
What the parallel agents must return (defined in `.claude/agents/`):
- **`design-content`** — for EVERY screen: headline, subheadline, CTA,
  microcopy, labels, empty/error/success states, and all the screen's copy;
  tone consistent with the brand positioning; in the brief's language; never
  buzzwords/lorem.
- **`design-verifier`** (read-only) — checks: frame clipping/height, contrast,
  layout/overflow, hierarchy, **component states**, responsive, **excessive
  similarity to the references**, **presence of the signature element**.
  Reports PASS/FAIL with nodeIds and fixes; doesn't modify Figma.
- **`image-sourcer`** — relevant real photos via search+fetch (no API key);
  returns `localPath`, `sourceUrl`, `author`, `platform`, `alt`, `treatment`.
  Doesn't touch Figma.
- **`dataset-builder`** — online research, full-page desktop+mobile screenshots,
  a `design.md` per site, writes `data/datasets/<cat>/dataset.json`.

## Robustness (unhappy paths & iterations)
- **Dataset still thin after `dataset-builder`:** warn the user and explicitly
  declare more invention (don't hallucinate "measured" fonts/colours).
- **Figma MCP dies mid-build:** `use_figma` calls are atomic; resume from the
  real state (`get_metadata`) and the Decision Register, not from memory.
- **Revision Strategy (post-delivery):** classify the change and intervene at
  the right level, without redoing everything:
  - *Surface* (colour/font/spacing/copy) → edit tokens/components.
  - *Structural* (new sections/IA/flow) → back to IA + Journey (3.3).
  - *Concept* (metaphor/tone/target) → back to the Originality Engine (2.5).
  - *Dataset* (category/cluster) → restart from Research (2).
  Always update the Decision Register.

## Output Templates
**Strategic Brief:** `Brand · Category/Cluster · Deliverable · Language ·
Audience · Goal · Primary action · Success metric · Archetype · 5s-takeaway ·
Avoid`

**Creative Thesis:** mandatory format in `originality-engine.md` (item 1).

**Territory (×3):** `Name · Metaphor · From references · What it breaks · Image
treatment · Type mood · Risk · Why memorable` → then the justified choice.

**Observed → Applied (table):**
`| Observed evidence | Source (site) | Evidence quality (H/M/L) | Applied decision | Reason |`

**Final Score:** one line per dimension `Dim: n/5`, then the verdict (iterate
if <4 on Originality/UX clarity).

## Tooling Notes
The technique lives here, separate from the method (it can change without
touching the creative framework).

**Temp path (portable):** Windows `c:/tmp/<project>-decisions.md`, Unix/Mac
`/tmp/<project>-decisions.md`. Use whichever exists in the current environment.

**QA screenshots & temp downloads (git hygiene):** every PNG downloaded during
build/verification (`get_screenshot` renders, cover extracts, QA checks) goes
in **`tmp/qa/` at the repo root** (git-ignored; `mkdir -p tmp/qa` first) or in
the session scratchpad. NEVER download into the repo root or any tracked
folder: stray `qa_*.png` / `*_check.png` files pollute `git status`. Pass this
rule along when launching `design-verifier`.

**Figma (MCP):**
- `use_figma` never in parallel (a single builder). Load `figma-use` first.
- `figma.createImageAsync` is NOT supported in `use_figma` → use the MCP tool
  **`upload_assets`** (with `nodeId`): download the bytes with `curl -L`, then
  POST them to the `submitUrl` with the correct `Content-Type`. For B&W:
  `fills[0].filters.saturation=-1`.
- Anti-clipping: after adding the children, set `primaryAxisSizingMode='AUTO'`
  on the root (a `resize(w,900)` leaves it fixed).

**Contrast audit:** `node <skill root>/scripts/contrast.js "#fg:#bg" ...`
(exit 1 if at least one pair FAILs). When launching `design-verifier`, pass it
the script's absolute path.
