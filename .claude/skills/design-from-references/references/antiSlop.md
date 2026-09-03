# Anti-Slop — what gets a design rejected

Lessons from designs that were **actually rejected and deleted**. These are not
style opinions: each one cost a full rebuild. Read this at gate 2.5
(Originality Engine) and again at gate 3 (tokens & fonts).

The single deepest lesson: **"it came from the dataset" does not make a choice
safe, and "it feels more distinctive" is not a reason to leave the dataset.**
Both failures happened in the same project on the same day.

---

## 1. Measured does not mean safe (fonts)

A font being present in `dataset.json` proves a real site used it. It does not
prove it will read as designed rather than generated. IBM Plex Sans + IBM Plex
Mono were taken straight from a measured reference and rejected on sight as
"proper AI slop".

**Families that read as generated** — do not ship them as the display or body
face of a design, even when measured:

Inter · Poppins · Manrope · Figtree · Outfit · Sora · DM Sans · Space Grotesk ·
Geist · Satoshi · General Sans · Playfair Display · Cormorant · Spectral ·
IBM Plex (any) · Space Mono · JetBrains Mono

`scripts/datasetTally.js` flags these automatically in the FONTS row.

**Why they read as slop:** they are the default suggestions of every AI tool and
every free-font listicle, so they carry no brand signal.

**Be honest about what the data says.** These faces are **not absent from real
sites**: run `houseStyleTally.js` for the live count — at the last run, 35 of
106 references used a flagged family, Inter the most common. The argument is
not "no good site uses Inter", which would be false. It is that the majority
carry a **proprietary or licensed display face** (Epicene Text, Goldenbook,
Canela, Signifier, Portrait, Founders Grotesk, Freight Display, Darby Sans…),
and that tier is where the category's identity actually lives. Reaching for a
blacklist face is choosing the one option that reads as *unchosen* — and this
user has rejected it on sight, including when it was measured (IBM Plex).

> **Numbers in this file are indicative and go stale.** The authoritative,
> regenerated counts live in the gate 2c table in `SKILL.md`; `houseStyleTally.js
> --check` tells you whether they are current. This paragraph used to freeze
> "15 of 70, Inter on 10" from a corpus of 7 categories that had since grown to
> 11 — the mistake this whole file warns about, made inside it.

So: treat the list as **"needs a reason", not "never"**. If the cluster you are
designing for genuinely runs on one of these, say so with the count and use it
deliberately. What is banned is picking it *by default*.

**One superfamily for headings + body + data tends to read as generated** — a
flat technical neutrality. But "no real brand does this" would be wrong: at the
last count the references split roughly **even** between two-family and
single-family, and single-family actually **wins in some categories** —
corporate-website among them. So pair two voices as the default, and let the
tally's TYPE PAIRING row for *your* cluster overrule it, which is the only
count that governs the design in front of you.

**How to choose:** propose **3 alternatives verified as available in Figma**
(`listAvailableFontsAsync`), explain the voice of each, and get agreement before
propagating the choice through the system.

---

## 2. Follow the majority of the dataset, not the exception

A longevity-clinic design was built on a dark slate background because **1 site
out of 10** used one. The other **9 were on light backgrounds**. Verdict:
"completely black site, super AI slop, senseless images and brutalist. Bad
work."

Building a dataset and then ignoring its statistical evidence throws away the
entire research phase. If 8–9 references out of 10 do something, the opposite
choice needs far more than "it seems more characterful".

**Dark background + oversized type + black-and-white photography is not a
distinctive direction — it is the recognizable default of every generated
portfolio.** So is:

- an italicised keyword inside a headline — rare overall, but a genuine
  convention in a few categories
- fully desaturated or B&W photography — overwhelmingly the minority
- abstract or brutalist architecture photos *(not countable from the notes —
  judge on the screenshots)*
- huge empty sections carrying one sentence — not countable from the notes either
- mono type used for "technical" flavour — rare overall, **concentrated in
  corporate-website**: do not ban it there

**The counts for these live in the generated gate 2c table in `SKILL.md`, not
here.** Per-category concentration is the whole point — a global ban applied to
the one category where the thing is a convention is the same error in reverse.

