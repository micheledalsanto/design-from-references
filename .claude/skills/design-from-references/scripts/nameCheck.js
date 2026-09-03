#!/usr/bin/env node
/**
 * nameCheck.js — refuses a name that carries the AI tells this user rejects.
 *
 * Written because prose did not work. The dash ban was recorded in
 * antiSlop.md on 2026-09-01, repeated in the /publish-data command, and then
 * broken twice: once in a Figma file name, once in the copy inside it. A rule
 * you have to remember is not a constraint, it is a suggestion. This exits 1,
 * so it can sit in front of create_new_file and in CI.
 *
 * Usage:
 *   node nameCheck.js "Ledger, an accessible form validation kit"
 *   node nameCheck.js --file path.txt      check every line
 *   echo "..." | node nameCheck.js -
 *
 * Exit codes: 0 clean · 1 violation found · 2 bad usage
 */
'use strict';

// A dash flanked by spaces is standing in for a comma, colon or full stop.
// A hyphen INSIDE a word (e-bike, 10-year, all-rounder) is ordinary spelling
// and must survive: over-applying the ban produced ungrammatical copy once
// already ("e bike", "real world range"), which is its own kind of slop.
const PAUSE_DASH = /(^|\s)[-\u2010\u2011\u2012\u2013\u2014\u2015](\s|$)/;
// Kebab-case means a SLUG: three or more hyphenated parts. Two-part compounds
// are ordinary English spelling (real-world, mid-drive, all-rounder,
// 10-year) and banning them produced ungrammatical copy on Fettle. Flag
// only what is genuinely a machine slug.
const KEBAB      = /\b[a-z0-9]+(?:-[a-z0-9]+){2,}\b/;

const SLOP_WORDS = [
  'seamless', 'seamlessly', 'unlock', 'elevate', 'revolutionise', 'revolutionize',
  'best-in-class', 'best in class', 'cutting edge', 'cutting-edge',
  'all-in-one', 'all in one', 'empower', 'empowering', 'scale without limits',
  'game changer', 'game-changer', 'supercharge', 'effortless',
];

// The abstract quality-noun register — §4 of antiSlop.md. This is the tell the
// form checks above cannot see: "Meridian" has no dash, no slug and no
// marketing verb, and was still rejected on sight along with Baseline, Cadence
// and Ledger.
//
// NOT a ban on describing the product. Poster Club, Farm to People, Imperfect
// Foods, Moneybox and Function Health all describe, and all work, because they
// name a THING in plain language. What is flagged is the other register: an
// abstract noun gesturing at a quality, which could belong to any company in
// any sector — which is exactly the failure.
const ABSTRACT_REGISTER = [
  'meridian', 'cadence', 'baseline', 'apex', 'vertex', 'nexus', 'axiom', 'ethos',
  'lumen', 'aura', 'vantage', 'summit', 'beacon', 'compass', 'anchor', 'pillar',
  'keystone', 'haven', 'vista', 'zenith', 'quantum', 'catalyst', 'momentum',
  'velocity', 'clarity', 'tempo', 'prism', 'spectrum', 'paragon', 'pinnacle',
  'verity', 'lucid', 'nova', 'astra', 'aether', 'solace', 'kindred', 'ascend',
  'elevate', 'thrive', 'flourish', 'endeavour', 'endeavor', 'venture', 'legacy',
  'horizon', 'threshold', 'foundation', 'cornerstone', 'benchmark', 'caliber',
  'calibre', 'accord', 'covenant', 'emblem', 'insignia', 'parallel', 'axis',
];

/**
 * The shape of a name, for comparing against the ones already shipped.
 *
 * The catalogue here is Otava, Tirage, Firn, Fettle, Kvitto, Lumo, Threshold,
 * Ledger, Plumbline — and six of the nine are a single foreign word of four to
 * six letters. That is a better formula than "Meridian", and it is still a
 * formula. A house style is only invisible from inside the house.
 */
function shapeOf(name) {
  const clean = String(name).trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const letters = clean.replace(/[^A-Za-z]/g, '').length;
  return {
    words: words.length,
    band: letters <= 4 ? 'short' : letters <= 7 ? 'mid' : 'long',
    endsVowel: /[aeiou]$/i.test(clean),
  };
}
// Word count and length only. Adding the vowel ending to the comparison split
// the catalogue too finely to see its own pattern: "Vello" matched 4 of the 9
// and slipped under the threshold, when one-word-and-short IS the formula.
// The vowel ending is reported as detail, not used to separate.
const sameShape = (a, b) => a.words === b.words && a.band === b.band;

function check(name) {
  const problems = [];
  const m = PAUSE_DASH.exec(name);
  if (m) {
    problems.push({
      rule: 'pause-dash',
      found: JSON.stringify(m[0]),
      why: 'a dash standing in for a comma, colon or full stop is the AI tell',
      fix: 'use a comma or a colon: "Ledger, an accessible form validation kit"',
    });
  }
  const k = KEBAB.exec(name);
  if (k) {
    problems.push({
      rule: 'kebab-case',
      found: k[0],
      why: 'hyphenated slugs in a name read as machine generated',
      fix: 'camelCase or one word',
    });
  }
  const lower = name.toLowerCase();
  for (const w of SLOP_WORDS) {
    if (lower.includes(w)) {
      problems.push({ rule: 'slop-word', found: w, why: 'named in every published critique of AI copy', fix: 'say the specific thing instead' });
      break;
    }
  }
  return problems;
}

