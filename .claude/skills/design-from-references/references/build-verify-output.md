# BUILD → Render verification → Score → Output (4 → 7.1)

## 4. BUILD — YOU create the product
Default is Figma via MCP (`figma-use` + `figma-generate-*`). The references are
aesthetics only.

**BUILD ORDER (mandatory — do NOT start from the screens):**
1. **Foundations** — tokens (colour/spacing/radius) + text styles **AND the
   VISUAL specimen** on the `📖 Foundations & Docs` page: colour swatches (chip +
   name + hex), type scale (a sample per text style), spacing/radius. Tokens are
   invisible: the page must **NOT be left empty** — it documents them visually.
2. **Components** — build the **library** on the `🧩 Components` page: Button,
   Nav, Field/Input, Dropdown, Table Row, Card, Footer… as **component sets
   with variants+states** (default/hover/focus/disabled, header/data, etc.).
   Lay them out **NEATLY**: a **grid/columns per category** (atoms / cards /
   chrome), **not** one long vertical column. NO overlaps (adequate gaps;
   components created in different calls can collide → reposition them by group).
   **Mandatory checks on the Components page:**
   - Every component must **HUG its content** (`primaryAxisSizingMode='AUTO'`,
     and for horizontal ones `counterAxisSizingMode='AUTO'`): **no `resize()`
     with a fixed height** that crops text/children (= "too-short/cropped
     frames"). `clipsContent` off on component containers.
   - **No "manual" text labels** next to the components: Figma already shows the
     component/variant name. Don't add decorative TEXT to the page.
   - After the layout: verify **overlap=0** (bounding boxes) **and** that every
     component contains its children (no child overflowing the frame).
   - **Re-verify after EVERY sizing fix:** changing the size of an
     already-placed component (typically: fixed size → hug) shifts the columns
     and can recreate overlap/clipping → re-lay out and re-run the check. The
     Components page check must be redone as the **LAST step**, after all fixes.
   - **RUN THE OVERLAP SCRIPT — do not eyeball it (blocking).** Screenshotting
     single nodes (`node.screenshot()`) will NEVER reveal page-level collisions:
     each node renders fine in isolation while sitting on top of its neighbour.
     You MUST run this on the Components page and get `overlaps: []`:
     ```js
     const page = figma.root.children.find(p=>p.name.includes("Components"));
     await figma.setCurrentPageAsync(page);
     const b = page.children.map(n=>({name:n.name,x:n.x,y:n.y,r:n.x+n.width,btm:n.y+n.height}));
     const overlaps=[];
     for(let i=0;i<b.length;i++)for(let j=i+1;j<b.length;j++){
       const A=b[i],B=b[j];
       if(A.x<B.r&&A.r>B.x&&A.y<B.btm&&A.btm>B.y) overlaps.push([A.name,B.name]);
     }
     return { overlaps, count: overlaps.length };
     ```
     Then take ONE `get_screenshot` of the whole Components **page node** and
     LOOK at it. Both checks, every time, before declaring the build done.
   - **Each variant of a set must show DIFFERENT representative content.** When
     you `clone()` a variant to add an axis, the clone carries the original's
     text: a 5-variant set all reading "ApoB 94" documents nothing. Give every
     variant its own realistic case.
3. **Screens** — COMPOSE the screens from component **INSTANCES**
   (`component.createInstance()`), NOT redrawing by hand what is already a
   component. Only the screen-specific scaffold (hero, header, signature) is
   built ad hoc; the rest are instances with text/variant overrides.
4. **Cover** — design the `📕 Cover` page as a **Community-style thumbnail**
   (≈1920×960): brand/wordmark + tagline + **REAL SCREEN EXTRACTS** + meta
   (cluster, screen count, desktop+mobile, accessibility). It's what shows in
   the file list/Community.
   - **Screen extracts are mandatory** (an abstract motif alone is NOT enough):
     `get_screenshot` on 2–3 built key sections (e.g. desktop hero, a product
     row, a mobile screen), download the PNGs into `tmp/qa/` (git-ignored —
     NEVER the repo root; see Tooling Notes), re-upload with `upload_assets`
     and place them as IMAGE fills on rects in the cover. Build the cover
     **AFTER the screens** so there is something real to extract.
   - `upload_assets` gotcha: the POST **response body** contains the
     `imageHash` — capture it and set the fill by hash yourself; don't rely on
     the fill appearing on the node, and delete the stray frames the upload
     places on the current page. `nodeId`-targeted uploads can't reach nodes
     inside instances (`I…;…` ids).
Building screens before components = the WRONG order: redo starting from the
components.

**No empty pages:** at the end of the build ALL pages must have content —
`📕 Cover`, `📖 Foundations & Docs` (token specimen + documentation/credits),
`🧩 Components`, `🖥 Screens`. An empty page = an incomplete build.

- **4a. Copy (parallel):** launch the `design-content` agent (multiple instances
  if useful) for realistic copy in the chosen language.
- **4b. Multiple screens** (the archetype's set), **composed from instances**.
  Desktop + mobile where sensible.
- **4c. File organized like the Community:** pages `📕 Cover ·
  📖 Foundations & Docs · 🧩 Components · 🖥 Screens` (+ `🌊 Flows` if needed).
  **Foundations and documentation live on ONE page** (token specimen +
  documentation/credits side by side).
- **4d. Figma Production Standards (mandatory):** Auto Layout wherever sensible;
  **readable layer naming** (never "Rectangle 42"); text styles + color
  variables + spacing/radius tokens; **component variants** with states;
  responsive constraints; components separated from instances; no messy groups.
  The file must be usable by a human designer after generation.
- **4e. UI States (mandatory):** for every interactive component at least
  default/hover/focus/active/disabled (+ error/success where relevant). For
  every data screen: loading / empty / populated.
- **4f. Responsive:** define the desktop grid, tablet/mobile behaviour,
  breakpoints, mobile nav (accessible hamburger), section reflow, type scaling,
  image handling, mobile CTA.
- **4g. Decision Register (state memory):** write the final tokens, styles and
  base components to a temp path of the current environment
  (`<tmp>/<project>-decisions.md` — see `dataset-tooling-agents.md`) and
  **re-read it before every new screen** (sequential writes: amnesia risk
  between screens).
- **4h. Sequential writes:** never `use_figma` in parallel (a single builder).
- **4i. Default-white-fill gotcha (recurring):** `figma.createFrame()` /
  `figma.createAutoLayout()` create frames with a **WHITE fill by default**. On
  a non-white page (paper/ink/surface) every forgotten container renders as a
  white card/band (seen on: footer inner columns, nav `links`, Foundations
  specimen cells). Set `fills = []` explicitly on EVERY structural container at
  creation; keep white only where intentional (inputs, chips). Before closing a
  page, sweep: `query('FRAME')` → clear pure-white SOLID fills that aren't by
  design.
- **Code** if requested: modern HTML+CSS, mobile-first, accessible, multi-page,
  with a **Motion Direction** (what animates, duration, easing, trigger,
  function, reduced-motion fallback) and a **Feasibility & Performance Gate**
  (buildable effects, optimizable images, mobile performance).

## 5. Render verification GATE (blocking, on the real output)
After every screen, launch the **`design-verifier`** agent (read-only, in
parallel per screen) with `fileKey`+`nodeId` (+ the absolute path of this
skill's `scripts/contrast.js`, + the reminder that screenshots are downloaded
to `tmp/qa/`, never the repo root). **Do NOT declare the screen
"done"/"ok" before the verifier PASSES**: wait for its verdict and resolve the
issues (writes stay sequential). Truncated text in a narrow rail or an
overflowing caption is NOT visible in a low-res screenshot — trust the
verifier, not your eye on the thumbnail. **Screenshot-verify EVERY built page,
not just the screens** — `📕 Cover`, `📖 Foundations & Docs` (specimen) and
`🧩 Components` suffer the same fixed-size crop. Look for the **known errors**:
1. **Frame height/width / clipping:** every auto-layout container must **HUG**
   its content (`primaryAxisSizingMode='AUTO'`, and the opposite axis
   `counterAxisSizingMode='AUTO'` for heights). **Recurring gotcha:**
   `resize(w,h)` on an auto-layout frame forces its sizing to **FIXED** → if
   `h` is small (e.g. 10) the frame **crops** its children. After every
   `resize()` re-assert `AUTO` on the axis that must grow (or use
   `layoutSizing*`), then **check via code** that every child fits inside its
   parent (bbox) before considering the page done.
2. **Component sizes:** no 0px nodes, no TEXT at ~0 width, no collapsed FILLs,
   no images without a real fill.
3. **Broken layout:** overflow past the edges, overlaps, broken alignment.
4. **Text:** truncated, line-height clipping the glyphs.
5. **Design QA:** global alignment, consistent padding, vertical rhythm, heading
   hierarchy, card/button consistency, small-text legibility, interactive states.
6. **Contrast** re-measured on the output (including text over images).

## 6. Final Design Score
Rate 1–5: Visual originality · Dataset coherence · Distance from references ·
UX clarity · Accessibility · Typographic quality · Responsive · Memorability ·
Content realism · Design-system scalability.
**Anchors (to reduce subjectivity):**
- *Originality*: 5 = clear signature, not traceable to a template; 3 = good but
  traceable to common patterns; 1 = generic/derivative.
- *UX clarity*: 5 = purpose and primary action obvious in 5s, zero ambiguity;
  3 = clear with some friction; 1 = confusing.
- *Accessibility*: 5 = everything AA measured + focus/target/reduced-motion;
  3 = AA on text but gaps; 1 = contrast failures.
**< 4 on Originality or UX clarity → iterate** (back to 2.5 or 3).

## 7. Final Output
Always deliver: the Figma/code link, the **creative thesis**, the references
used, the observed→applied table, the main tokens, the screens created, the
accessibility & UX checks, image/licensing notes, assumptions and limits.

## 7.1 Design System Output Spec (Standard+ / mandatory in Studio)
Document the system so it's **reusable** by a human, not just pretty: color
tokens · typography tokens · spacing scale · radius scale · shadows/elevation ·
grid · components · component variants · interaction states · motion tokens ·
**usage rules** · **anti-patterns**. In Figma it lives on the Foundations +
Components pages; in code as tokens + a README.
