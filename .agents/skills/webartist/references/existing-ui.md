# Existing UI protocol

Use this when the user asks to improve, redesign, polish, fix, or extend an
interface that already exists in the repo.

## 1. Audit before direction

Do not start from a blank aesthetic. First inspect:

- Framework, routing, build system, component library, tokens, and CSS approach.
- Current page structure, breakpoints, nav behavior, forms, states, and data
  dependencies.
- Rendered screenshots at mobile and desktop if browser tools are available.
- Brand assets, real copy, imagery, and conventions already present.
- Regressions the user did not ask for: changed routes, broken states, removed
  content, invalid forms, altered business logic.

Summarize the constraints to preserve before proposing changes.

## 2. Choose change depth

- **Polish**: improve spacing, hierarchy, contrast, focus, responsive behavior,
  or copy without changing the information architecture.
- **Targeted redesign**: change one surface (hero, pricing, dashboard header,
  card system, form) while preserving surrounding patterns.
- **System refresh**: adjust tokens/components shared by multiple screens only
  when the request or codebase clearly supports it.
- **Full redesign**: use only when explicitly requested. Treat this as new
  direction and run the full WebArtist loop.

## 3. Research narrowly

For existing UI, research the part being changed, not the whole category by
default. A dashboard chart, mobile menu, pricing comparison, contact form, or
portfolio project card each needs its own reference sample.

Use references to solve the current weakness:

- unclear hierarchy -> information architecture and scan patterns
- generic visual style -> type, spacing, imagery, distinctive device
- low trust -> proof, specificity, error states, real content
- poor conversion -> CTA placement, progressive disclosure, form friction
- accessibility risk -> focus, labels, contrast, target size, motion

## 4. Patch incrementally

- Keep the current framework and file organization.
- Reuse existing tokens/components before adding new ones.
- Avoid broad rewrites when a scoped CSS/component change solves the issue.
- Preserve semantic HTML, ARIA behavior, validation, analytics hooks, and data
  loading.
- Make before/after differences easy to inspect in the diff.

## 5. Verify against the original UI

Compare old vs new at the relevant breakpoints. Confirm:

- The requested issue improved.
- No existing workflow regressed.
- Navigation, forms, dialogs, toggles, tabs, and responsive states still work.
- Contrast, focus, target sizes, reduced motion, and text wrapping pass.
- The result still belongs to the product rather than looking like a pasted-on
  template.
