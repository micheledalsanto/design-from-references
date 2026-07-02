# Evaluation rubric

Use this to judge WebArtist outputs, compare eval runs, or critique a finished
implementation. Score each category from 1 to 5.

## Scoring scale

- **1 - Fails**: generic, incomplete, inaccessible, or not tied to the brief.
- **2 - Weak**: some intent is visible, but major issues remain.
- **3 - Acceptable**: works and fits the brief, with noticeable gaps.
- **4 - Strong**: specific, usable, accessible, and well implemented.
- **5 - Excellent**: feels inevitable for this brief; polished, complete, and
  verified with evidence.

## Categories

1. **Brief fit**: The design clearly serves the stated subject, audience,
   language, tone, and primary job.
2. **Reference integrity**: Research uses real references or real-world artifacts
   and maps observations to decisions. No fake trends or sourceless taste.
3. **Distinctiveness**: The result avoids category defaults and AI-design
   cliches without becoming confusing or decorative for its own sake.
4. **Information architecture**: Content order, hierarchy, navigation, and CTAs
   match the user's goal and expected workflow.
5. **UX quality**: Relevant UX laws are applied; choices reduce friction,
   cognitive load, uncertainty, and error.
6. **Accessibility**: WCAG basics are implemented and verified: contrast, focus,
   labels, semantics, target size, responsive zoom, and reduced motion.
7. **Completeness**: The deliverable includes the real pages, states, forms,
   metadata, responsive behavior, and edge cases implied by the scope.
8. **Implementation fit**: Code matches the existing stack, tokens, components,
   routing, naming, and formatting. No unnecessary rewrite.
9. **Responsive polish**: Mobile, tablet, and desktop layouts are intentionally
   designed, not merely allowed to wrap. Repeated components keep consistent
   control sizes, CTA alignment, and stable comparison rhythm across breakpoints.
10. **Motion design**: Motion is purposeful, traceable to references or the
   brief, and implemented with restraint. Triggers, easing, rhythm, reduced
   motion, keyboard/focus parity, and performance risk are considered and
   verified. Static pages can still score well only when the brief or context
   justifies no motion.
11. **Verification evidence**: The final answer reports what was rendered,
   measured, operated, or not possible to verify, including contrast and layout
   consistency checks, motion triggers, and reduced-motion checks when browser
   evaluation is available.

## Pass criteria

Do not call an output successful if any of these are true:

- It has no observed-to-applied mapping for new visual direction.
- It fails obvious contrast, keyboard, form-label, or mobile-navigation checks.
- Repeated components have visibly inconsistent controls, CTA alignment, target
  sizes, or comparison rhythm.
- Motion is decorative everywhere, required to access content, ignores
  `prefers-reduced-motion`, or introduces obvious jank, overflow, or layout
  shift.
- It ships a single-page fragment when the brief asked for a real site.
- It changes stack, routing, or business logic without a clear reason.
- It relies on generic placeholder copy or imagery where real content was
  available or requested.

A strong eval run should score at least 4 in brief fit, accessibility,
motion design, implementation fit, and verification evidence, with no
pass-criteria failure.
