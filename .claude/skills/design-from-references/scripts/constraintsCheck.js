#!/usr/bin/env node
/**
 * constraintsCheck.js — hold the built design against the counted verdicts.
 *
 * The constraints file is called binding. Nothing enforced it. `design-verifier`
 * checks the RENDER -- clipping, overflow, contrast, truncation -- so a design
 * on a dark background in a 9-1 light category passed every gate in this skill
 * as long as it rendered cleanly. That is precisely the 2026-08-18 rejection:
 * "completely black site, super AI slop", built from 1 reference out of 10.
 *
 * The count happened at gate 2a, the choice happened at gate 3, and no step
 * compared them. This is that step.
 *
 * Usage:
 *   node constraintsCheck.js --constraints <file.md> --build <build.json>
 *
 * build.json describes what you ACTUALLY built:
 *   {
 *     "background": "#faf9f6",          page/section background
 *     "fonts": ["Söhne", "GT Sectra"],  every family shipped
 *     "accent": "#1f6b48"               the accent colour (optional)
 *   }
 *
 * Verdicts:
 *   HONOURED  the build agrees with the majority
 *   DEVIATED  it disagrees AND the constraints file has a Deviations row for
 *             that dimension -- the documented, agreed escape hatch
 *   VIOLATED  it disagrees with nothing written down. Exit 1.
 *
 * Exit codes: 0 nothing violated · 1 at least one violation · 2 bad usage
 */
'use strict';

const fs = require('fs');
const path = require('path');
const runManifest = require('./runManifest.js');

const { parseHex, L } = require('./contrast.js');
const { SLOP_FONTS } = require('./datasetTally.js');

function parseArgs(argv) {
  const a = { constraints: null, build: null };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--constraints') a.constraints = argv[++i];
    else if (v === '--build') a.build = argv[++i];
    else { console.error(`unknown argument: ${v}`); process.exit(2); }
  }
  return a;
}

/** Split a markdown row, honouring the \| escapes datasetTally writes. */
function cells(line) {
  return line
    .replace(/^\s*\|/, '').replace(/\|\s*$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, '|').trim());
}

function parseConstraints(text) {
  const verdicts = {};
  const deviations = new Set();
  let section = null;
  for (const line of text.split('\n')) {
    if (/^##\s/.test(line)) {
      section = /measured verdicts/i.test(line) ? 'verdicts'
        : /deviations/i.test(line) ? 'deviations' : null;
      continue;
    }
    if (!section || !/^\s*\|/.test(line)) continue;
    const c = cells(line);
    if (c.length < 3 || /^-+$/.test(c[1]) || /^dimension$/i.test(c[0])) continue;
    if (section === 'verdicts') {
      // Four columns since strength was added; three in files written before.
      // Read both, so an older constraints file still checks (as NORM, the
      // behaviour it had when it was written).
      const hasStrength = c.length >= 4;
      verdicts[c[0].toUpperCase()] = {
        counted: c[1],
        strength: hasStrength ? c[2].toUpperCase().replace(/[^A-Z]/g, '') : '',
        verdict: hasStrength ? c[3] : c[2],
      };
    }
    // A Deviations row counts only when a dimension is actually named. The
    // template ships one empty row; an empty row excuses nothing.
    else if (section === 'deviations' && c[0]) deviations.add(c[0].toUpperCase());
  }
  return { verdicts, deviations };
}

/** WCAG relative luminance, the same function the accessibility gate uses. */
function isLight(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  return L(rgb) > 0.5;
}

function hueOf(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (!d) return null; // achromatic: no hue to place in a band
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h = Math.round(h * 60);
  return h < 0 ? h + 360 : h;
}

function checkBackground(v, build) {
  if (!v || build.background === undefined) return null;
  const wants = /\bLIGHT\b/i.test(v.verdict) ? 'light' : /\bDARK\b/i.test(v.verdict) ? 'dark' : null;
  if (!wants) return null;
  const light = isLight(build.background);
  if (light === null) return { state: 'SKIPPED', detail: `could not parse background "${build.background}"` };
  const got = light ? 'light' : 'dark';
  return got === wants
    ? { state: 'HONOURED', detail: `${build.background} is ${got}, majority says ${wants} (${v.counted})` }
    : { state: 'FAILED', detail: `${build.background} is ${got}, but the count says ${wants} (${v.counted})` };
}

function checkFonts(v, build) {
  if (!v || !Array.isArray(build.fonts) || !build.fonts.length) return null;
  const flagged = build.fonts.filter((f) => SLOP_FONTS.some((sf) => String(f).toLowerCase().includes(sf)));
  return flagged.length
    ? { state: 'FAILED', detail: `slop-flagged font shipped: ${flagged.join(', ')}` }
    : { state: 'HONOURED', detail: `no slop-flagged family in ${build.fonts.join(', ')}` };
}

