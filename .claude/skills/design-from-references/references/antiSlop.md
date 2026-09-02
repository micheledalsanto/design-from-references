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

**Be honest about what the data says** *(measured across 7 local datasets,
2026-08-31)*: these faces are **not absent from real sites** — 15 of the 70
references use one, Inter alone on 10. The argument is not "no good site uses
Inter", which would be false. It is that **60 of the 70 references carry a
proprietary or licensed display face** (Epicene Text, Goldenbook, Canela,
Signifier, Portrait, Founders Grotesk, Freight Display, Darby Sans…), and that
tier is where the category's identity actually lives. Reaching for a blacklist
face is choosing the one option that reads as *unchosen* — and this user has
rejected it on sight, including when it was measured (IBM Plex).

So: treat the list as **"needs a reason", not "never"**. If the cluster you are
designing for genuinely runs on one of these, say so with the count and use it
deliberately. What is banned is picking it *by default*.

**One superfamily for headings + body + data tends to read as generated** — a
flat technical neutrality. But "no real brand does this" would be wrong:
*measured 2026-08-31*, the references split **45 two-family vs 25 single-family**,
and single-family actually **wins in corporate-website (6-4)** and ties in
longevityClinic. So pair two voices as the default, and let the tally's TYPE
PAIRING row overrule it when your cluster genuinely runs on one family.

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

- an italicised keyword inside a headline *(6/70 references — but 3 of the 6 are
  longevityClinic, where it is a genuine convention)*
- fully desaturated or B&W photography *(37 colour vs 2 desaturated)*
- abstract or brutalist architecture photos *(not countable from the notes —
  judge on the screenshots)*
- huge empty sections carrying one sentence *(6/70)*
- mono type used for "technical" flavour *(6/70 — but **4/10 of
  corporate-website**: do not ban it there)*

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

One entry per run that was rejected or corrected. Append here instead of
trusting memory: this file ships with the skill, a session does not.
Format: date · what was chosen · what the user said · what the count was ·
what changed in the skill.

**2026-08-18 — longevity clinic, dark editorial. REJECTED, file deleted.**
Chose a dark slate background from 1 reference out of 10. Verdict: "completely
black site, super AI slop, senseless images and brutalist. Bad work, not in
line with the past ones." True count: 9/10 light backgrounds. → added gates 2a
(count before you choose), 2b (steal the structure), 2c (house-style ban) and
the Early Look Gate.

**2026-08-18 — same project, fonts.** IBM Plex Sans + Mono, taken from a
measured reference, rejected as "proper AI slop". Brand names Meridian /
Baseline / Ledger / Cadence rejected as descriptive. → this file; the
"measured ≠ safe" rule in `plan-and-gates.md`.

**2026-08-31 — headline size rule was wrong.** The house-style ban listed
"headlines above ~56px" on the strength of a hand count ("only 1/10"). Building
`designNotesScan.js` and reading the sizes stated in the `design.md` files gave
the opposite: **7 of 9 sites above 56px** in longevityClinic (100 · 88 · 80 ·
78 · 70 · 64 · 56.2px), likewise in fintechApps and corporate-website, while
food and art e-commerce sit below. → removed from the ban in `SKILL.md` and
above; big type is category-dependent. **Lesson: a hand count felt
authoritative and was wrong. Prefer a scripted count, and keep the evidence.**

**2026-08-31 — audit of every remaining rule.** After the 56px correction, each
quantitative claim in the skill was re-measured against the 7 local datasets
instead of trusted as written. Result: **no other rule was outright false**, but
four were stated too strongly and are now qualified with their counts.
- *Dark background* — holds everywhere: light wins **7/7** categories.
- *Desaturated photography* — holds: **37 colour vs 2 desaturated** where stated.
- *Italic keyword* (6/70), *mono type* (6/70), *huge empty sections* (6/70) —
  hold globally, but are **concentrated**: 3 of the 6 italics are longevityClinic,
  and **4 of the 6 mono faces are corporate-website (4/10 of that category)**.
  A blanket ban would be wrong there → gate 2c now carries a per-category column.
- *Slop fonts* — the honest number: **15 of 70 references use one, Inter on 10**.
  "No real site uses these" was false. The defensible claim is that **60 of 70
  carry a proprietary display face**. Rule reworded to "needs a reason", not
  "never".
