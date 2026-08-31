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

**Be honest about what the data says** *(measured across the 7 bundled datasets,
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
quantitative claim in the skill was re-measured against the 7 bundled datasets
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
