# Page-type playbooks

> **How to use this file.** These are *checklists of what to look for and verify*
> when you study real examples of a page type, and the **jobs** each page must do
> — not blueprints to build from. The "structure" lines tell you what to confirm
> a page handles; they do **not** tell you how it should look or how to arrange
> it. Derive layout and aesthetics from references you actually observe (SKILL.md
> Step 2), then use this to check you haven't forgotten what the page is *for*.

Common page archetypes, the job each must do, and the pitfalls that make each
read as generic. Read the entries relevant to the brief.

## Table of contents
- Landing / marketing page
- Portfolio / work index
- Project / case-study detail
- Product detail (e-commerce)
- About / studio
- Contact (with form)
- Pricing
- Article / blog post

---

## Landing / marketing page
**Job:** one primary action. **Structure:** hero (thesis) → proof/social proof →
how it works / features (only if they're genuinely distinct) → objections/FAQ →
final CTA. **Pitfalls:** the 3-up icon-card grid used regardless of content;
vague benefit copy; multiple competing CTAs. One dominant CTA (Von Restorff).

## Portfolio / work index
**Job:** make the work want to be clicked. **Structure:** a list/grid of
projects, each = image + title + one-line concept + meta (type/place/year),
linking to a **detail page**. **Pitfalls:** a gallery of images with no way in;
identical thumbnails; no point of view. Encode the studio's thinking in how
projects are framed and ordered.

## Project / case-study detail (the heart of a portfolio)
**Job:** tell the project as an argument, not a slideshow. **Structure:**
project hero (image + name + meta) → the idea/concept lead → context & brief →
the moves you made → full-bleed imagery interleaved with text → specs table
(role, year, location, size, team, awards) → credits → **next project** link.
**Pitfalls:** image dump with captions; no narrative; dead-ends with no
next/prev. This page is why people hire a studio — invest here.

## Product detail (e-commerce)
**Job:** inform and convert. **Structure:** gallery → name, price, short value
prop → variant selectors → add-to-cart (sticky on mobile) → specs/details
(accordion) → shipping/returns → reviews → related items. **Pitfalls:**
placeholder reviews; hidden price; tiny tap targets; no clear stock/delivery
info. Match input/selection patterns to Jakob's law.

## About / studio
**Job:** credibility and character. **Structure:** position/manifesto → story →
team (names, roles) → clients/press/awards → values/approach → contact CTA.
**Pitfalls:** stock "teamwork" photos; generic mission statements. Be specific
and human; show real people and real proof.

## Contact (with form)
**Job:** make getting in touch effortless and trustworthy. **Structure:** short
intro (what happens after they write) → the **accessible form** (see
`components.md`) → direct details (email, phone, address + map, hours) →
socials. **Pitfalls:** `mailto:` only; no success/error state; no expectation
setting ("we reply within 2 days"). Forms are a top source of accessibility
failures — follow the component pattern exactly.

## Pricing
**Job:** let people self-select a plan with confidence. **Structure:** 2–4 plans
with a recommended one highlighted, clear feature differences, billing toggle,
FAQ. **Pitfalls:** decision paralysis (Hick) from too many tiers; hidden costs;
unclear what's different between plans. Name plans by who they're for.

## Article / blog post
**Job:** readable, shareable, credible. **Structure:** title + meta (author,
date, read time) → lead → body with a strong type scale (45–75 char measure) →
pull quotes/images → author bio → related posts. **Pitfalls:** walls of text;
no hierarchy; missing share/OG metadata. Reading comfort is the whole product.
