---
description: Produce every field Figma Community asks for when publishing the current design file
argument-hint: "[optional file key or design name]"
---

Produce the **complete set of publication fields** for the Figma Community
"Publish your file to Community" dialog, filled in for the design in this
session (or the one named here: $ARGUMENTS).

Write the result to `figma-fields/<designName>/publishData.md` and also print it
in the chat so the user can copy each field straight into the dialog.

**Also write the long fields as plain text files next to it** — `name.txt`,
`description.txt`, `tags.txt`. The user pastes from these, not from the
markdown.

**Hard wrapping breaks the paste.** Do not wrap the description at 70 or 80
columns for tidiness: every one of those newlines becomes a real line break in
Figma's field and the text arrives ragged. Each paragraph must be **one
unbroken line**, however long, with blank lines between paragraphs. Use plain
capitals for internal headings, since the field has no markdown.

## Where the facts come from

Never invent the numbers. Read them from the work that exists:

- **The Figma file** — page names, screen count, component count, variable
  collection. Use `get_metadata`, or a read only `use_figma` script that walks
  `figma.root.children`.
- **The dataset** — `data/datasets/<category>/dataset.json` for the number of
  references studied and the category name.
- **The constraints file** — `<tmp>/<category>-constraints.md` for the counted
  verdicts worth quoting as evidence.
- **The copy deck**, if one was produced, for the brand's own wording.

If a fact is not available, say so in the output rather than guessing.

## The fields to produce

### Step 1 — Describe your resource

**Name** *(required, max 100 characters)*
The brand or system name plus what it is. Count the characters and print the
count. Do not use a dash as a pause in place of a comma: that construction
reads as AI generated. Ordinary spelling hyphens are correct and expected
("e-bike", "10-year guarantee").

**Description** *(required)*
Write it in three parts, in plain sentences, no marketing inflation:
1. What the file contains — screens, components, pages, desktop and mobile.
2. What is distinctive about the design and *why it was chosen*, citing the
   measured evidence (e.g. "light ground because 8 of 10 references use one").
3. What someone can do with it — remix, restyle, use as a commerce blueprint.
Mention accessibility if the contrast gate was run, with the standard met.
Keep it scannable: short paragraphs, no wall of text, no emoji.

**Includes** *(pick only what is true)*
Options are: Code · Motion · Draw · Shader Effects · Shader Fills · Prototype.
Only tick a box if the file genuinely contains it. Check before claiming
Prototype — if no interactions were wired, do not tick it. State which ones
apply and which do not, so the user does not over claim.

**Category** *(required, one path)*
The menu is two levels. Top level: Apps · Design inspirations · Design
templates · Design tools · Education · Icon Packs · Libraries · Presentation
templates · Print · Social media · Software development · Visual assets ·
Website templates.
Submenus seen so far — Design templates: Calendar · Data · Mobile app ·
Portfolio · Resume · Other. Visual assets: Device mockups · Fonts &
typography · Illustrations library · Shapes & colors · Stock photography ·
Zoom backgrounds · Other.
Recommend **one** path and give the reason in a sentence. If a second path is
defensible, name it as the alternative. For a multi screen ecommerce design the
usual fit is *Website templates*; for a component library it is *Libraries*.

### Step 2 — Set a thumbnail
State which frame should be the thumbnail and why, with its node id and page.
The cover frame is normally the answer. Figma's thumbnail is 1920x960.

### Step 3 — Add the final details
Produce, and label clearly:
- **Tags** — 8 to 12, lowercase, no hyphens, mixing the category, the sector,
  the screen types and the technique. Order them most relevant first.
- **Creator / attribution** notes, if any assets need crediting. **Always list
  the photographers** of any stock images used, with the source, since
  Unsplash and Pexels ask for credit even when it is not legally required.
- **Fonts used**, so the user can confirm licensing before publishing.
- **A licensing warning** whenever the file embeds photographs or fonts the
  user does not own.

## Output rules

- **Never use a dash as a pause** in place of a comma, colon or full stop.
  "A bike that lasts — and a mechanic who comes to you" is the AI tell the
  user rejects. Rewrite with a comma or split the sentence.
  Spelling hyphens inside compound words are correct and must be kept:
  e-bike, 10-year guarantee, real-world range, mid-drive, all-rounder.
  Write numeric ranges with "to" ("55 to 60 km"), not with a dash.
- Every claim must be checkable in the file. If you write "23 screens", the
  count must come from the file, not from memory.
- End with a short **Pre publication checklist**: anything unfinished that
  would embarrass the user once public (placeholder copy, unlicensed photos,
  detached instances, empty pages, missing thumbnail).

## What actually gets duplicated

Community reach does not reward the best design, it rewards the most
**reusable** file. People browsing there are looking for something to duplicate
and bend to their own work, not something to admire. A finished, branded,
self contained design is a painting offered to a market that buys tools. Fill
the fields with that in mind.

**Name it for search, not for the brand.** Nobody searches "Otava". They search
"wellness landing page template". Keep both: the brand name earns the file its
identity, the descriptive half earns it the impressions. `Wellness Landing Page
— Otava UI Kit` works; `Otava` alone does not. The searchable words belong in
the first half, since the grid truncates long names.

**Lead the description with what the file gives away.** Screen count, component
count, variable collections, what is remixable. The creative thesis is the
second paragraph, not the first: it explains why the file is good, but the
counts are why someone opens it.

**Choose the category by how the file will be used, not by what it depicts.**
A set of patterns for one recurring problem belongs under *Libraries* or
*Design templates*, where people go shopping, far more than under *Design
inspirations*, where people go browsing and leave. If the file could plausibly
sit in either, prefer the one where visitors arrive intending to duplicate.

**Tags are queries.** Every tag should be a phrase someone would actually type
into the Community search box. Sector, artefact type and screen type all get
searched; invented brand words and mood words do not.

**Reframe the file if it is really a kit.** Before filling any field, ask what a
stranger would take from it. If the answer is "a set of patterns for a problem
every designer has to solve", say that in the name and the description instead
of presenting it as a showcase of one brand. State the reframing in the output
so the user can accept or reject it.

**Say when the file is the wrong shape.** If the design is a single finished
brand with nothing extractable, publishing it will not travel far, and the
honest note is worth more than optimistic field copy. Say it plainly, once, and
still produce the best fields available.

## Reach depends on things this command cannot do

Include these as a short closing note, so the user knows the fields are only
half the job:

- **The thumbnail decides most of it.** It is seen at a few hundred pixels wide
  in a fast scrolling grid, where subtle typography and quiet composition
  disappear. It has to state what you get, not how it feels: the component
  grid, the screen count, the system name set large. See `/publish-screenshots`.
- **The first 48 hours are seeded from outside.** The Community amplifies what
  is already moving; it rarely starts the movement. A file posted and left alone
  stays still. The push comes from X, LinkedIn, r/FigmaDesign, design
  newsletters.
- **Timing:** Tuesday to Thursday, US morning (15:00 to 17:00 Italian time).
  Weekends are dead.
