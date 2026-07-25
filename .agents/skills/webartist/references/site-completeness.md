# Site completeness checklist

A landing page is not a site. This is a **functional completeness** checklist —
*what must exist* for a deliverable to be a real site, not a half-finished
prototype. It says nothing about how anything should look or be arranged
(that comes from the references you observed); it only stops you shipping with
the expected pieces missing. Not every item applies to every brief; consciously
decide and don't omit by accident.

## Pages & structure
- [ ] **Home** — the thesis + entry points to everything below.
- [ ] **Index/listing pages** for collections (work/portfolio, products, blog).
- [ ] **Detail pages** for each item (project case study, product page, article)
      — the listing must link to real detail pages, not dead anchors. Portfolios
      live or die on the project detail page (the "project-as-narrative").
- [ ] **About / studio** — who, philosophy, team, credibility.
- [ ] **Contact** — a real page with an accessible form (see below) plus direct
      details (email, address, map link, hours, socials).
- [ ] **404 / not-found** page, on-brand, with a way back.
- [ ] **Legal**: privacy policy page, cookie policy, terms if relevant,
      accessibility statement. Required in many jurisdictions (e.g. EU/GDPR).
- [ ] **Cookie consent banner** (accept / reject-non-essential / preferences),
      remembering the choice — non-essential cookies must not load before
      consent. A real, recurring element AI drafts routinely skip.
- [ ] Consistent **header and footer** on every page; nav with
      `aria-current="page"` on the active item; a working **mobile menu**.

## Footer (commonly under-built)
Sitemap-style link groups, contact summary, social links, newsletter opt-in (if
any), legal links, copyright + company/VAT details, back-to-top. The footer is
where users look when lost — make it useful, not a single line.

## Contact form (essential — and usually missing)
A real, accessible form, not a `mailto:` only. See `components.md` for the full
pattern. Minimum: associated `<label>`s, correct input `type`/`autocomplete`,
required-field marking in text (not color alone), inline validation with helpful
messages, a visible **success state** and **error state**, spam mitigation
(honeypot/captcha), and a clear single submit action.

## Per-page essentials (every HTML document)
- [ ] Unique, descriptive `<title>` and meta `description`.
- [ ] **Open Graph / Twitter** tags + a share image (link previews).
- [ ] `<html lang>` set to the site's language (ask the user — see SKILL Step 1).
- [ ] Favicon + apple-touch-icon; `theme-color`.
- [ ] Canonical URL; `viewport` meta.
- [ ] One `<h1>`; correct heading outline; semantic landmarks.
- [ ] Skip-to-content link.

## Site-level files
- [ ] `robots.txt` and `sitemap.xml`.
- [ ] `manifest.webmanifest` for installability where relevant.
- [ ] Structured data (JSON-LD) for the entity (Organization, Product, Article).

## States & feedback (not just the happy path)
- [ ] **Loading** states (skeletons/spinners) for anything async.
- [ ] **Empty** states with direction ("No projects yet — …").
- [ ] **Error** states (form errors, failed loads) in the interface's voice.
- [ ] Hover/focus/active/disabled styles for every interactive element.

## Performance & loading
- [ ] Images: right size, `loading="lazy"` below the fold, `width`/`height` or
      `aspect-ratio` to prevent layout shift, modern formats where possible.
- [ ] Fonts: `display=swap`, preconnect, subset; avoid layout shift.
- [ ] No blocking of first paint; defer non-critical JS.

## Internationalization
- [ ] Content in the **language the user asked for** (confirm in the interview).
- [ ] `lang` correct; date/number/currency formats match the locale.
- [ ] If multilingual: a language switcher and `hreflang` links.

## Cross-cutting
- [ ] Responsive at real breakpoints (see `verification.md`).
- [ ] Tables and comparison grids don't overflow at 360px — stacked, scroll-contained, or reflowed to label/value.
- [ ] Keyboard-operable; visible focus; reduced-motion honored.
- [ ] Contrast measured, including text over images (see `wcag-checklist.md`).
