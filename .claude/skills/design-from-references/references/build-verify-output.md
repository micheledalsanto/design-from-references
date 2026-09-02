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
skill's `scripts/contrast.js`, + **the absolute path of
`<tmp>/<category>-constraints.md`** so it can check the built screen against
the counted verdicts, + the reminder that screenshots are downloaded to
`tmp/qa/`, never the repo root). **Do NOT declare the screen
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
2a. **Squashed circles and squares — `layoutMode` set AFTER `resize()`.** A dot
   created with `resize(26,26)` and then given `layoutMode='HORIZONTAL'` to
   centre a numeral inside it collapses to **8x26**: the width hugs the glyph
   and the `cornerRadius` turns it into an oval. Hit twice on the same project
   (`stepDot`, `confirmMark`). Correct order: set `layoutMode`, then
   `layoutSizingHorizontal='FIXED'` + `layoutSizingVertical='FIXED'`, then
   `resize()`, then **re-assert both FIXED** because resize resets them, plus
   `layoutGrow=0` when the parent is auto-layout.
2b. **A fixed-width component set to FILL on mobile gets crushed.** A 560px
   `stepIndicator` dropped into a 350px column squeezes every child. Use
   `layoutSizingHorizontal='HUG'` on the instance and shrink the connectors for
   the narrow variant instead.
3. **Broken layout:** overflow past the edges, overlaps, broken alignment.
4. **Text:** truncated, line-height clipping the glyphs.
5. **Design QA:** global alignment, consistent padding, vertical rhythm, heading
   hierarchy, card/button consistency, small-text legibility, interactive states.
6. **Contrast** re-measured on the output (including text over images).
7. **Frame padding and empty pages** — the finishing checks the user has asked
   for twice. Every auto-layout frame with an edge under 16px is a finding, and
   a `COMPONENT_SET` counts: pad the set AND offset its variants, or they sit
   flush against the border. Every page must hold something. See §7.2, which
   applies to a single component file exactly as it does to a 23 screen one.
8. **The states exist — check, do not assume.** The build step above already
   prescribes default/hover/focus/active/disabled and loading/empty/populated;
   nothing has ever verified they were built. The public critique of AI design
   names these as "absent or improvised late" more often than it names any
   colour. For every interactive component assert the variant set actually
   carries **hover, focus and disabled**, and for every screen that displays
   fetched data assert an **empty** and a **loading** state exists somewhere in
   the file. A missing focus variant is a finding, not a nice-to-have: it is
   the one state a keyboard user lives in.
9. **Geometry uniformity — the tell no script here counts yet.** "Identical
   padding, identical border radius, identical card heights" is the most cited
   non-typographic marker of generated design. Sweep the file and list the
   distinct values actually used:
   ```js
   // report the distinct radii, paddings and shadow recipes in the file
   const radii = new Set(), pads = new Set(), shadows = new Set();
   // …walk nodes, add cornerRadius, paddingLeft, JSON.stringify(effects)
   ```
   One radius and one padding across every surface is a finding **unless the
   references counted in gate 2a genuinely do that** — some systems are
   deliberately uniform. The question to answer is not "is it consistent" but
   "did anyone decide this". Shadows get the stricter rule: a different recipe
   per component means elevation carries no meaning, and flat or borderless is
   the safer default.

10. **WebP uploads succeed and then render as flat grey.** `upload_assets`
   accepts `image/webp`, returns `success` with the right `sizeBytes`, and
   `getBytesAsync` reads every byte back — and the node still renders as a flat
   fill. Two image generators return WebP by default, so this is easy to hit.
   **Convert to PNG before uploading**, and confirm by sampling pixels from the
   render rather than by trusting the upload response:
   ```python
   from PIL import Image
   Image.open('x.webp').convert('RGB').save('x.png', 'PNG')
   ```
   This is the sharpest possible case of the rule that an `IMAGE` fill can pass
   every structural check and still show nothing.
11. **A prototype has to be true, not just clickable.** The first wiring here
   ran from a screen with two visible errors straight to the confirmation, on a
   click of the submit button — a flow asserting that an invalid form submits,
   inside a kit whose entire argument is that it must not. The user caught it:
   *"non ha senso, attualmente il prototipo fa cliccare anche se i campi non
   sono validi"*. Wire the flow the design is arguing for: on the rejected
   screen the **summary link** is what advances (that is what the component is
   for), the submit button is deliberately **dead**, and submission only
   reaches success from a screen whose fields are actually valid. Also clone
   screens **after** their images are placed, or the copy keeps an empty slot.

**Sweep the whole file with a script, not with your eye.** Screenshots catch
what you happen to look at; a script catches what you do not. Run one read-only
`use_figma` pass across every page that flags:
- circles that stopped being round — `cornerRadius*2 >= max(w,h)` but
  `|w - h| > 1.5`, **restricted to leaf nodes**: containers named `swatches` or
  `menuIcon` are legitimately rectangular and produced 39 false positives out
  of 41 on the first run;
- TEXT under ~40px wide holding more than a dozen characters (collapsed
  thread);