None of these are banned in principle. Each is banned **unless a counted
majority of the cluster does it** — that is what gate 2c enforces, and
`datasetTally.js` + `designNotesScan.js` give you the count. The per-category
concentrations above are why the ban is per-cluster, not global.

**Correction — headline size was wrongly on this list.** It was added from a
hand count that the measured evidence contradicts. `designNotesScan.js` reads
the H1 sizes stated in the `design.md` files: in longevityClinic, **7 of the 9
sites that state a size are above 56px** (100 · 88 · 80 · 78 · 70 · 64 ·
56.2px), and the same holds for fintechApps and corporate-website, while food
and art e-commerce sit below. Large display type is a **category-dependent
fact**, not a universal tell of generated design. This is itself the lesson:
a hand count felt authoritative and was wrong — count with the script, and keep
the evidence.

---

## 3. Images must carry meaning, not mood

A black-and-white concrete corridor inside a *medical clinic* design:
decoration with no meaning. No patient sees themselves there. The dataset said
real photography of real people and real facilities.

**Total desaturation is not art direction** — it is the trick that makes photos
from different sources look consistent. It removes warmth and humanity, and
reviewers read it immediately as a cover-up.

Every image must answer: who is this person, what is this place, why is it in
this section. The approved work in this repo (Tirage, Firn, Otava v2) has
**warmth and material** — that is the benchmark.

---

## 4. Brand names must not be abstract quality-nouns

Rejected: **Meridian · Baseline · Ledger · Cadence** — "please, no AI slop
names".

**The problem is not description — it is the abstract-noun register.** Checking
the 70 reference brands makes the line clear, and it is not "never describe the
product": plenty of real, concrete names do, and work — **Poster Club**,
**Paper Collective**, **Farm to People**, **Imperfect Foods**, **Moneybox**,
**Thrive Market**, **Function Health**. Those name a *thing* in plain language.

What was rejected — Meridian, Baseline, Ledger, Cadence — is the other thing:
an **abstract noun gesturing at a quality**, the register every generator
defaults to. It could belong to any company in any category, which is precisely
the failure.

Also good, and the other half of the references: real words in another language
(**Neko** — Japanese for cat), given names (**Ezra**), place names
(**Lanserhof**, **Azulik**), plain verbs (**Tally**, **Plum**, **Wise**).
Approved for this user: **Otava** (Finnish for the Big Dipper).

### How the good ones were actually found

Every name this user kept came from the same move, and the skill had never
written it down — which is why it kept proposing Meridian instead.

**Go into the product's own world and name a real thing in it.** Not a metaphor
for a quality: an object, a tool, a material, a unit, a process, a trade word,
or the place it comes from.

| Name | Is literally | For |
| --- | --- | --- |
| **Tirage** | the print run, in French printing | art e-commerce |
| **Firn** | granular snow, in glaciology | an alpine hotel |
| **Kvitto** | a receipt, in Swedish | a pricing table |
| **Plumbline** | the instrument that finds true vertical | an investment firm |
| **Fettle** | condition, in English dialect — *in fine fettle* | e-bike servicing |
| **Otava** | the Big Dipper, in Finnish | a longevity clinic |

The register works because the word already has a job. It carries a referent
that predates the brand, so it cannot read as generated — and it gives the
design a signature to derive from, which is where Plumbline's vertical rule
came from.

**Procedure when you need a name:** list 10–15 real terms from the domain — what
the practitioners call their tools, their steps, their measurements, their
materials. Then pick the one that is *concrete, short to say, and not the
category itself*. If the list is all abstractions, you have not gone into the
domain yet.

> **The escape became its own formula.** Six of the nine names shipped from this
> repo — Otava, Tirage, Firn, Fettle, Kvitto, Lumo — are a single foreign word
> of four to six letters. That is far better than Meridian and it is still a
> pattern, and a pattern is what "AI-made" means. `nameCheck.js --against
> <catalogue>` measures it. **Vary the shape too:** two words, a plain English
> compound, a possessive, a place. *Second Press*, *Cold Storage Works* and
> *The Ninth Hour* are names; so is *Fettle*. Only one of those shapes has been
> used nine times here.
>
> *Threshold* is on the abstract-register list in `nameCheck.js`, and it is one
> of this repo's own. That is deliberate — it is the weakest of the nine, and
> excluding it to protect a past decision is how a checklist starts lying.

