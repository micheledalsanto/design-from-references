# UX laws, heuristics & "theorems"

Apply the laws relevant to the design in front of you — each entry says *when*
it bites. These are tools for reasoning, not rules to recite. A distinctive
design that ignores them becomes confusing; a usable design that ignores the
brief becomes generic. You want both.

## Table of contents
- Core laws of interaction (Fitts, Hick, Jakob, Miller, Tesler)
- Perception & grouping (Gestalt, Aesthetic–Usability, Von Restorff, Serial Position)
- Motivation & memory (Goal-Gradient, Zeigarnik, Peak–End, Doherty)
- Nielsen's 10 usability heuristics
- Layout & information hierarchy
- Forms & input

---

## Core laws of interaction

**Fitts's Law** — Time to hit a target grows with distance and shrinks with
size. *Apply when:* sizing buttons, links, and tap targets. Make primary
actions large and close to where attention already is; don't put critical
controls in tiny, far corners. Edges/corners are "infinitely large" (the cursor
stops there) — use them for global actions. Pairs with the WCAG target-size
minimum.

**Hick's Law** — Decision time grows with the number and complexity of choices.
*Apply when:* a screen has many options, a nav has many items, a form has many
fields. Reduce, group, stage (progressive disclosure), set a clear default. One
primary action per view.

**Jakob's Law** — Users spend most of their time on *other* sites and expect
yours to work like those. *Apply when:* deciding where to be conventional vs.
novel. Keep interaction patterns familiar (nav top/left, cart top-right, logo
links home); spend your novelty budget on aesthetics and the signature element,
not on reinventing where the menu lives.

**Miller's Law** — People hold ~7 (±2) chunks in working memory. *Apply when:*
grouping nav items, steps, or list content. Chunk long numbers/menus; don't make
users remember information across steps — carry it forward.

**Tesler's Law (conservation of complexity)** — Every system has irreducible
complexity; the only question is who absorbs it. *Apply when:* tempted to push
work onto the user. The product should eat the complexity (smart defaults,
inference) rather than expose it as more fields and choices.

**Postel's robustness / forgiveness** — Be liberal in what you accept from the
user. *Apply when:* parsing input (phone numbers, dates) — accept messy formats
and normalize, rather than rejecting.

## Perception & grouping

**Gestalt principles** — How the eye groups things:
- *Proximity:* items close together are read as related — use whitespace as the
  primary grouping tool, not borders.
- *Common region:* a shared container/background groups items strongly.
- *Similarity:* same color/shape/size = same kind/function. Keep all clickable
  things visually consistent.
- *Continuity & alignment:* the eye follows lines; align elements to invisible
  grids so the layout reads as ordered.
- *Closure / figure-ground:* the mind completes shapes and separates subject
  from background — ensure clear contrast between content and its surround.

**Aesthetic–Usability Effect** — People perceive beautiful interfaces as easier
to use, and forgive minor usability issues. *Apply:* this is the bridge between
"distinctive" and "usable" — polish earns goodwill — but it can also *mask* real
problems in testing, so don't let beauty excuse a broken flow.

**Von Restorff (isolation) effect** — The item that differs is remembered.
*Apply when:* you want one thing to win attention (the primary CTA). Only *one*
element should stand out per view; if everything is bold, nothing is.

**Serial Position effect** — People best remember the first and last items.
*Apply when:* ordering nav, lists, onboarding — put the most important items
first and last; the weakest go in the middle.

## Motivation, time & memory

**Goal-Gradient effect** — Motivation increases closer to a goal. *Apply when:*
multi-step flows, checkouts, profile completion — show progress and make the
remaining steps feel few/small.

**Zeigarnik effect** — Unfinished tasks stay on the mind. *Apply when:*
designing onboarding/checklists — a visible "2 of 5 done" pulls people back.

**Peak–End Rule** — An experience is judged by its most intense moment and its
end. *Apply when:* designing the signature moment and the final/confirmation
state. Invest in a memorable peak and a satisfying ending (a great success
screen, not a dead-end).

**Doherty Threshold** — Productivity soars when system response is < 400ms.
*Apply when:* anything has latency. Respond instantly with optimistic UI,
skeletons, and feedback within ~400ms; never leave an action looking ignored.

## Nielsen's 10 usability heuristics (quick gate)

1. **Visibility of system status** — always show what's happening (loading,
   saved, selected).
2. **Match the real world** — user's language and mental model, not system
   jargon.
3. **User control & freedom** — clear undo/back/escape; no traps.
4. **Consistency & standards** — same word/action means the same thing
   everywhere (see Jakob).
5. **Error prevention** — prevent mistakes (constraints, confirmations,
   good defaults) before relying on error messages.
6. **Recognition over recall** — show options; don't make users remember.
7. **Flexibility & efficiency** — shortcuts for experts, simple path for
   novices.
8. **Aesthetic & minimalist design** — every extra element competes with the
   relevant ones. Cut what doesn't serve the goal.
9. **Help users recognize, diagnose, recover from errors** — plain language,
   precise problem, a way forward.
10. **Help & documentation** — available when needed, task-focused, searchable.

## Layout & information hierarchy

- Establish a clear visual hierarchy: one dominant element, then secondary, then
  tertiary. Use size, weight, color, and space — not just one of them.
- Respect a spacing scale (e.g. 4/8px base). Consistent rhythm reads as
  intentional; ad-hoc spacing reads as careless.
- Use whitespace generously; it's the cheapest way to look premium and to group
  content (proximity).
- Line length for body text ~45–75 characters for readability.
- Strong typographic scale (clear jumps between levels) beats many near-equal
  sizes.
- F-pattern / Z-pattern: people scan, they don't read. Front-load meaning; make
  the first words of headings and the first items carry the message.

## Forms & input

- One column, labels above fields, logical grouping (Hick + Miller).
- Ask for the minimum (Tesler) — every field has a cost.
- Inline, specific validation; preserve user input on error.
- Match input type to data (`type="email"`, `inputmode`, date pickers) and
  enable correct mobile keyboards.
- Clear, action-named submit button; show progress on multi-step (Goal-Gradient).