- image frames with an extreme aspect ratio (squeezed photography);
- any child wider than a parent that clips;
- mobile tap targets under 44px.
Then resolve each hit **by opening the screenshot**, never by trusting the
flag. The same pass also surfaced a contrast failure the token audit had
missed, because a kicker sat over a light patch of a photograph where the
scrim was too weak: the script was right for the wrong reason, and only the
render showed why.

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

## 7.2 File structure — the part reviewers judge before the design

**This section applies to EVERY Figma deliverable, including a single component.**
A one component file is still opened, scrolled and judged as an object. The user
has asked for these three things separately on separate projects, which is two
times too many:

> *"sistema i padding nei frame delle pagine, non lasciare pagine vuote,
> prepara la cover"*

Treat the following as the definition of done for any file you create, whether
it holds 23 screens or one variant set.

### The three that keep being missed

1. **Every frame gets padding.** A top level frame with `paddingLeft: 0` puts
   content against the canvas edge and reads as unfinished. Give screens at
   least 64 to 80 horizontal, documentation boards 64 to 72 all round, and
   component cards 40 to 48. **A `COMPONENT_SET` needs padding too** — variants
   are absolutely positioned inside it and will sit flush against its border
   unless you both pad the set and offset the variants by that padding.
   Verify by script, not by eye:
   ```js
   // any auto-layout frame with an edge under 16px is a finding
   const pads=[f.paddingTop,f.paddingRight,f.paddingBottom,f.paddingLeft];
   if (pads.some(v => !v || v < 16)) report(f.name, pads);
   ```
2. **No empty pages ship.** Divider pages named `──  something` are only worth
   their emptiness in a file large enough to need grouping. In a file of five
   pages or fewer, delete them. Any page that is *meant* to hold content and
   does not — a Foundations page with no palette, a Components page you never
   filled — is an unfinished file, not a structural choice.
3. **The cover is part of the deliverable, not an extra.** Build it at
   **1920x960** from a **real extract of the built work**: screenshot the node,
   `upload_assets`, set the returned `imageHash` as a fill. For a single
   component, the cover still earns its place — show the component large, and
   state what it is, how many variants it carries, and the one idea behind it.

### Minimum page set by deliverable size

| Deliverable | Pages |
| --- | --- |
| One component | Cover · Foundations · Components · Prototype (if wired) |
| A screen or two | the above plus one page per screen group |
| A full system | add dividers, Desktop and Mobile split |

Foundations is not optional even for one component: it is where the counted
evidence lives, and it is the page that proves the design was measured rather
than styled.



A design file is read as an object before any screen is opened. These are not
cosmetics; each one was requested by the user after being found missing.

**Page names carry the work.** Flat lowercase names read as scaffolding. Use
emoji plus spacing plus empty divider pages, the way the most viewed Community
files do:
```
🚲  BrandName
──  design system
◆  Foundations
◇  Components
──  screens
🖥  Desktop
📱  Mobile
```
The two `──` pages are deliberately empty separators. Mention them in the
publication checklist so nobody mistakes them for unfinished work. Emoji and box
drawing characters are not the banned dash: the ban is on a dash used as a
pause, and on kebab-case inside names.

**A Cover page is part of the deliverable, not an extra.** Build it at
**1920x960**, the Community thumbnail ratio. It must use **real extracts of the
built screens** — screenshot the node, `upload_assets`, set the returned
`imageHash` as a fill — never a mock. Watch one trap: an extract of the hero
still contains the hero headline, and a cropped headline fights the cover title.
Use the underlying photograph plus two floating screen extracts instead.

**Documentation pages need containment, not just alignment.** Placing labels
and components at computed coordinates *looks* right and is structurally wrong:
moving the card leaves the component behind. Every documented component must sit
**inside** an auto-layout card that also holds its name and a one line
description, and the cards must sit inside a per-column auto-layout stack. After
the restructure the Components page went from 60 loose nodes to 2.

**Count the frame name band.** Figma draws each frame's name in ~12px directly
above its top edge, and that band overlaps whatever sits there. A label 18px
above a component collides with it. Reserve ~26px — the reliable way is a real
spacer node inside the layout, not a remembered margin.

**Moving a master does not break its instances.** Verified on 161 instances
across 14 masters: zero broken links after reparenting every master into a card.
Still, count instances per master before and after any structural move and
compare, rather than assuming.

## 7.3 Publishing to the Figma Community

Two commands in this repo cover it: `/publish-data` for the dialog fields and
`/publish-screenshots` for the carousel. Two things learned the hard way:

- **Never hard wrap the description.** Wrapping at 72 columns for tidy markdown
  puts a real line break into Figma's field for every newline, and the text
  arrives ragged. One unbroken line per paragraph, blank line between
  paragraphs, plain capitals for internal headings. Ship the long fields as
  `name.txt` / `description.txt` / `tags.txt` so the user pastes plain text.
- **Carousel images are 1920x960.** Screens 4000px tall cannot be exported raw.
  Compose each slide into a 2:1 presentation frame, scale to the frame width and
  crop at the fold rather than squashing, then delete every temporary node. When
  several phones share a slide, give them **one shared scale factor** — scaling
  each by its own height produced four different sizes and clipped the last one.
