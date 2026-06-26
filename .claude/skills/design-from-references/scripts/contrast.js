#!/usr/bin/env node
/**
 * Contrast audit WCAG 2.x — gate di accessibilità del sistema design-from-references.
 * Uso:
 *   node contrast.js "#ffffff" "#0b0b0b"            -> una coppia
 *   node contrast.js "#fff:#000" "#6b78ff:#0b0b0b"  -> piu' coppie fg:bg
 * Verdetto: testo normale >=4.5, testo large/UI >=3, altrimenti FAIL.
 * Exit code 1 se almeno una coppia e' FAIL (utile come gate in script).
 */
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function L(hex) {
  const h = hex.replace("#", "");
  return 0.2126 * lin(parseInt(h.slice(0, 2), 16)) +
         0.7152 * lin(parseInt(h.slice(2, 4), 16)) +
         0.0722 * lin(parseInt(h.slice(4, 6), 16));
}
function ratio(fg, bg) { const hi = Math.max(L(fg), L(bg)), lo = Math.min(L(fg), L(bg)); return (hi + 0.05) / (lo + 0.05); }

function verdict(r) { return r >= 4.5 ? "PASS (testo)" : r >= 3 ? "solo large/UI" : "FAIL"; }

import { pathToFileURL } from "node:url";
export { ratio, verdict, L };

// CLI (robusto cross-platform)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const pairs = [];
  if (args.length === 2 && !args[0].includes(":")) pairs.push([args[0], args[1]]);
  else for (const a of args) { const [fg, bg] = a.split(":"); pairs.push([fg, bg]); }
  let fail = false;
  for (const [fg, bg] of pairs) {
    const r = ratio(fg, bg);
    const v = verdict(r);
    if (v === "FAIL") fail = true;
    console.log(`${fg} su ${bg} = ${r.toFixed(2)}:1  ${v}`);
  }
  process.exit(fail ? 1 : 0);
}
