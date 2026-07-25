# Anti-slop: how to notice you're defaulting

> **Read this first.** This file is **not** a list of answers, and it is **not**
> a spec to design against. The specific clichés below are *illustrations of the
> defaulting failure mode* — they go stale, and "do the opposite of this list" is
> itself just designing from a list. The actual safeguard lives in SKILL.md: every
> decision must trace to a reference you observed or the subject's own world. Use
> this file only to *recognise the feeling of defaulting*, then go back to the
> references and derive. If you find yourself reaching for the skill's examples as
> a source of design decisions, stop — that's the prior wearing a disguise.

"AI slop" is design that looks like the *average* of all design — competent,
inoffensive, and instantly forgettable, with no point of view. It's not one ugly
mistake; it's the absence of a specific choice — of having actually looked.

## The current AI-design clichés

Right now, AI-generated web design clusters around a few recognizable looks.
None are *wrong* — but reaching for them *by default*, regardless of the brief,
is the tell. If the brief explicitly asks for one of these, follow the brief.
Otherwise, don't spend your freedom here:

1. **The "tasteful editorial" default**: a warm-neutral background + a
   high-contrast serif display + a single earthy accent.
2. **The "premium tech" default**: a near-black background + one acid/vivid
   accent + lots of glow.
3. **The "we have taste" default**: a broadsheet/newspaper layout — hairline
   rules, zero border-radius, dense columns, tiny eyebrows.
4. **The "generic SaaS" default**: a big gradient blob, a number + small label
   stat row, rounded cards in a 3-up grid, a gradient CTA, one ubiquitous
   neo-grotesk everywhere.

## Specific tells to avoid (unless genuinely justified)

- **The ubiquitous neo-grotesk / system-ui pressed into display duty.** Fine for
  body; lazy as the personality of the page. Choose a display face with a point
  of view.
- **The 3-up feature card grid** with an icon, a bold title, two lines of body —
  used regardless of whether the content is actually three parallel things.
- **Decorative `01 / 02 / 03` numbering** on things that aren't a sequence.
- **Gradient mesh / blurry blobs** as background filler with no meaning.
- **Emoji as iconography** in a serious product.
- **Center-everything** layouts with no tension or asymmetry.
- **Lorem-ipsum-flavored real copy** — vague, salesy, says nothing specific
  ("Empowering your journey to success"). Generic copy = generic design.
- **Default shadcn/Tailwind look** shipped untouched (slate palette, `rounded-lg`
  cards, `shadow-sm`) when the brand deserves its own identity.
- **Animation as default finish** — staggered fade-ins on load, everything
  rising/sliding into place, decorative scroll reveals. Movement applied
  everywhere reads as AI-generated; restraint reads as designed. Prefer static;
  earn each animated moment.
- **Pinterest-perfect but unusable** — looks great in a screenshot, fails the
  moment someone tries to use it on a phone or with a keyboard.

## The two failure modes that defeat all the advice above

These are subtle because the output *looks* researched and intentional. Watch
for them specifically.

**1. The subject gravity well.** A strongly stereotyped subject pulls every
choice toward its cliché — its expected colour, its expected typeface, its
expected one literal motif ("draw the obvious object so the meaning is clear").
Even after research, you'll drift back to these because they're the average of
everything tagged with that subject, and they snap into place the moment a
loaded word like "artisanal" or "premium" appears in the brief. Escape by
sourcing the palette and type from *specific real references* (ideally ones
praised for breaking the category's conventions) and from the subject's actual
artifacts — never from "what does this category look like in general".

**2. Fake research → design from prior.** You search, summarize some generic
trends (a vague category "trend", "use whitespace"), and then invent the
palette and fonts from your own head anyway. The research changed nothing. This
is the most common way a "research-driven" process still produces slop. The fix
is the traceability rule: if you can't name *where* a specific color or typeface
came from (a named reference, a published palette, a real artifact), you didn't
let the research drive — you decorated a default with citations.

**3. The imagery-free page.** The single most reliable "AI-generated" tell is a
page that carries itself entirely on typography, color blocks, gradients, and
CSS shapes — with **no real photography or crafted imagery**. Screenshot a few
real references and notice how much of the work imagery is doing versus
type-and-color tricks, then ask what *your* references actually do. The slop
instinct is reaching for a giant headline, a bright accent on a dark field, or
decorative shapes *to compensate for having no image at all*. If the references
rely on crafted imagery and yours has none, that's the gap — source real,
non-clichéd imagery and treat it as first-class. (What kind, and how it's used,
comes from the references, not from this file.)

## Escaping the average is a method, not a set of moves

There is deliberately no list of tricks here that makes a design "non-generic",
because any such list just becomes the next default — and "do the opposite of the
clichés above" is still designing from this page. The only reliable escape is the
process: anchor in the subject's own world, derive every choice from references
you actually observed, keep the observed→applied trace honest, and cut anything
you can't trace. If a decision's only origin is habit or this skill, it's the
average talking.

## The self-critique pass

Before building, simulate: *"If I were given this brief cold, with no research,
what would I produce?"* If your current plan looks like that answer, you've
defaulted — change it and say what you changed and why. Then apply Chanel's
mirror rule: remove the one element that's there out of habit rather than intent.
