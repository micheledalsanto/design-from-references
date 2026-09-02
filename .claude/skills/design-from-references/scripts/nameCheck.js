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

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length) {
    console.error('usage: node nameCheck.js "<name>" | --file <path> | -');
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

  let bad = 0;
  for (const name of names) {
    const problems = check(name);
    if (!problems.length) { console.log(`ok    ${name}`); continue; }
    bad++;
    console.log(`FAIL  ${name}`);
    for (const p of problems) console.log(`        ${p.rule}: found ${p.found}\n          why: ${p.why}\n          fix: ${p.fix}`);
  }
  if (bad) { console.log(`\n${bad} name(s) rejected. Fix them before creating anything.`); process.exit(1); }
  process.exit(0);
}

if (require.main === module) main();
module.exports = { check, PAUSE_DASH, KEBAB, SLOP_WORDS };
