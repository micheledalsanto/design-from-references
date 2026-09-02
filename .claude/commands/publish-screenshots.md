---
description: Export the current design's screens as a ready to upload Figma Community carousel
argument-hint: "[optional file key or design name]"
---

Prepare the **carousel images** for the Figma Community listing of the design in
this session (or the one named here: $ARGUMENTS).

Everything lands in `figma-fields/<designName>/carousel/`, numbered in the order
they should be uploaded.

## Figma Community carousel facts

- The first image is the one people see in the gallery grid. It carries the
  click, so it must be the cover, not a detail.
- **It is read at a few hundred pixels wide, while scrolling.** Subtle
  typography, quiet composition and fine detail all vanish at that size, which
  is exactly what a well art directed cover is made of. The gallery image has a
  different job from the design: it must say **what you get**, legibly, in one
  glance. A grid of the components, the screen count, or the system name set
  large beats a beautiful hero every time. Check it by shrinking the exported
  PNG to 300px wide and looking at it. If you cannot tell what the file
  contains, reshoot it.
- Images display at **1920x960** (2:1). Anything else gets letterboxed or
  cropped, so **export at 2:1** unless the user asks otherwise.
- Aim for **6 to 10 images**. Fewer looks thin; more and nobody scrolls.

## Procedure

1. **Find the file.** Use the file key from this session. If there is none, ask
   for the URL rather than guessing.

2. **Inventory the screens.** Read the page structure with a read only
   `use_figma` script or `get_metadata`. List every top level frame per page
   with its node id, width and height.

3. **Choose the running order.** Lead with the cover, then the story:
   1. Cover
   2. The full desktop home page
   3. The signature screen — whatever carries the concept
   4. Two or three more desktop screens, picking different layout types
      (a product page, a listing, a form or checkout)
   5. A mobile group, several phone frames side by side on one canvas
   6. The component library
   7. The foundations board — palette and type
   Skip anything that repeats what an earlier image already showed.

4. **Compose each image at 2:1.** Tall screens do not fit a 2:1 frame, so build
   a presentation frame per slide rather than exporting the raw screen:
   - Create a temporary 1920x960 frame on a scratch page, filled with a colour
     from the design's own tokens.
   - Place the screen inside, scaled to fit with margin, cropping the tail of a
     long page rather than squashing it. Overlap two or three phone frames for
     the mobile slide.
   - Keep the composition quiet: the design is the subject, not the slide.
   - Do not add explanatory captions unless the user asks. Figma's own
     screenshots read as design, not as a slide deck.

5. **Export.** Screenshot each presentation frame at `maxDimension: 1920`,
   download the PNG with curl, and save as
   `figma-fields/<designName>/carousel/01_cover.png`, `02_home.png`, and so on.
   Two digit prefixes keep the upload order correct in the file picker.

6. **Clean up.** Delete every temporary frame and the scratch page. Verify with
   a read that nothing is left behind. Never leave presentation scaffolding in
   the user's design file.

7. **Write the manifest** at `figma-fields/<designName>/carousel/manifest.md`:
   for each image, the filename, which node it came from, what it shows, and its
   pixel size. Note any slide you could not produce and why.

## Verify before saying it is done

- Every file is 1920x960 and actually opens.
- The first image is the cover.
- Open at least the first and last exported PNG and **look at them**. Check for
  cropped text, a screen scaled so far down it is unreadable, or an empty frame.
- **Shrink the first image to about 300px wide and look again.** That is the
  size it is judged at in the gallery. If what the file contains is no longer
  readable, the cover is failing at its actual job however good it looks full
  size.
- The design file has no leftover temporary nodes.

Report the list of exported files with their sizes, and flag honestly anything
that looks weak enough to be worth reshooting.
