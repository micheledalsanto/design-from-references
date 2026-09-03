#!/usr/bin/env node
/**
 * originalityCheck.js — gate 2.5, the one gate that had no enforcement.
 *
 * The Originality Engine is called "the heart" and is 36 lines of prose with
 * six requirements. Every other major gate in this skill has something that
 * exits 1: 2a has datasetTally, 4a-bis has nameCheck plus a PreToolUse hook,
 * 4c has constraintsCheck, 5 has design-verifier. 2.5 had nothing but a
 * reminder, in a repo whose most expensive lesson is that prose gates get
 * skipped -- "non mi sembra tu faccia constraint ma solo idee e poi le ignori".
 *
 * WHAT THIS CANNOT DO: judge whether a thesis is any good, whether a territory
 * is genuinely distinct, or whether a signature is beautiful. No script can.
 * WHAT IT DOES: refuse to let the gate be skipped, half-filled or filled with
 * placeholders, and put the answers on record where the internal critic at 3.9
 * and the user can both read them.
 *
 * Usage:
 *   node originalityCheck.js --file <originality.json> [--mode fast|standard|studio]
 *
 * Exit codes: 0 complete · 1 incomplete · 2 bad usage
 */
'use strict';

const fs = require('fs');

// The seven dimensions anti-copy distance may be measured on (gate 2.5 §3).
// A free-text dimension would let "it just feels different" count as distance.
const DIMENSIONS = [
  'hero composition', 'section rhythm', 'visual metaphor', 'navigation logic',
  'image treatment', 'signature interaction', 'typographic hierarchy',
];

// Explicitly not a signature, per gate 2.5 §4.
const NOT_A_SIGNATURE = [
  /\bgradients?\b/i, /\brounded\s+cards?\b/i, /\bbig(ger)?\s+(font|type)\b/i,
  /\bstock\s+hero\b/i, /\bdrop\s+shadows?\b/i, /\bglassmorphism\b/i,
];

// Text that means the field was not really filled in.
const PLACEHOLDER = /^\s*$|^(tbd|todo|n\/?a|\.{3}|lorem|placeholder|xxx)\b|\[(concept|visual system|effect)\]/i;

function parseArgs(argv) {
  const a = { file: null, mode: 'standard' };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--file') a.file = argv[++i];
    else if (v === '--mode') a.mode = String(argv[++i] || '').toLowerCase();
    else { console.error(`unknown argument: ${v}`); process.exit(2); }
  }
  return a;
}

// Two thresholds on purpose. A description needs room to say something; a name
// does not -- "Plumbline" is nine characters and is a perfectly good one.
const ok = (s, min) => typeof s === 'string' && s.trim().length >= min && !PLACEHOLDER.test(s);
const filled = (s) => ok(s, 12);   // prose: concept, description, reason
const named = (s) => ok(s, 3);     // a label

