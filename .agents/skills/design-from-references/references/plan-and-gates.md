# PLAN + plan gates (3 → 3.9)

## 3. PLAN
Tokens (4–6 colours with a role), typography, layout concept + wireframe, motion
language — each **traced to**: the observed reference *or* the creative thesis.
No sourceless line.
- **Fonts (FROM DATA, not at random) — blocking:** read the REAL `font-family`
  values from the dataset (`sites[].fonts` of the cluster: display/body/mono).
  Use THOSE; if one isn't available in Figma (`listAvailableFontsAsync`) pick
  the closest equivalent and **declare the substitution**. Picking "default"
  fonts (Cormorant, Playfair, Inter, Spectral, Roboto Mono, Geist…) is
  **FORBIDDEN**: a font that isn't among the measured ones or a declared
  equivalent = you're defaulting — go back to the data.
- **Colours (FROM DATA):** the CORE palette comes from the colours MEASURED in
  the dataset (`sites[].bg/colors/accent`). Every deviation must be **declared
  as an invention** with a reason — never a silent default. If the dataset
  palette is monotonous, extend it with `dataset-builder`, not with your taste.
- **Evidence Quality:** for every dataset-observed decision mark the source
  quality — *High* (seen in several cluster sites or clearly measured) /
  *Medium* (a single site but cluster-consistent) / *Low* (subjective
  interpretation or ambiguous screenshot). The design's **core** choices cannot
  rest on Low evidence alone.
- **Visual Harmonization Gate:** does the font share the same "voice" as the
  colours and shapes? Any unintentional visual tension (Frankenstein effect
  from collaging 3 sites)? Harmonize.
- **Read the `design.md`** of the cluster sites
  (`data/datasets/<cat>/<site>/design.md`, field `sites[].design`) for the
  type/color/layout system, sections and "how to apply": they are the
  *reasoned* reference, not just numbers.

## 3.3 Information Architecture + User Journey
- IA: main message, content hierarchy, sections and their order, what sits
  above the fold, primary vs secondary, what to remove. Every section has a
  function: explain / prove / convert / reassure / navigate / compare / deepen.
- Journey: what they see → understand → explore → what convinces them → action.
  Every screen supports a phase. Archetypes per category (minimum screen set):
  *SaaS*: Landing, Features, Pricing, Login, Dashboard. *Agency/Portfolio*:
  Home, Work, Case study, About, Contact. *E-commerce*: Home, PLP, PDP, Cart,
  Checkout. *Restaurant*: Home, Menu, Booking, Story, Location. *Education*:
  Home, Course, Lesson, Quiz, Progress. *Mobile app*: Onboarding,
  Home/Dashboard, core flow (2–3 steps), Detail, Profile/Settings.

## 3.4 Component Strategy
Identify: base components, composites, concept-specific ones, variants,
**states**, reuse rules, linked tokens. Every important component is part of a
system.

## 3.5 Image Art Direction (NOT random images)
Random images make everything look "template". Before using any, define:
subject, framing, colour treatment, realism, **relationship to the thesis**,
what to avoid.
- **Prefer proprietary graphic elements** (abstract SVGs, geometric patterns,
  custom shapes, background noise/grain, built UI mocks) over stock photos:
  often more innovative.
- If real photos are needed: invoke the **`image-sourcer`** agent (search +
  fetch, NO API key, NO random images) — it finds **relevant** photos on
  Unsplash/Pexels by keyword, extracts the direct URL and downloads them. Then
  upload them onto the node with the MCP tool **`upload_assets`**
  (`figma.createImageAsync` is NOT supported in use_figma) and apply a
  **consistent treatment** (grayscale/duotone/crop/overlay) — never raw. (For
  B&W in Figma: set `filters.saturation = -1` on the image paint.) Report the
  **attribution** (author/platform) in the docs section of
  `📖 Foundations & Docs`.
- **FREE images only:** if the direct URL resolves to `plus.unsplash.com`
  (Unsplash+ **premium**), do NOT use it → pick a free alternative
  (`images.unsplash.com` / `images.pexels.com`).
- **Verify images BY EYE (blocking):** after applying the photos, a
  **screenshot** must show EVERY image rendered. An `IMAGE` fill with a broken
  hash (failed upload, file >~5 MB, premium source) passes the "is the fill
  IMAGE?" check but renders **empty** → you need eyes on the screenshot.
  Re-apply the empty slots.
- Licensing: save the source, a descriptive `alt`, avoid real faces unless the
  content needs them, every image has a narrative/compositional function.

## 3.6 Accessibility GATE (blocking, on the plan)
Measure every text/background pair:
`node <skill root>/scripts/contrast.js "#fg:#bg" ...`
(`<skill root>` = the directory this skill was loaded from — in a project
checkout `.claude/skills/design-from-references`, in a plugin install the
plugin's copy.)
Text ≥ 4.5:1; large (≥24px or ≥18.66 bold)/UI/borders ≥ 3:1. If a measured
accent fails as text (typical blue/purple on black), do NOT use it for text:
derive a readable variant and keep the "true" accent for fills/lines/large
shapes. Follow the rest of `webartist/references/wcag-checklist.md` (focus,
target size, semantics, alt, reduced-motion).

## 3.7 UX GATE (blocking, on the plan)
`webartist/references/ux-laws.md`: hierarchy (one protagonist per view),
primary actions evident and consistent (Fitts/Jakob), controlled cognitive load
(Hick/Miller), feedback and states. Note how the plan satisfies them.

## 3.8 Content Realism Gate (+ language)
Specific, credible, contextual copy in the chosen language. **Avoid** vague
phrases, interchangeable slogans, buzzwords, generic CTAs, invented metrics
without context. **Prefer** concrete benefits, useful microcopy, realistic
examples, precise labels, data marked as *sample* if not real. (Copy generated
in parallel by the `design-content` agent.)
- **ONE language in the file (blocking):** ALL text *inside the deliverable* —
  screens, **docs page**, Foundations specimen, component labels,
  notes/credits — is in the chosen language. **Never mix** (e.g. IT/EN). The
  working language in chat with the user is separate: don't let it leak into
  the file. Re-read the texts before closing and fix every off-language sentence.

## 3.9 Internal Critic Pass (blocking)
Brutally critique the plan *before* building: what looks generic? copied? weak
hierarchy? not memorable? confusing? hard to implement? Fix it. Then two tests:
- **One-Screen Test:** does the first screen communicate in 5s what the product
  is, why it's relevant, what the user can do, the atmosphere, what makes it
  different? If the hero is interchangeable with another product → redo the
  direction.
- **Memorable Detail Test:** which detail will the user remember? which element
  couldn't live in a template? No answer → add a signature.
