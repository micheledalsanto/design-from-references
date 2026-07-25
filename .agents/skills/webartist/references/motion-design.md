# Motion design

Use motion as part of the design concept, not as a finish layer. Good motion
does one of four jobs:

- **Orient**: show where a user is, where content came from, or what changed.
- **Respond**: make controls feel tactile through hover, focus, press, drag, or
  state transitions.
- **Reveal**: guide attention through a story, section, or data change.
- **Brand**: create a memorable signature move tied to the subject and
  references.

If a motion moment does none of these, remove it.

## Research motion from references

When inspecting references, capture motion as concretely as color and type:

- Trigger: load, scroll, hover, focus, click, drag, pointer, time, route change.
- Elements: what moves and what deliberately stays still.
- Spatial logic: direction, origin, distance, parallax layers, masking, depth.
- Timing: approximate duration, delay, stagger, rhythm, settle.
- Easing: snappy, elastic, mechanical, slow editorial, instant utility.
- Fallback: what happens with reduced motion or on weaker devices.
- Risk: vestibular discomfort, scroll hijack, unreadable text, layout shift,
  pointer-only affordance, CPU/GPU cost.

Add at least one motion row to the observed-to-applied mapping for new visual
direction unless the brief explicitly asks for a static experience.

## Motion map

Before coding motion, write a compact table:

| Moment | Purpose | Trigger | Elements | Duration/ease | Fallback | Risk |
| --- | --- | --- | --- | --- | --- | --- |
| Hero signal field | Brand signature | pointer + idle | canvas nodes | continuous, low amplitude | static drawing | distraction/perf |
| Section reveal | Orient reading flow | scroll into view | section heading + image | 320ms ease-out | visible immediately | generic fade |
| Button press | Respond | pointer/focus/active | button transform/shadow | 120ms ease-out | color/focus only | tiny target |

The table is a planning aid, not a required format in final answers. The final
answer should summarize only the motion decisions that matter.

## Patterns that usually work

- Use **CSS transitions** for hover, focus, pressed, selected, open/closed, and
  small state changes.
- Use **CSS keyframes** for simple loops that are decorative and pausable by
  reduced motion.
- Use **Web Animations API** when JavaScript needs to coordinate a short
  transition or cancel/reverse it.
- Use **IntersectionObserver** for scroll reveals. Reveal meaningful blocks, not
  every card in a uniform cascade.
- Use **canvas/WebGL/Three.js** only when the visual idea needs a generated or
  spatial scene. Verify it renders nonblank and has a static fallback.
- Use **route/page transitions** only when they preserve orientation. Never delay
  navigation just to show an effect.

## Rules

- Tie motion to a reference, the subject's world, or a usability need.
- Animate `transform` and `opacity` before layout properties.
- Keep travel distance small for UI feedback; save large movement for deliberate
  narrative moments.
- Stagger sparingly. Universal staggered fade-ins are a common AI-design tell.
- Do not hide essential content until animation runs.
- Do not require hover for information or action. Mirror meaningful hover states
  with focus states.
- Do not hijack native scroll, trap the wheel, or make the page impossible to
  skim.
- Disable, simplify, or reduce amplitude for `prefers-reduced-motion: reduce`.
- Consider disabling heavy parallax/canvas/WebGL on mobile or low-power devices.
- Use `will-change` sparingly and remove it when not needed.
- Avoid continuous motion near body text unless it is extremely subtle.

## CSS baseline

```css
:root {
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --motion-fast: 120ms;
  --motion-med: 280ms;
  --motion-slow: 640ms;
}

.button {
  transition:
    transform var(--motion-fast) var(--ease-out),
    background-color var(--motion-fast) linear,
    box-shadow var(--motion-fast) var(--ease-out);
}

.button:hover,
.button:focus-visible {
  transform: translateY(-1px);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Verification

When browser automation is available:

- Screenshot or inspect the loaded state at mobile, tablet, and desktop.
- Operate the triggers: hover/focus/active, open/close, scroll reveal, route
  transition, drag, pointer field, canvas/WebGL scene.
- Emulate `prefers-reduced-motion: reduce`; confirm motion stops, becomes
  subtle, or renders a static equivalent.
- Confirm no essential content is invisible before animation.
- Confirm no horizontal overflow or layout shift is introduced by animated
  states.
- For canvas/WebGL/Three.js, verify rendered pixels are nonblank and framed
  correctly. If the scene moves, verify it still respects reduced motion.
- Watch for jank manually if no performance profiler is available; visible
  stutter, delayed input, or mobile heat/perf risk means simplify.