function check(doc, mode) {
  const problems = [];
  const fail = (rule, detail) => problems.push({ rule, detail });

  // 1. Creative thesis, in the mandatory sentence form.
  const thesis = doc.thesis;
  if (!filled(thesis)) {
    fail('thesis', 'missing, too short, or still holding the template placeholders');
  } else if (!/built\s+around\s+the\s+idea\s+of\s+.+expressed\s+through\s+.+to\s+make\s+users\s+(feel|understand)\s+.+/is.test(thesis)) {
    fail('thesis', 'does not follow the mandatory form: "This interface is built around the idea of '
      + '[concept], expressed through [visual system], to make users feel/understand [effect]."');
  }

  // 2. Territories. Fast mode explores one on purpose; everything else needs three.
  const wanted = mode === 'fast' ? 1 : 3;
  const territories = Array.isArray(doc.territories) ? doc.territories : [];
  if (territories.length < wanted) {
    fail('territories', `${territories.length} given, ${wanted} required in ${mode} mode`);
  }
  territories.forEach((t, i) => {
    const where = `territory ${i + 1}${t && t.name ? ` ("${t.name}")` : ''}`;
    if (!t || !named(t.name)) fail('territories', `${where}: no usable name`);
    if (!t || !filled(t.concept)) fail('territories', `${where}: no concept`);
    // "What it breaks" is the field that makes a territory a direction rather
    // than a mood board. Three territories that break nothing are one territory.
    if (!t || !filled(t.breaks)) fail('territories', `${where}: does not say what it BREAKS`);
  });
  const names = territories.map((t) => (t && t.name ? String(t.name).trim().toLowerCase() : ''));
  if (new Set(names.filter(Boolean)).size !== names.filter(Boolean).length) {
    fail('territories', 'two territories share a name');
  }

  // 3. One is chosen, and it is one of the ones listed.
  if (!named(doc.chosen)) fail('chosen', 'no territory chosen');
  else if (names.length && !names.includes(String(doc.chosen).trim().toLowerCase())) {
    fail('chosen', `"${doc.chosen}" is not one of the territories listed (${names.filter(Boolean).join(', ')})`);
  }
  if (!filled(doc.chosenBecause)) fail('chosen', 'the choice is not justified (chosenBecause)');

  // 4. Anti-copy distance: at least three named dimensions, from the fixed list.
  const distance = Array.isArray(doc.antiCopyDistance) ? doc.antiCopyDistance : [];
  const normalised = distance.map((d) => String(d).trim().toLowerCase());
  const unknown = normalised.filter((d) => !DIMENSIONS.includes(d));
  if (normalised.length < 3) {
    fail('antiCopyDistance', `${normalised.length} dimension(s) named, at least 3 required`);
  }
  if (unknown.length) {
    fail('antiCopyDistance', `not a recognised dimension: ${unknown.join(', ')}. `
      + `Choose from: ${DIMENSIONS.join(', ')}`);
  }
  if (new Set(normalised).size !== normalised.length) {
    fail('antiCopyDistance', 'the same dimension is listed twice');
  }

  // 5. A signature that is not one of the things explicitly disqualified.
  const sig = doc.signature || {};
  if (!named(sig.name) || !filled(sig.description)) {
    fail('signature', 'missing a name or a description');
  } else {
    const text = `${sig.name} ${sig.description}`;
    const banned = NOT_A_SIGNATURE.filter((re) => re.test(text));
    if (banned.length) {
      fail('signature', 'gate 2.5 rules these out as signatures: a generic gradient, rounded '
        + 'cards, a big font, a stock hero. Found: ' + banned.map((re) => String(re).replace(/[/\\bi]|\(.*?\)/g, '').trim()).join(', '));
    }
  }

  // 6. Make It Less Expected: five defaults named, at least three replaced.
  const defaults = Array.isArray(doc.defaults) ? doc.defaults : [];
  if (defaults.length < 5) fail('defaults', `${defaults.length} AI defaults listed, 5 required`);
  const replaced = defaults.filter((d) => d && filled(d.replacedWith));
  if (replaced.length < 3) {
    fail('defaults', `${replaced.length} of them replaced, at least 3 required`);
  }

  return problems;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.file) {
    console.error('usage: node originalityCheck.js --file <originality.json> [--mode fast|standard|studio]');
    process.exit(2);
  }
  if (!['fast', 'standard', 'studio'].includes(args.mode)) {
    console.error(`unknown mode "${args.mode}" — expected fast, standard or studio`);
    process.exit(2);
  }
  if (!fs.existsSync(args.file)) { console.error(`file not found: ${args.file}`); process.exit(2); }

  let doc;
  try { doc = JSON.parse(fs.readFileSync(args.file, 'utf8')); }
  catch (err) { console.error(`does not parse as JSON: ${err.message}`); process.exit(2); }

  const problems = check(doc, args.mode);

  console.log(`ORIGINALITY ENGINE — gate 2.5 · ${args.mode} mode`);
  console.log('='.repeat(72));
  if (!problems.length) {
    console.log('complete. Every requirement is on record.');
    console.log('');
    console.log('This checks that the work was DONE, not that it was good. Whether the');
    console.log('thesis earns its sentence and the territories are genuinely distinct is');
    console.log('still yours and the user\'s to judge — show them before building.');
    return;
  }
  const byRule = {};
  for (const p of problems) (byRule[p.rule] ||= []).push(p.detail);
  for (const [rule, details] of Object.entries(byRule)) {
    console.log(`\n${rule}:`);
    for (const d of details) console.log(`  - ${d}`);
  }
  console.log(`\n${problems.length} requirement(s) unmet. Gate 2.5 is blocking: fill them in and re-run.`);
  process.exit(1);
}

if (require.main === module) main();
module.exports = { check, DIMENSIONS, NOT_A_SIGNATURE };
