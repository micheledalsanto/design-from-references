# PLAN + plan gates (3 → 3.9)

## 3. PLAN
**Before writing a single token: re-read `<tmp>/<category>-constraints.md`**
(written by `scripts/datasetTally.js` at gate 2a). Its verdicts are binding —
background lightness, accent hue free zones, type pairing, the sections that
must appear, and the by-eye rows you filled from the screenshots. The tally
exists because a design was once built on 1 reference out of 10 and rejected;
counting it and then not consulting it is the same failure with extra steps.
Every deviation goes in that file's Deviations table **with the user's
agreement**, before you build on it.

Tokens (4–6 colours with a role), typography, layout concept + wireframe, motion
language — each **traced to**: the observed reference *or* the creative thesis.
No sourceless line.
- **Fonts — two filters, both blocking.** A font must pass BOTH:
  1. **FROM DATA:** read the REAL `font-family` values from the dataset
     (`sites[].fonts` of the cluster: display/body/mono) and use THOSE. If one
     isn't available in Figma (`listAvailableFontsAsync`) pick the closest
     equivalent and **declare the substitution**. Inventing a font that is
     neither measured nor a declared equivalent = you're defaulting — go back
     to the data.
  2. **NOT SLOP:** *being measured does not clear a font.* IBM Plex was taken
     from a measured reference and rejected on sight. The tally's FONTS row
     flags the offenders (Inter, Poppins, DM Sans, Manrope, Figtree, Outfit,
     Sora, Space Grotesk, Geist, Satoshi, Playfair, Cormorant, Spectral, IBM
     Plex, Space/JetBrains Mono). These are **"needs a stated reason", not
     "never"**: 15 of the 70 references do use one (Inter on 10). The reason
     they lose by default is the other number — **60 of 70 carry a proprietary
     display face**. So pick from that *licensed* tier (Fruitiger, Financier
     Display, Canela, Signifier, Founders Grotesk, Goldenbook, Scto Grotesk…)
     or the nearest Figma-available equivalents, and say so.
  Also: **pair two families by default** rather than running headings, body and
  data off one superfamily — that flat neutrality reads as generated. It is a
  default, not a law: measured across the datasets it is **45 two-family vs 25
  single**, and single-family *wins* in corporate-website (6-4). Let the tally's
  TYPE PAIRING row decide for your cluster.
  **Propose 3 alternatives verified as available in Figma**, with the voice
  of each, and get agreement before propagating type through the system.
  → detail and the reasoning: `references/antiSlop.md`.
- **Colours (FROM DATA):** the CORE palette comes from the colours MEASURED in
  the dataset (`sites[].bg/colors/accent`). Every deviation must be **declared
  as an invention** with a reason — never a silent default. If the dataset
  palette is monotonous, extend it with `dataset-builder`, not with your taste.
  - **Base surface follows the tally's BACKGROUND verdict.** Light means light.
    This is the exact call that got a design deleted.
  - **Accent: take a FREE HUE ZONE.** The tally lists which 30° bands the
    references already occupy and which are free. Picking a crowded band gives
    you the category cliché (e.g. the terracotta 15–18° everyone in longevity
    uses); an empty band reads as the brand's own while staying native to the
    category. Say which zone you took and which you avoided.
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
- **Three ways to fill a slot, and generation is not the default.** A real
  photograph of a real place or person → `image-sourcer`. A pattern, mark,
  grain or UI mock → build it in Figma. **Generation** wins for abstract
  textures, editorial illustration in a stated style, conceptual imagery with
  no real referent, and products that do not exist yet — and it loses badly on
  faces and food, which read as fake. When generation is the answer, run
  **`/imagePrompts`**: it writes paste-ready prompts grounded in the counted
  verdicts (background lightness, the free hue bands, the PHOTOGRAPHY and PHOTO
  SUBJECT counts) rather than in your idea of what looks good, and it writes the
  `alt` text at the same time — because an `alt` added later by somebody else is
  how `alt="image"` happens.
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
**Start with the mechanical check, not with taste.** Re-open
`<tmp>/<category>-constraints.md` and walk the plan against it row by row:

| Check | Fails if |
| --- | --- |
| Base surface vs BACKGROUND verdict | plan is dark, tally says LIGHT (or vice versa) |
| Accent hue vs occupied bands | accent sits in a band 2+ references already own |
| Display/body vs slop list | either face is flagged, or both come from one superfamily |
| Sections vs SECTIONS ≥50% | a section the majority always ships is missing |
| Opening section | the page opens differently from the majority |
| Each by-eye row | plan contradicts a row you counted |
| Every contradiction above | not present in the Deviations table with user agreement |

Any unexplained failure → fix the plan, or go get agreement. Only then critique
by judgement: what looks generic? copied? weak hierarchy? not memorable?
confusing? hard to implement? Fix it. Then two tests:
- **One-Screen Test:** does the first screen communicate in 5s what the product
  is, why it's relevant, what the user can do, the atmosphere, what makes it
  different? If the hero is interchangeable with another product → redo the
  direction.
- **Memorable Detail Test:** which detail will the user remember? which element
  couldn't live in a template? No answer → add a signature.
