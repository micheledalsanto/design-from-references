#!/usr/bin/env node
/**
 * Contrast audit WCAG 2.x — gate di accessibilità del sistema design-from-references.
 * Uso:
 *   node contrast.js "#ffffff" "#0b0b0b"            -> una coppia
 *   node contrast.js "#fff:#000" "#6b78ff:#0b0b0b"  -> piu' coppie fg:bg
 * Hex a 3 o 6 cifre, "#" opzionale.
 * Verdetto: testo normale >=4.5, testo large/UI >=3, altrimenti FAIL.
 * Exit code: 1 se almeno una coppia e' FAIL, 2 se l'input non e' valido.
 */
"use strict";

function parseHex(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.replace(/./g, (c) => c + c);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function L(rgb) { return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]); }
function ratio(fg, bg) {
  const a = L(fg), b = L(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function verdict(r) { return r >= 4.5 ? "PASS (testo)" : r >= 3 ? "solo large/UI" : "FAIL"; }

module.exports = { parseHex, ratio, verdict, L };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Uso: node contrast.js "#fg:#bg" ["#fg:#bg" ...]  |  node contrast.js "#fg" "#bg"');
    process.exit(2);
  }
  const pairs = args.length === 2 && !args[0].includes(":")
    ? [args]
    : args.map((a) => a.split(":"));
  let fail = false;
  for (const [fgHex, bgHex] of pairs) {
    const fg = parseHex(fgHex), bg = parseHex(bgHex);
    if (!fg || !bg) {
      console.error(`Input non valido: "${fgHex}:${bgHex}" — atteso hex 3 o 6 cifre (es. "#6b78ff:#0b0b0b")`);
      process.exit(2);
    }
    const r = ratio(fg, bg);
    const v = verdict(r);
    if (v === "FAIL") fail = true;
    console.log(`${fgHex} su ${bgHex} = ${r.toFixed(2)}:1  ${v}`);
  }
  process.exit(fail ? 1 : 0);
}
