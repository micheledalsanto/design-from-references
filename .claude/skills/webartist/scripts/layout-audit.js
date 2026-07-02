/*
 * WebArtist — layout audit.
 * Runs in the page context: paste into devtools, or run via Playwright
 * `page.evaluate(...)`.
 *
 * It catches visual-system issues that contrast checks miss:
 * - horizontal page overflow
 * - undersized interactive targets
 * - repeated groups whose CTAs differ in height or baseline
 * - repeated groups with large height variance
 *
 * Optional:
 *   window.webartistLayoutConfig = {
 *     groups: [
 *       { name: 'pricing', item: '.plan', cta: '.button', heightTolerance: 2, baselineTolerance: 2 }
 *     ]
 *   }
 */
(() => {
  const round = (n) => Math.round(n * 100) / 100;
  const text = (el) => (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const rectFor = (el) => {
    const r = el.getBoundingClientRect();
    return {
      top: round(r.top),
      right: round(r.right),
      bottom: round(r.bottom),
      left: round(r.left),
      width: round(r.width),
      height: round(r.height),
    };
  };

  const config = window.webartistLayoutConfig || {};
  const groups = config.groups || [
    { name: "pricing cards", item: ".plan", cta: ".button" },
    { name: "cards", item: ".card", cta: "a, button" },
    { name: "tiles", item: ".tile", cta: "a, button" },
  ];
  const heightTolerance = config.heightTolerance ?? 2;
  const baselineTolerance = config.baselineTolerance ?? 2;

  const page = {
    viewportWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
  };

  const effectiveTargetRect = (el) => {
    const s = getComputedStyle(el);
    if (Number(s.opacity) === 0) {
      const label = el.closest("label");
      if (label) return rectFor(label);
    }
    return rectFor(el);
  };

  const interactive = Array.from(
    document.querySelectorAll(
      'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [tabindex]:not([tabindex="-1"])'
    )
  )
    .filter((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" && r.width > 0 && r.height > 0;
    })
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      label: text(el) || el.getAttribute("aria-label") || "",
      rect: effectiveTargetRect(el),
    }));

  const smallTargets = interactive.filter((item) => item.rect.width < 24 || item.rect.height < 24);

  const groupResults = groups
    .map((group) => {
      const items = Array.from(document.querySelectorAll(group.item));
      if (items.length < 2) return null;

      const itemRects = items.map((item) => ({ label: text(item), rect: rectFor(item) }));
      const itemHeights = itemRects.map((item) => item.rect.height);
      const itemHeightDelta = Math.max(...itemHeights) - Math.min(...itemHeights);

      const ctas = items
        .map((item) => item.querySelector(group.cta))
        .filter(Boolean)
        .map((cta) => ({ label: text(cta) || cta.getAttribute("aria-label") || "", rect: rectFor(cta) }));

      const ctaHeights = ctas.map((cta) => cta.rect.height);
      const ctaBottoms = ctas.map((cta) => cta.rect.bottom);
      const ctaHeightDelta = ctaHeights.length ? Math.max(...ctaHeights) - Math.min(...ctaHeights) : 0;
      const ctaBaselineDelta = ctaBottoms.length ? Math.max(...ctaBottoms) - Math.min(...ctaBottoms) : 0;
      const groupHeightTolerance = group.heightTolerance ?? heightTolerance;
      const groupBaselineTolerance = group.baselineTolerance ?? baselineTolerance;

      return {
        name: group.name,
        itemSelector: group.item,
        ctaSelector: group.cta,
        itemCount: items.length,
        ctaCount: ctas.length,
        itemHeightDelta: round(itemHeightDelta),
        ctaHeightDelta: round(ctaHeightDelta),
        ctaBaselineDelta: round(ctaBaselineDelta),
        passes: {
          ctaHeights: ctaHeightDelta <= groupHeightTolerance,
          ctaBaselines: ctaBaselineDelta <= groupBaselineTolerance,
        },
        items: itemRects,
        ctas,
      };
    })
    .filter(Boolean);

  const fails = {
    horizontalOverflow: page.horizontalOverflow,
    smallTargets,
    repeatedGroups: groupResults.filter((group) => !group.passes.ctaHeights || !group.passes.ctaBaselines),
  };

  return { page, smallTargets, repeatedGroups: groupResults, fails };
})();