Avoid: abstract quality-nouns, Latin-sounding coinages, and anything that reads
as the product category with the letters rearranged. **Test:** would the name
fit three competitors in the same sector? Then it is not a name.

---

## 5. Show a whole page early, not tidy components

Both rejections above were only visible on a **full page**. A neat set of
components tells you nothing about whether the page reads as generic — the
overall effect is judged on the composition, never on the parts.

This is why the **Early Look Gate** exists in `SKILL.md` and why it blocks:
one complete screen, real copy, real images, shown side by side with the
closest dataset screenshot, before anything else gets built.

When a direction is rejected, **go back to the count (2a/2b)**. Do not patch
details of the rejected direction — the problem is the direction.

---

## 6. Deviating from the majority — the only legitimate path

You may overrule the tally. The bar:

1. State which verdict you are overruling and what the count actually was.
2. Give a reason grounded in the brief (audience, positioning, constraint) —
   not in taste.
3. Get the user's explicit agreement **before** building on it.
4. Record it in the Deviations table of the constraints file.

Anything less is not a bold decision; it is the house style leaking.

---

## 7. What outsiders name as slop — the tells this file was missing

Sections 1 to 6 come from this user's own rejections, which makes them sharp and
narrow: they are almost entirely about **type, colour, imagery and naming**. A
survey of the public criticism of AI generated design (2026) shows the repo has
been arguing about the visible half while a second half goes unexamined — the
part reviewers describe as *"no human decided this"*.

Two things are worth knowing before reading the list. First, it **agrees with
this repo** on the headline tells, independently: Inter, the purple to blue
gradient, the centred hero with one CTA, the row of identical rounded cards.
Section 1's font list was written from one user's reaction, and the wider
critique reaches the same names — that is corroboration, not coincidence.
Second, and more useful, **the rest of the list is new here**, and every item is
something the current gates do not measure.

### 7a. Uniformity is a tell, and this repo never counted it

The most cited non typographic tell is **sameness of geometry**: "identical
padding, identical border radius, and identical card heights" — 16px radius
everywhere, 24px padding everywhere, one shadow recipe cloned onto every
surface, or worse, a different shadow per component so elevation means nothing.

This is the defaulting failure in a dimension the tally has no row for.
`datasetTally.js` counts backgrounds, hues, fonts and sections. It does not
count radius, spacing rhythm or elevation, so a design can pass every gate in
this skill and still read as generated because every card is the same box.

**A script now counts what the prose states** *(added 2026-09-02)*.
`designNotesScan.js` gained three rows — `CORNER RADIUS`, `SURFACE TREATMENT`
and `RADIUS UNIFORMITY` — and `datasetTally.js` prints them among the by-eye
rows so they reach the constraints file like every other counted verdict.

Be clear about what they can and cannot tell you. `dataset.json` records no
geometry at all, so these read the `design.md` prose, and the prose usually does
not mention radius: across the 98 bundled notes only 33 state a radius value and
26 mention flat or borderless. Most categories therefore come back `unknown`,
which is the correct answer and not a failure. Where the notes do speak the
verdicts are real — `cookieConsent` counts SOFT (5-16px), and its RADIUS
UNIFORMITY row reads `single 4 | varied 2`.

The first version of the `SURFACE TREATMENT` pattern matched a bare `flat`,
which turned 2 genuine hits into 7 in `saasPricing` by counting "flat bullet
list" and "flat surface color" as elevation claims. That is the same failure
this section is about, committed while writing the check for it: **a loose
count is worse than no count, because it looks like evidence.** CI now pins the
tightened behaviour.

**Counter-evidence worth keeping.** The Revolut note says: *"Commit to a single
border-radius value and use it everywhere. Mixing radii feels inconsistent."*
A real reference recommending exactly what this section warns about is the
reminder that uniformity is not automatically slop — an undecided uniformity is.
The question the rows are there to force is not "is it consistent" but "did
anyone decide".