- *One superfamily* — **45 two-family vs 25 single**, but single-family **wins in
  corporate-website (6-4)** and ties in longevityClinic. Softened from "no real
  brand does this".
- *Descriptive brand names* — too broad: Poster Club, Farm to People, Imperfect
  Foods, Function Health, Moneybox all describe and all work. The real target is
  the **abstract quality-noun** (Meridian, Cadence). Rewritten.
**Lesson: the first audit found a false rule; the second found true rules stated
too absolutely. Both come from writing a count from memory instead of measuring.**

**2026-09-01 — Fettle, e-bike commerce. The dash rule was over applied.**
The user had said "no hyphens in names and wording". That was read as *strip
every hyphen*, and the copy shipped with "e bike", "10 year guarantee",
"all rounder", "real world range" across 98 text nodes. Verdict: *"forse hai
evitato di mettere il - ma io intendevo solo nelle frasi in cui lo usi al posto
della virgola (tipico dell'ai)"*.
- **Banned:** a dash standing in for a comma, colon or full stop — "a bike that
  lasts — and a mechanic who comes to you". That construction is the tell.
- **Correct and required:** ordinary spelling hyphens inside compounds.
  `e-bike`, `10-year guarantee`, `real-world range`, `mid-drive`, `all-rounder`,
  `step-through`, `co-founder`. Removing them produces ungrammatical English,
  which is a worse failure than the one being avoided.
- **Still true for names:** kebab-case in dataset slugs, layer names and brand
  names stays out. camelCase or one word.
**Lesson: when a user bans a character, ask what the character was doing. The
objection was to a rhetorical tic, not to orthography. Over applying a style
rule is its own kind of slop — it produced text no native writer would write.**

**2026-09-01 — same project, components built after screens. Again.**
The home page was built screen first, then the PDP started the same way, before
the user stopped it: *"ancora una volta sei partito dal design e non dai
componenti"*. The word *ancora* is the point — this repeats across projects and
is already recorded in the vault. The recovery was to delete the half built PDP,
build the 14 masters, then retrofit the home page by replacing its ad hoc nav,
footer, newsletter, cards and stats with instances.
**Lesson: at gate 4, build the component set before the second screen exists.
One full screen for the Early Look Gate is fine, but the moment a second screen
is started, anything appearing twice must already be a component. Retrofitting
works — 161 instances survived it with zero broken links — but it is rework.**

**2026-09-01 — Kvitto, single component. Finishing skipped because the
deliverable was "just a component".** The file shipped with four empty pages, a
`COMPONENT_SET` at zero padding with its variants flush against the border, and
screens padded 72/0/72/0 so content touched the canvas edge. The user asked:
*"sistema i padding nei frame delle pagine, non lasciare pagine vuote, prepara
la cover"* — the same three things already requested on the previous project.
**Lesson: the file structure rules were written in the context of a 23 screen
system, and were silently treated as not applying to a smaller deliverable.
They apply to everything. A one component file is still opened, scrolled and
judged as an object, and a cover built from a real extract is part of the work,
not decoration on top of it.** §7.2 now says this explicitly and gate 5 checks
padding and empty pages by script.

**2026-09-02 — documentation audit. The green badge was measuring nothing.**
Not a design rejection: an audit of the repo itself, asked for alongside a
survey of the public criticism of AI design. Three findings, in ascending order
of how badly they undercut the project's own claims.

- **The CI could not have run.** A JS string literal in the `datasetTally.js`
  verdict step contained a real line break instead of `\n`, which broke the
  YAML block scalar. The workflow file had been invalid since the step was
  added, so every "passing" badge in the README was reporting on a workflow
  GitHub never parsed.
- **Five of the dataset steps were vacuous or crashing.** `data/datasets/` is
  gitignored, so on a clean checkout the loops `for d in data/datasets/*/`
  matched an unexpanded literal glob and skipped their bodies, while the steps
  that hardcoded `longevityClinic` or called `readdirSync("data/datasets")`
  threw ENOENT. The tests that asserted the two numbers this repo is proudest
  of — `light 9 | dark 1` and 7 sites above 56px — were the ones that could
  never execute. Fixed by narrowing `.gitignore` to exclude only the images
  under `data/datasets/` — 281 MB of screenshots stays out, 977 KB of
  `dataset.json` and `design.md` comes in — so the assertions now run over all
  ten real datasets. Verified by cloning to a clean tree and running every
  step, then mutation testing: corrupting a `design.md` correctly fails.
- **CONTRIBUTING asked for a PR git silently discards.** It said to open a PR
  with `dataset.json` + the `design.md` files, while `.gitignore` excluded all
  of `/data/datasets/`, so a contributor following the instructions produced an
  empty PR with no warning. The same narrowing fixes this: the documented
  workflow and the ignore rule now agree, and the counting scripts ship with
  the measured evidence they are supposed to be counting.

**Lesson: this skill's central claim is "counted, not remembered", and the
counting was never verified to run. A test that cannot execute is worse than a
missing test, because the badge argues it passed. When a rule says to measure,
measure the measurement too — and prefer a check that fails loudly when it has
nothing to check over one that quietly finds nothing to do.**

**2026-09-02 — Ledger. The dash rule was broken by the agent that wrote it.**
The file was created as `Ledger — accessible form validation kit`, and the
error summary shipped rows reading `Work email — enter an address in the right
format`. The user's verdict was three words: *"hai usato di nuovo - nel nome
del file"*. The 2026-09-01 entry in this same file already states the rule, with
the counter-example spelled out, and the `/publish-data` command repeats it. It
was still broken, on the first artefact built after writing it.

- **What went wrong:** the rule was recorded as *documentation* and never
  applied at the moment of naming. Reading a rule at gate 2a does not carry it
  to gate 4, where the strings are actually typed.
- **The fix in the work:** every pause dash became a colon, which is what the
  sentence wanted anyway — `Work email: enter an address in the right format`
  reads as a label followed by an instruction, not as a dramatic pause.
- **A thing worth knowing:** `figma.root.name = …` throws
  *"Setting the document name is currently not supported"*, and the API reports
  the document name as `"Document"` regardless. **The file name cannot be fixed
  by script — only by the user, in the Figma UI.** So getting it right at
  `create_new_file` time is the only chance you get.

**Lesson: check the name at the moment you type it, not in a later audit. The
one string this skill cannot go back and repair is the file name, so it is the
one that deserves the check most. Before calling `create_new_file`, read the
title back and ask whether any dash in it is standing in for a comma, a colon
or a full stop — and prefer a comma: `Ledger, an accessible form validation
kit`.**

**2026-09-02 — Ledger. Four corrections on one password field, and the pattern
they share.** Not a rejected design: four separate push-backs on the same
component, each one right, and none of them catchable by any script here.

- *"non mi sembra che uno possa mettere spazio nelle password"* — the technical
  rule was right (NIST requires verifiers to accept the space character) and the
  placement was wrong. It is an instruction to whoever builds the field, not
  copy for whoever fills it in. No real product writes "spaces are allowed".
- *"ma non chiedeva caratteri speciali etc?"* — the check confirmed the rule and
  found my own error underneath it: I had cited Revision 3, superseded by
  Revision 4, which raises composition rules from `SHOULD NOT` to `SHALL NOT`.
  The rule survived, the source did not.
- *"sei sicuro che la nist sia applicabile a tutto?"* — no, and this was the
  real find. NIST binds US federal work; **PCI DSS 4.0 §8.3.6 mandates the very
  composition rule NIST forbids** for anyone handling card payments. The
  standards contradict each other, and most forms in the wild follow PCI, which
  is exactly why the rule looked wrong to someone who looks at real forms.
- The number that started it, "at least 12 characters", was invented outright.

**Lesson: `nameCheck.js` and the hook catch tells of FORM — a dash, a slug, a
marketing word. They cannot catch a judgement: whether a true rule belongs in
the UI, which standard governs this client, or whether the revision you cited
is current. For those, the check is asking "which regime is this product in?"
before quoting any standard, and reading the primary source again when someone
says the rule sounds implausible. Four times out of four here, that instinct
was right and mine was wrong.** The rules now live in `data/rules/`, which
opens with the regime table rather than with the numbers.
