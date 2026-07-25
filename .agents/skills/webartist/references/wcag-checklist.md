# Practical WCAG 2.2 AA checklist for the web

Target **WCAG 2.2 level AA** as the quality floor. This is the practical subset
that matters for almost every web design. When a design choice and accessibility
seem to conflict, find a third option — they rarely truly conflict, and "it
looks better" never wins over "people can't use it".

## Color & contrast

- **Text contrast:** normal text ≥ **4.5:1** against its background;
  **large text** (≥ 24px, or ≥ 18.66px bold) ≥ **3:1**. (SC 1.4.3)
- **Non-text contrast:** UI component boundaries, icons, focus indicators, and
  meaningful graphics ≥ **3:1**. (SC 1.4.11)
- **Don't rely on color alone** to convey meaning (errors, required fields,
  status, links in body text) — add an icon, text, underline, or shape. (SC 1.4.1)
- Verify low-contrast accents (light gray placeholder text, pale-on-pale) — a
  very common failure. Test the actual hex pairs, don't eyeball.
- **Text over images/video:** a contrast check that reads `background-color` is
  blind to the photo behind the text — white text over a bright sky passes the
  naive check and fails in reality. Either measure the real pixels (sample the
  rendered image + any scrim, take the lightest spot) or guarantee contrast with
  a sufficiently opaque scrim or a solid text plate. See `verification.md` and
  `scripts/contrast-audit.js` (`measureOverImage`).
- **Two-tone accent:** a saturated accent that passes on light backgrounds
  (e.g. dark blue on paper) often fails on dark backgrounds (dark blue on
  near-black ≈ 2:1). Keep one accent tuned for light and a lighter variant for
  dark, and check each in its context.

## Keyboard & focus

- **Everything operable by keyboard**, in a logical order, with no traps.
  (SC 2.1.1, 2.1.2)
- **Visible focus indicator** on every interactive element — never
  `outline: none` without a clearly visible replacement. The focus ring itself
  needs ≥ 3:1 contrast. (SC 2.4.7, 2.4.11 focus-not-obscured)
- Provide a **"skip to main content"** link as the first focusable element on
  pages with repeated nav. (SC 2.4.1)
- Logical, sequential tab order that matches the visual order. (SC 2.4.3)

## Targets & pointer

- **Target size:** interactive targets ≥ **24×24 CSS px** (AA, SC 2.5.8); prefer
  ≥ 44×44 for primary touch targets. Space small adjacent targets apart.
- Don't require complex gestures or path-based motions for any function — offer
  a simple single-pointer alternative. (SC 2.5.1)

## Motion & timing

- **Respect `prefers-reduced-motion`** — disable or tone down non-essential
  animation, parallax, autoplay. (SC 2.3.3)
- No content that **flashes more than 3 times per second**. (SC 2.3.1)
- **Pause/stop/hide** for anything auto-moving, auto-playing, or auto-updating
  that lasts > 5s (carousels, marquees, video). (SC 2.2.2)
- Avoid time limits; if unavoidable, let users extend them. (SC 2.2.1)

## Structure & semantics

- Use **semantic HTML**: real `<button>`, `<a href>`, `<nav>`, `<main>`,
  `<header>`, `<footer>`, headings `<h1>`–`<h6>` in a correct, non-skipping
  order. One `<h1>` per page expressing the page's purpose. (SC 1.3.1, 2.4.6)
- Landmarks let screen-reader users jump around — `main`, `nav`, `header`,
  `footer`, `aside`.
- Set the page `lang` attribute and a meaningful `<title>`. (SC 3.1.1, 2.4.2)
- Reading and focus order make sense when CSS is off / linearized. (SC 1.3.2)

## Images & media

- **Meaningful images** get descriptive `alt`; **decorative** images get
  `alt=""` (empty, not missing) so they're skipped. (SC 1.1.1)
- Icons that act as the only label need an accessible name (`aria-label` or
  visually-hidden text).
- Video/audio: captions for prerecorded video, transcripts for audio. (SC 1.2.x)

## Forms

- Every input has a **programmatically associated `<label>`** (not placeholder-
  as-label — placeholders disappear and have low contrast). (SC 1.3.1, 3.3.2)
- Errors: identify the field, describe the problem in text, and suggest a fix.
  (SC 3.3.1, 3.3.3)
- Use `autocomplete` tokens for known data (name, email, address). (SC 1.3.5)
- Don't ask for the same info twice in a process if it can be reused. (SC 3.3.7)
- Required fields marked in text, not by color alone.

## Responsive & zoom

- **Reflow:** usable at 320px width with no horizontal scrolling for vertical
  content. (SC 1.4.10)
- Content readable and functional at **200% zoom** without loss. (SC 1.4.4)
- Respect **text spacing** overrides (line-height, letter/word spacing) without
  clipping. (SC 1.4.12)
- Support both portrait and landscape. (SC 1.3.4)

## Quick pre-ship sweep

- [ ] Tab through the whole page — focus always visible, order logical, nothing trapped
- [ ] Run a contrast check on every text/background and UI/border pair
- [ ] Resize to 320px and to 200% zoom
- [ ] Toggle `prefers-reduced-motion: reduce` and confirm animation calms down
- [ ] Headings form a correct outline; one `<h1>`
- [ ] Every image has correct `alt`; every input has a real label
- [ ] No information conveyed by color alone
