# Run log — what each rule cost

One entry per run that was rejected or corrected. Split out of `antiSlop.md`
because that file is loaded at gate 2a to decide type, palette and naming,
and 180 lines of history rode along with the rules every time.

**Read this when a rule looks arbitrary** — every one of them is here with the
run that produced it. **Append to it after any rejected or corrected run:** this
file ships with the skill, a session does not.

Format: date · what was chosen · what the user said · what the count was · what
changed in the skill.


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
  never execute. Fixed *at the time* by narrowing `.gitignore` to exclude only
  the images under `data/datasets/` — 281 MB of screenshots stays out, 977 KB
  of `dataset.json` and `design.md` comes in — so the assertions ran over all
  ten real datasets. Verified by cloning to a clean tree and running every
  step, then mutation testing: corrupting a `design.md` correctly fails.
  **This was reverted the next day, and the revert is the 2026-09-03 entry
  below — the narrowing is what destroyed the corpus.** CI now counts against
  `test/fixtures/datasets/`, one category committed on purpose.
- **CONTRIBUTING asked for a PR git silently discards.** It said to open a PR
  with `dataset.json` + the `design.md` files, while `.gitignore` excluded all
  of `/data/datasets/`, so a contributor following the instructions produced an
  empty PR with no warning. *(Settled the other way on 2026-09-03: nothing in
  `data/datasets/` is committable, and dataset contributions go through an
  issue. The instruction and the ignore rule agree again, in the opposite
  direction.)*

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

**2026-09-03 — the corpus was half destroyed, and the skill kept counting.**
A cleanup pass, not a design run. Ten of the eleven categories in
`data/datasets/` held screenshots and nothing else: every `dataset.json` and
all 98 `design.md` files were gone. `datasetTally.js` and `designNotesScan.js`
— gate 2a, the blocking one, the one this whole skill rests on — could not run
on 10 of 11 categories. Only `formValidation` worked.

- **The cause was yesterday's fix.** The 2026-09-02 entry above narrowed
  `.gitignore` so the measured text became *tracked*. A history rewrite then
  took the tracked half and left the ignored half behind. Screenshots survive a
  rewrite precisely because git does not know about them.
- **Why nobody noticed.** Asked for a missing category, the tally answered
  `available: <every directory under the root>` — including the ten that had
  lost their data. The error read like a typo in the category name. A script
  that lists directories and calls them datasets cannot report a dataset loss.
- **Recovered** from a dangling commit (`git fsck --lost-found`), 110 files,
  all eleven categories, which the next `git gc` would have pruned.
- **Found on the way out:** the `ITALIC KEYWORD` dimension had matched
  **nothing in 106 sites**. It was scoped to the Type section and required the
  phrase "italic keyword", while the notes write "centered italic serif
  headline overlay" in their hero prose. The `6/70` quoted in gate 2c came from
  a hand grep; the script had never reproduced it. Fixed, it now finds 6 — with
  3 in longevityClinic, the exact three the 2026-08-31 entry names.

**Lesson: this file already says "prefer a scripted count over a remembered
one". The deeper version is that a count is only as durable as the corpus under
it, and a gitignored corpus has no backup by definition — so the thing that
proves every rule here was the only thing nothing was protecting. Two habits
came out of it. A tool must never present a broken input as a valid choice: the
list of what you can count and the list of directories are not the same list.
And when a number in this skill cannot be regenerated by running something,
treat it as folklore until it can — `houseStyleTally.js` now generates gate
2c's table, and `--check` fails when the prose and the corpus disagree.**
