# Accessible component patterns

These are **correctness and accessibility floors** — the semantics, states, and
a11y behaviour a component must have to work for everyone. They are objective
standards, like WCAG, not aesthetic answers: *how* a component looks and is
arranged still comes from references you observed (SKILL.md Step 2). Use these to
make sure what you build is correct, not to decide what it should look like. Keep
semantics first; reach for ARIA only to fill gaps native HTML can't.

## Table of contents
- Accessible form (with validation, success & error states)
- Header nav + mobile menu
- Cards / linked tiles
- Modal / dialog
- Disclosure / accordion
- Tabs
- Data table

---

## Accessible form (the contact form, done right)

Requirements that make a form usable for everyone:
- Every control has a **programmatically associated `<label>`** (`for`/`id`).
  Placeholders are not labels (they vanish and have low contrast).
- Correct `type` and `autocomplete` (`email`, `tel`, `name`, `organization`,
  `street-address`…) so mobile keyboards and autofill work.
- **Required** fields marked in text (e.g. `*` with a legend explaining it) and
  with the `required` attribute — never color alone.
- **Inline validation** on blur/submit: describe the problem and the fix in text,
  tie the message to the field with `aria-describedby`, set `aria-invalid`.
- A single, clearly-named submit button ("Send message", not "Submit").
- **Success state**: confirm what happened and what's next, in an
  `aria-live="polite"` region or a confirmation view. **Error state**: summarize
  errors at the top, move focus there, link to each bad field.
- Spam mitigation that doesn't punish users: a hidden honeypot field, and/or a
  privacy-respecting captcha as a last resort. Don't gate with puzzles by default.
- Don't disable the submit button waiting for "perfect" input; validate on
  submit and guide.
- **Privacy consent (real sites have this — most AI drafts omit it).** A contact
  form that collects personal data needs an explicit, *required*, unchecked
  consent checkbox linking the privacy policy ("I have read and accept the
  privacy policy"). Keep any marketing/newsletter opt-in as a **separate,
  optional** checkbox (never pre-ticked) — bundling consent is not valid consent
  under the GDPR. This pairs with two site-level requirements: a **cookie consent
  banner** and real **privacy / cookie policy pages** (see
  `site-completeness.md`). Look at how real sites in the space actually handle
  this rather than shipping a bare name/email/message form.

```html
<form id="contact" novalidate>
  <p id="req-note">Fields marked <span class="req" aria-hidden="true">*</span> are required.</p>

  <div class="field">
    <label for="name">Name <span class="req" aria-hidden="true">*</span></label>
    <input id="name" name="name" type="text" autocomplete="name" required
           aria-describedby="name-err" />
    <p class="error" id="name-err" hidden>Please enter your name.</p>
  </div>

  <div class="field">
    <label for="email">Email <span class="req" aria-hidden="true">*</span></label>
    <input id="email" name="email" type="email" autocomplete="email" required
           aria-describedby="email-err" />
    <p class="error" id="email-err" hidden>Enter a valid email, e.g. name@example.com.</p>
  </div>

  <!-- honeypot: hidden from users, bots fill it -->
  <input type="text" name="website" tabindex="-1" autocomplete="off"
         class="visually-hidden" aria-hidden="true" />

  <div class="field">
    <label for="message">Message <span class="req" aria-hidden="true">*</span></label>
    <textarea id="message" name="message" rows="5" required
              aria-describedby="message-err"></textarea>
    <p class="error" id="message-err" hidden>Tell us a little about your project.</p>
  </div>

  <button type="submit">Send message</button>
  <p class="form-status" role="status" aria-live="polite" hidden></p>
</form>
```

JS: on submit, `preventDefault`, validate each field, toggle `[hidden]` +
`aria-invalid` on errors, focus the first invalid field; on success show the
`role="status"` message (and POST to the real endpoint when one exists).

## Header nav + mobile menu
- Real `<nav aria-label>`, real `<a href>`s, `aria-current="page"` on active.
- Mobile: a `<button class="menu-btn" aria-expanded aria-controls="nav">` that
  toggles a panel; trap focus while open, close on `Esc` and on link click,
  restore focus to the button, and lock body scroll. Don't rely on a CSS-only
  checkbox hack for anything users must operate reliably.
- **Gotcha — fixed overlay containing block.** A full-screen mobile menu is
  usually `position: fixed; inset: 0`. But if any *ancestor* has `transform`,
  `filter`, `backdrop-filter`, `perspective`, `will-change`, or `contain`, that
  ancestor becomes the containing block and your `inset: 0` overlay sizes to the
  *ancestor* (e.g. the 64px header), not the viewport — so it appears cramped at
  the top with no full backdrop. Headers love `backdrop-filter: blur()`, which
  triggers exactly this. Fix: don't put those properties on an ancestor of the
  overlay (or render the overlay as a direct child of `<body>`). **Always open
  the menu and confirm the overlay actually covers the full viewport** — this
  bug is invisible until you test it on a small screen.

## Cards / linked tiles
- Make the whole card clickable without nesting interactive elements: one `<a>`
  wrapping the content, or a stretched-link pattern (a single `<a>` with an
  `::after` covering the card). Keep one accessible name; don't duplicate links.
- For repeated cards that users compare (pricing, products, projects, features),
  design the internal rhythm as a system: equal CTA heights, aligned CTA
  baselines, consistent target sizes, and stable spacing despite different copy
  lengths. Use flex/grid intentionally (`margin-top: auto`, shared min-height,
  fixed control heights) rather than hoping the content lines up.
- If one card is highlighted, its border/ribbon must not visually push the CTA
  out of alignment with the others. Verify the screenshot, not just the CSS.

## Modal / dialog
- Prefer the native `<dialog>` with `showModal()`. Otherwise: `role="dialog"`,
  `aria-modal="true"`, labelled by its title, focus moved in and trapped, `Esc`
  to close, focus restored to the trigger, background inert.

## Disclosure / accordion
- A `<button aria-expanded>` controlling a region (`aria-controls`). Animate
  height only with reduced-motion respected. Don't hide content from search/AT.

## Tabs
- `role="tablist"` / `tab` / `tabpanel`, arrow-key navigation, `aria-selected`,
  roving `tabindex`. If it's just links to pages, use links instead.

## Data table
- Real `<table>` with `<th scope>`, `<caption>`. Don't fake tables with divs.
  Let it scroll horizontally on small screens inside a labelled container.
