# InsideTracker (blood-biomarker + DNA personalized health platform)

URL: https://www.insidetracker.com/

## Type system
- Display: `Montserrat, sans-serif` — H1 78px/700 (bold, geometric grotesk),
  H2 48px/600.
- Body: `"Open Sans", sans-serif` at 24px/400 for hero-scale body copy,
  scaling down for card/paragraph text — a humanist, highly legible
  workhorse sans distinct from the display face.
- No serif or mono; a bold-grotesk/humanist-sans pairing is the whole type
  system, standard SaaS convention but executed with real weight contrast
  (700 vs 400) for clear hierarchy.

## Color system
- bg: off-white/cream `#F9F9F7`, `#F3F1E8`, `#F8F8F8` — several near-white
  warm neutrals used across sections rather than pure white.
- text/dark: near-black `#262626`.
- accent (brand): green family — deep green `#005550` and bright
  action-green `#00A050`, used for every button and for positive
  data-highlight numbers (80%, 60%, 75% stat callouts).
- Secondary neutral: `#E7E4D3` (tan card background) and `#D9D9D9`-family
  greys.
- Hero background is a dark, desaturated photographic overlay behind white
  hero text, transitioning to the cream palette below the fold.

## Layout & grid
- Dark full-bleed photographic hero (out-of-focus nature/movement photo)
  with bold white headline "Track everything" plus a right-aligned rotating
  word list (Fitness / Nutrition / DNA / Blood / Sleep) printed in large
  ghost-outline type — a distinctive layered-hero device.
- Below the hero: a sticky-feeling secondary nav/newsletter bar, then
  content in a fairly standard 2-column feature layout (image left, list
  right) alternating with full-width stat bands and testimonial 3-up grids.

## Sections (order observed)
1. Dark full-bleed hero: "Track everything," ghost data-category list,
   green CTA
2. Press logo bar (WSJ, Forbes, CNN, Sports Illustrated, TODAY)
3. Newsletter signup strip
4. "Clear health advice, tailored to you" — real photo of a woman checking
   a phone, bullet list (Personalized action plans, Guided health support,
   InnerAge, Healthspan category scores, Weekly habit insights)
5. Stat callout row: "80% optimize at least one at-risk biomarker," "60%
   reduce InnerAge," "75% improve one Healthspan Category" — big green
   percentages as the primary data-trust device
6. "A complete picture of your health, fully in focus" — tan full-bleed
   photo section with an embedded phone mockup showing a circular score
   gauge ("67") and colour-coded (red/green) recommendation list
7. "Take it from our members" — 3-up testimonial cards with named,
   specific results ("LDL cholesterol dropped from 155 to 75")
8. "For Enterprises" — B2B stat band (>10 years, 2^400 combinations, >7K
   studies, >100K member lives) + peer-reviewed-study callout
9. Dark footer

## Components/signature
- The rotating ghost-type word list in the hero (ATT-grade animated
  category labels) is the strongest signature device — it visually lists
  every data source (Fitness/Nutrition/DNA/Blood/Sleep) without needing a
  chart.
- Phone-mockup dashboard showing a circular numeric score plus a
  red/yellow/green recommendation checklist — the clearest "biological
  age / health score" visualization pattern in the dataset.

## Motion/interactions
- Hero background photo likely has subtle parallax/motion (implied by the
  "everything moving" art direction); ghost word-list may animate/cycle.
- Standard scroll-reveal on stat and testimonial sections.

## Biomarker/trust presentation
- Uses a circular numeric score gauge (visible at "67" in the phone
  mockup) plus a simple red/green traffic-light system for
  recommendations — deliberately simplified vs. a raw lab report, framed
  in-copy as "not just a pass/fail" but with "rich graphs highlighting
  personal optimal zones."
- Large standalone percentage stats (80%/60%/75%) used as headline trust
  signals rather than clinician credentials or certification badges —
  trust here is quantitative/outcome-based, not authority-based.
- Testimonials cite specific before/after biomarker numbers (LDL 155→75)
  instead of generic praise.

## What works
- Green-as-health-and-growth accent (not blue-as-clinical) plus warm cream
  neutrals keeps the platform feeling more "coaching app" than "lab
  portal," while still being unmistakably data-driven.
- Outcome percentages as hero-level social proof are more persuasive than
  abstract claims, and reusable for any biomarker/health product.

## Avoid
- Bold 700-weight Montserrat at 78px can feel generic-SaaS if not paired
  with a genuinely distinctive secondary device (here, the ghost word-list
  hero); don't use the bold-grotesk-hero pattern alone.
- The red/yellow/green traffic-light simplification works for consumer
  trust but under-serves users who want to see the underlying numeric
  range — pair with a details/expand affordance if reusing.

## How to apply
- Build a hero around a short animated list of the data sources/inputs the
  product actually uses (blood, DNA, sleep, etc.) instead of a static
  headline alone.
- Use a simple circular score + traffic-light colour system for the
  "at a glance" health/age score, and reserve dense numeric tables for a
  secondary, expandable view.
