---
description: Write image generation prompts for the current design, traceable to its measured art direction
argument-hint: "[optional: screen or slot name, e.g. hero, or a design name]"
---

Produce **ready to paste prompts for an image generation model** covering the
image slots of the design in this session (or the one named here: $ARGUMENTS).

Write them to `figma-fields/<designName>/imagePrompts.md` and print them in the
chat. Each prompt must be **one unbroken line** so it survives a paste into a
chat box, with the slot name and the reasoning kept **outside** the prompt.

## The prompts come from the design, not from your taste

This command exists inside a repo whose whole argument is that measured
evidence beats invention. A prompt written from a general idea of what looks
good produces exactly the images the anti-slop rules reject. So read, in order:

1. **`<tmp>/<category>-constraints.md`** — the counted verdicts. The background
   lightness, the accent hue and the free hue bands are binding on the imagery
   too: a photograph whose dominant colour lands in the crowded category hue
   fights the palette that was chosen to avoid it.
2. **The `design.md` of the cluster's sites**, specifically what
   `designNotesScan.js` reports for **PHOTOGRAPHY** and **PHOTO SUBJECT**. If
   the count says colour, do not write a black-and-white prompt. If it says
   `unknown`, open the screenshots and look before writing anything.
3. **§3.5 Image Art Direction** in `references/plan-and-gates.md` — subject,
   framing, colour treatment, realism, relationship to the thesis, what to
   avoid.
4. **The creative thesis and the signature element.** Every image either
   carries the thesis or earns its place another way; if it does neither, cut
   the slot instead of writing a prompt for it.

If any of these is missing, say so and produce prompts only for the slots you
can ground. **Do not invent art direction to fill the gap.**

## Ask first whether the image should be generated at all

Generation is not the default. Before writing prompts, state which slots are
better served otherwise, and why:

- **A real photograph** of a real place, product or person → `image-sourcer`
  (Unsplash/Pexels, free, attributable). Generated people and generated food
  read as fake, and a design comp that fakes a customer's face is a claim about
  a person who does not exist.
- **A proprietary graphic** — pattern, geometric mark, grain, a built UI mock →
  build it in Figma. §3.5 prefers these over stock, and they are usually more
  distinctive than anything a model returns.
- **Generation genuinely wins** for: abstract textures and backgrounds,
  editorial illustration in a stated style, conceptual imagery with no real
  referent, product shots of a product that does not exist yet, and
  placeholders whose licensing must be unambiguous.

Print this triage as a short table before the prompts. A command that returns
twelve prompts when four slots needed a real photo has done the wrong job well.

## What each prompt must carry

Write for a current image model (Midjourney, Firefly, Imagen, DALL·E). Each
prompt is one line, in English, and names:

1. **Subject**, concretely. Not "a person working" but what, where, doing what.
2. **Shot and framing** — lens, distance, angle, where the crop falls. Say if
   there must be **negative space for text**, and on which side.
3. **Light** — direction, quality, time of day. This is what separates a
   photograph from a render more than any other single word.
4. **Palette, tied to the tokens.** Name the actual hexes from the constraints
   file, and name the hue band to stay out of. Colour is the easiest way for a
   generated image to fight a measured palette.
5. **Treatment** — the same one across every slot, per §3.5. Never raw.
6. **Aspect ratio and the size the design needs**, from the Figma frame, not
   guessed.
7. **What to avoid**, as an explicit negative: the clichés §7 of `antiSlop.md`
   names — "diverse group around a laptop in an impossibly well lit office",
   abstract 3D blobs, smooth symmetrical AI illustration, purple to blue
   gradients, glassmorphism, neon glow.

## Format the output like this

For every slot:

```
SLOT        hero, home desktop, 1440x720
WHY         carries the thesis: <one line>
INSTEAD?    generate | source a real photo | build it in Figma
PROMPT      <one unbroken line, ready to paste>
NEGATIVE    <one line, if the tool takes a separate negative field>
ALT TEXT    <the alt text the design needs, written now, not later>
```

`ALT TEXT` is not optional. The CHI research on LLM generated interfaces found
that `alt="image"` and other semantically empty attributes are the accessibility
failure that survives everything else, and an alt written months later by
somebody else is how that happens. Write it while you know what the image is
for.

## After the images come back

Close the loop rather than leaving the user with a folder:

- Say which slot each file belongs to and at what size.
- Upload with the **`upload_assets`** MCP tool, not `figma.createImageAsync`,
  which `use_figma` does not support.
- Apply the shared treatment and **verify by eye on a screenshot**: an `IMAGE`
  fill with a broken hash passes a structural check and renders empty. §3.5
  calls this blocking, and it is.
- Note in the file's documentation page that the image is **generated**, with
  the model used. A design that mixes generated and sourced imagery without
  saying which is which cannot be licensed or defended later.

## Rules for the prompt text itself

- **Never a dash standing in for a comma, colon or full stop.** Run
  `node <skill root>/scripts/nameCheck.js "<the prompt>"` and fix anything it
  rejects. Ordinary spelling hyphens stay.
- No brand names, no living artists, no "in the style of <studio>". Describe the
  qualities instead: a prompt that names a photographer is asking the model to
  copy a person's work.
- No real people's faces for testimonials or team photos. If the design needs a
  face, it needs a real, licensed, attributed one.
- State the aspect ratio in the tool's own syntax where it has one, e.g. `--ar
  16:9` for Midjourney, and say which tool the syntax is for.