**For the dimensions no script reaches** — padding rhythm, card heights — open
the cluster's screenshots and ask
whether the references use *one* radius or several, whether cards are bordered,
shadowed or flat, and whether any two sections share a card height. Most
editorial and commerce references vary these deliberately. Record the answer in
the by-eye rows of the constraints file. Borderless and flat is the safer
default: a shadow must earn its place by expressing a real elevation.

### 7b. The states nobody builds

Named in every critique, and absent from the visible design almost by
definition: **focus, disabled, error, empty, loading**. They are "absent or
improvised late". One published acceptance bar requires coherent hover, focus,
disabled, error and loading or empty states before a screen is handed off at all.

This repo's gate 5 checks clipping, overflow, contrast and truncation — all
*rendering* faults. It does not ask whether the states exist. A Figma file with
a beautiful default button and no focus variant is exactly the artefact the
critique is describing, and it will pass every gate here today.

### 7c. Accessibility failures survive an accessibility gate

`contrast.js` measures colour pairs, which is the one accessibility property
that is easy to measure and therefore the one that gets measured. The research
is blunt that this is not enough:

- A CHI study of LLM generated web UIs measured a **semantic** accessibility
  gap: the attribute is present and meaningless — `alt="image"`, a link whose
  text is "Click here", a heading order that is decorative rather than
  structural. Accessibility oriented prompting reduced violations but did not
  remove them, and semantic structure was where they persisted.
- An analysis of 470 pull requests (December 2025) found AI generated code
  carried **1.7x more issues and 2.74x more security vulnerabilities** than
  human written code.

The lesson for a Figma-first tool is narrow but real: **a contrast pass is not
an accessibility pass**, and the skill currently lets the two be confused. Where
the deliverable is code, alt text, link text and heading order need checking as
their own thing. Where it is Figma, the layer names and the documented usage
rules are what a developer will translate into markup, so `Rectangle 47` next to
a photograph is the same failure one step earlier.

### 7d. Motion as default finish

"Hover states that do nothing." "Buttons that snap instead of easing." "A bounce
on every hover." "Fade-in on every element." The tell is not any single choice
but **motion applied uniformly**, which is the same defaulting failure as 7a in
the time dimension. webartist's `anti-slop.md` already says prefer static and
earn each animated moment; it is repeated here because motion is usually decided
during the build, after that file has been read and closed.

### 7e. Copy that says nothing, and proof that is invented

The named phrases are worth reading as a blacklist because they are so
consistent across sources: *"Build the future of work"*, *"Your all in one
platform"*, *"Scale without limits"*, *"best in class"*, *"cutting edge"*, and
hedged claims like *"may help you"* or *"can potentially"*. Alongside them:
stock photography of "a diverse group of people looking at a laptop in an
impossibly well lit office", and abstract 3D blobs.

The `design-content` agent already asks for concrete copy. What is missing is
the **fabrication rule**: a generated design that invents testimonials,
customer logos, review counts or metrics is not just generic, it is a claim
about a real world that does not exist. Mark invented figures as illustrative —
the Plumbline showcase already does this with a `*` and the README says so, so
the standard exists in this repo and simply is not written into the skill.

### 7f. Where the outside critique and this repo disagree

Worth stating, because adopting the list wholesale would break rules that were
measured here:

- Several sources prescribe **Playfair Display, JetBrains Mono, Bricolage
  Grotesque** as the cure for Inter. Two of those three are on this repo's
  slop-flagged list, measured. A remedy repeated widely enough becomes the next
  default; that is precisely the trap section 1 documents.
- One source recommends checking contrast with **APCA**. APCA is not WCAG 2.x
  and is not a conformance standard today. `contrast.js` implements WCAG 2.x
  because that is what an accessibility claim can be made against. Do not swap
  it on the strength of a blog post.
- The general advice to "lock your tokens in a DESIGN.md and cap the palette" is
  what the constraints file already does, with the improvement that the values
  are **counted from references** rather than chosen once and frozen.

**Lesson: this file was built from one reviewer's rejections, so it learned
their eye — type, colour, imagery, names — and inherited their blind spots.
Geometry uniformity, missing states, semantic accessibility and invented proof
are the tells that survive every gate in this skill today.**

---

## Run log

Moved to `references/runLog.md`. Every rule above was paid for by a run
recorded there — read it when a rule looks arbitrary, and **append to it after
any rejected or corrected run**.