function checkTypePairing(v, build) {
  if (!v || !Array.isArray(build.fonts) || !build.fonts.length) return null;
  const wantsTwo = /two/i.test(v.verdict);
  const distinct = new Set(build.fonts.map((f) => String(f).toLowerCase())).size;
  const gotTwo = distinct >= 2;
  if (wantsTwo === gotTwo) {
    return { state: 'HONOURED', detail: `${distinct} famil${distinct === 1 ? 'y' : 'ies'}, majority says ${wantsTwo ? 'two' : 'single'} (${v.counted})` };
  }
  return { state: 'FAILED', detail: `${distinct} famil${distinct === 1 ? 'y' : 'ies'}, but the count says ${wantsTwo ? 'pair two' : 'single family'} (${v.counted})` };
}

function checkAccent(v, build) {
  if (!v || !build.accent) return null;
  const free = [...String(v.verdict).matchAll(/(\d+)-(\d+)deg/g)].map((m) => [Number(m[1]), Number(m[2])]);
  if (!free.length) return null;
  const h = hueOf(build.accent);
  if (h === null) return { state: 'SKIPPED', detail: `${build.accent} has no hue (achromatic) — nothing to place` };
  const inFree = free.some(([lo, hi]) => h >= lo && h <= hi);
  return inFree
    ? { state: 'HONOURED', detail: `accent ${build.accent} sits at ${h}deg, inside a free zone` }
    // Not a violation on its own: an occupied band is a crowding warning, not a
    // majority being overruled. Say it, do not fail on it.
    : { state: 'CROWDED', detail: `accent ${build.accent} sits at ${h}deg, a band the references already occupy — ${v.verdict}` };
}

const CHECKS = [
  ['BACKGROUND', checkBackground],
  ['FONTS', checkFonts],
  ['TYPE PAIRING', checkTypePairing],
  ['ACCENT HUES', checkAccent],
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.constraints || !args.build) {
    console.error('usage: node constraintsCheck.js --constraints <file.md> --build <build.json>');
    process.exit(2);
  }
  for (const [label, f] of [['constraints', args.constraints], ['build', args.build]]) {
    if (!fs.existsSync(f)) { console.error(`${label} file not found: ${f}`); process.exit(2); }
  }

  const { verdicts, deviations } = parseConstraints(fs.readFileSync(args.constraints, 'utf8'));
  if (!Object.keys(verdicts).length) {
    console.error(`no "## Measured verdicts (binding)" table in ${args.constraints} — is this a constraints file?`);
    process.exit(2);
  }

  let build;
  try { build = JSON.parse(fs.readFileSync(args.build, 'utf8')); }
  catch (err) { console.error(`build file does not parse: ${err.message}`); process.exit(2); }

  console.log(`CONSTRAINTS CHECK — ${path.basename(args.constraints)}`);
  console.log('='.repeat(72));

  let violations = 0, checked = 0;
  for (const [dimension, fn] of CHECKS) {
    const result = fn(verdicts[dimension], build);
    if (!result) continue;
    checked++;
    const strength = (verdicts[dimension] || {}).strength || '';
    let state = result.state;
    let tag;
    if (state === 'FAILED') {
      if (strength === 'OPEN' || strength === 'THIN') {
        // Nothing to violate. The references disagree, so there is no majority
        // being overruled -- and this is exactly where the design is supposed
        // to spend its difference. Treating it as a violation is what pushed
        // every output onto the category mean.
        state = 'FREE';
        tag = `FREE CHOICE (the references are ${strength === 'OPEN' ? 'split' : 'too thin'} here — no majority to overrule)`;
      } else {
        // A documented, agreed deviation is the legitimate path. An
        // undocumented one is the thing that got a design deleted.
        state = deviations.has(dimension) ? 'DEVIATED' : 'VIOLATED';
        if (state === 'VIOLATED') violations++;
        tag = state === 'DEVIATED'
          ? 'DEVIATED (recorded in the Deviations table)'
          : `VIOLATED (${strength || 'majority'})`;
      }
    } else {
      tag = strength && state === 'HONOURED' ? `${state} (${strength})` : state;
    }
    console.log(`${dimension.padEnd(16)} ${tag}`);
    console.log(`${''.padEnd(16)} ${result.detail}`);
  }

  if (!checked) {
    console.error('\nnothing could be checked: the build file describes none of the counted dimensions.');
    console.error('expected some of: background, fonts, accent');
    process.exit(2);
  }

  console.log('');
  if (violations) {
    console.log(`${violations} verdict(s) VIOLATED.`);
    console.log('Either change the build to match the count, or agree the deviation with');
    console.log('the user and record it in the Deviations table of the constraints file.');
    console.log('"More distinctive" is not a reason.');
    process.exit(1);
  }
  runManifest.record('4c', { checked, violations: 0, build: args.build });
  console.log(`${checked} dimension(s) checked, nothing violated.`);
}

if (require.main === module) main();
module.exports = { parseConstraints, cells, isLight, hueOf, CHECKS };