/**
 * Judgement-level checks. Kept apart from check() on purpose: the PreToolUse
 * hook must only ever block on tells of FORM, which are certain. Whether a word
 * is the wrong register for THIS product is a call the script can raise but
 * must not make -- so these surface as warnings, and only --strict turns them
 * into a failing exit.
 *
 * @param {string} name
 * @param {string[]} catalogue names already shipped, for the house-formula check
 */
function judge(name, catalogue = []) {
  const warnings = [];
  const bare = String(name).toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/).filter(Boolean);

  const abstract = bare.find((w) => ABSTRACT_REGISTER.includes(w));
  if (abstract) {
    warnings.push({
      rule: 'abstract-register',
      found: abstract,
      why: 'an abstract noun gesturing at a quality — the register every generator '
        + 'defaults to. Meridian, Baseline, Cadence and Ledger were all rejected on sight',
      fix: 'name a THING in the product\'s own world instead: the tool, the material, '
        + 'the unit, the process, the trade word, the place. Tirage is a print run, '
        + 'Firn is granular snow, Kvitto is a receipt, a plumbline finds true vertical. '
        + 'Test: would this name fit three competitors in the same sector? Then it is not a name',
    });
  }

  if (catalogue.length >= 3) {
    const mine = shapeOf(name);
    const alike = catalogue.filter((c) => sameShape(shapeOf(c), mine));
    if (alike.length / catalogue.length >= 0.5) {
      warnings.push({
        rule: 'house-formula',
        found: `${alike.length}/${catalogue.length} already share this shape (${alike.join(', ')})`,
        why: 'the escape from AI naming became its own formula. A house style is only '
          + 'invisible from inside the house',
        fix: 'change the shape, not just the word: more than one word, a different length, '
          + 'a different ending. A real name does not have to be a short exotic noun',
      });
    }
  }

  return warnings;
}

function main() {
  let argv = process.argv.slice(2);

  // --strict promotes the judgement warnings to failures; --against <file>
  // supplies the names already shipped, as a JSON array or one per line.
  const strict = argv.includes('--strict');
  argv = argv.filter((a) => a !== '--strict');
  let catalogue = [];
  const ai = argv.indexOf('--against');
  if (ai !== -1) {
    const p = argv[ai + 1];
    if (!p) { console.error('--against needs a path'); process.exit(2); }
    if (!require('fs').existsSync(p)) { console.error(`--against file not found: ${p}`); process.exit(2); }
    const raw = require('fs').readFileSync(p, 'utf8').trim();
    try {
      const parsed = JSON.parse(raw);
      catalogue = Array.isArray(parsed) ? parsed.map(String)
        : Array.isArray(parsed.names) ? parsed.names.map(String) : [];
    } catch { catalogue = raw.split('\n').map((l) => l.trim()).filter(Boolean); }
    argv.splice(ai, 2);
  }

  if (!argv.length) {
    console.error('usage: node nameCheck.js "<name>" [--strict] [--against <names.json>] | --file <path> | -');
    process.exit(2);
  }
  let names = [];
  if (argv[0] === '--file') {
    if (!argv[1]) { console.error('--file needs a path'); process.exit(2); }
    names = require('fs').readFileSync(argv[1], 'utf8').split('\n').filter((l) => l.trim());
  } else if (argv[0] === '-') {
    names = require('fs').readFileSync(0, 'utf8').split('\n').filter((l) => l.trim());
  } else {
    names = [argv.join(' ')];
  }

  let bad = 0, warned = 0;
  const show = (label, items) => {
    for (const p of items) console.log(`        ${label} ${p.rule}: found ${p.found}\n          why: ${p.why}\n          fix: ${p.fix}`);
  };
  for (const name of names) {
    const problems = check(name);
    const warnings = judge(name, catalogue);
    if (!problems.length && !warnings.length) { console.log(`ok    ${name}`); continue; }
    if (problems.length) bad++; else warned++;
    console.log(`${problems.length ? 'FAIL' : 'WARN'}  ${name}`);
    show('', problems);
    show('(judgement)', warnings);
  }
  if (bad) { console.log(`\n${bad} name(s) rejected. Fix them before creating anything.`); process.exit(1); }
  if (warned) {
    console.log(`\n${warned} name(s) carry a judgement warning.`);
    if (strict) { console.log('--strict: treating these as failures.'); process.exit(1); }
    console.log('Not blocking: whether a register is wrong for THIS product is your call and');
    console.log('the user\'s. Answer it out loud rather than ignoring it, or re-run --strict.');
  }
  process.exit(0);
}

if (require.main === module) main();
module.exports = { check, judge, shapeOf, PAUSE_DASH, KEBAB, SLOP_WORDS, ABSTRACT_REGISTER };
