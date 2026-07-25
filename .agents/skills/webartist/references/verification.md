# Verification protocol

Don't declare work done by asserting it — verify it, and prefer measurement over
eyeballing. If a browser/automation tool is available (Playwright, a headless
browser, devtools), run these checks against the rendered page. If not, reason
through them explicitly and say what you could not verify.

## 1. Contrast — measured, not assumed
Run an automated contrast pass over every text/background pair (script below).
The catch most checkers miss: **text over images or video**. A DOM-only checker
falls back to the nearest `background-color` and is blind to the actual photo
behind the text — so it will happily pass white text that sits over a bright
sky. For text over media you must either:
- **measure the real pixels** behind the text (sample the rendered image,
  composite any scrim/overlay, take the worst-case/lightest pixel), or
- **guarantee** contrast structurally with a sufficiently opaque scrim or a
  solid/near-solid text plate, so the result is independent of the image.

Also verify the accent color in **both** contexts: a saturated accent that's
fine on light backgrounds (dark-blue on paper) often fails on dark backgrounds
(dark-blue on near-black). Keep a two-tone accent — one tuned for light, one for
dark — and check each.

## 2. Responsive — at real breakpoints, and actually operate it
Resize to ~360–390px (mobile), ~768px (tablet), ~1280–1440px (desktop). Confirm:
no horizontal scroll at 320px, fluid type doesn't clip or break words mid-word,
grids stack sensibly, tap targets ≥ 24px (prefer 44px). **Don't just screenshot
the static page — click the mobile menu open and shut.** Confirm the overlay
covers the *full viewport* (not cramped at the top — see the fixed-overlay
containing-block gotcha in `components.md`), that links are reachable, `Esc` and
the close button work, and focus returns to the toggle. Saying "it's responsive"
or "the menu works" without opening it at mobile width is how these break in
production — verify by operating it, not by asserting.

## 3. Keyboard & focus
Tab through the whole page: focus is always visible, order is logical, nothing is
trapped (except intentionally in an open modal), the skip link works, the mobile
menu is operable and `Esc` closes it.

## 4. Reduced motion
Toggle `prefers-reduced-motion: reduce` and confirm animations are disabled or
calmed and nothing depends on motion to be usable.

## 5. Motion design
If the page uses animation, scroll reveals, parallax, canvas/WebGL, route
transitions, hover effects, or micro-interactions, operate the motion instead of
only reading the code:

- trigger each motion path with pointer, keyboard/focus, click, scroll, and
  resize where relevant;
- confirm motion communicates orientation, feedback, reveal, or brand memory,
  rather than decorating every element uniformly;
- confirm no essential content stays hidden before animation or becomes
  reachable only by hover;
- confirm animated states do not create overflow, layout shift, clipped text, or
  mismatched repeated controls;
- emulate `prefers-reduced-motion: reduce` and verify a static or simplified
  equivalent;
- for canvas/WebGL/Three.js, verify the rendered pixels are nonblank, framed
  correctly, and not required to understand the page.

## 6. Structure & content
One `<h1>`, correct heading outline, landmarks present, every image has correct
`alt`, every input has a real label, `lang` matches the content language, titles
and meta/OG present per page.

## 7. Repeated component consistency
For repeated UI such as pricing cards, product cards, feature rows, dashboard
tiles, or form actions, verify the repeated controls behave like a system:
matching button heights, aligned CTA baselines, consistent target sizes, stable
card heights where comparison matters, and no layout shift caused by different
copy lengths. Automated contrast/overflow checks will not catch this; inspect
the screenshot. Run `scripts/layout-audit.js` when browser evaluation is
available; configure selectors if the component uses project-specific class
names.

## 8. Look at it next to the references
Put your screenshots beside the Step-2 reference screenshots. Where does yours
look cheaper or more generic? Usually: weak/missing imagery, not enough
whitespace, or type merely placed rather than crafted. Fix, then re-verify.

---

## Contrast audit script

`scripts/contrast-audit.js` runs in the page context (paste into the devtools
console, or `page.evaluate` it via Playwright). It reports DOM text/bg failures
and flags text that sits over images so you know to measure those by pixel. See
the file for the image-aware pixel-sampling helper (`measureOverImage`).

Usage (Playwright): `await page.evaluate(fs.readFileSync('contrast-audit.js','utf8'))`
then read the returned `{ domFails, overImage }`. For each `overImage` entry,
call `measureOverImage(selector)` to get the worst-case composited contrast.

## Layout audit script

`scripts/layout-audit.js` runs in the page context and reports horizontal
overflow, undersized interactive targets, and repeated component groups whose
CTA heights or baselines do not align. It ships with default selectors for
`.plan`, `.card`, and `.tile`, and can be configured before evaluation:

```js
window.webartistLayoutConfig = {
  groups: [
    { name: 'pricing', item: '.pricing-card', cta: '.pricing-card__cta' }
  ]
}
```

Usage (Playwright): `await page.evaluate(fs.readFileSync('layout-audit.js','utf8'))`
then inspect `{ fails }`. A non-empty `fails.repeatedGroups` needs screenshot
review and usually a layout fix.
