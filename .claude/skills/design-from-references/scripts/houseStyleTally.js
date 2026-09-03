#!/usr/bin/env node
/**
 * houseStyleTally.js — regenerate gate 2c's house-style table from the corpus.
 *
 * Gate 2c bans six defaults, and each ban is justified by a count: "light wins
 * in 7/7 categories", "37 colour vs 2 desaturated", "6/70 notes mention
 * italics". Those numbers were measured once, on 2026-08-31, against 7 local
 * datasets, and then TYPED INTO PROSE.
 *
 * That is the exact failure this skill exists to prevent, applied to itself.
 * Its own lesson reads: "Prefer a scripted count over a remembered one, and
 * when you state a number in this skill, name the script that produced it."
 * A number transcribed from script output and frozen in a markdown table is a
 * remembered count with a citation. The corpus has since grown to 11
 * categories and 106 sites; four categories appear in no count.
 *
 * So the table is generated. SKILL.md carries markers, this writes between
 * them, and --check exits 1 when the prose and the corpus disagree.
 *
 * Usage:
 *   node houseStyleTally.js                 print the table
 *   node houseStyleTally.js --write         write it into SKILL.md
 *   node houseStyleTally.js --check         exit 1 if SKILL.md is out of date
 *   node houseStyleTally.js --dataset-root <dir>
 *
 * Exit codes: 0 ok · 1 SKILL.md is stale (--check) · 2 bad usage / no corpus
 *
 * NOTE: this cannot run in CI. The corpus is gitignored by policy, so the
 * check is local and deliberate: run it after building or extending a dataset.
 */
'use strict';

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { findDatasetRoot, surveyRoot } = require('./datasetRoot.js');
const { SLOP_FONTS } = require('./datasetTally.js');

const BEGIN = '<!-- houseStyleTally:begin -->';
const END = '<!-- houseStyleTally:end -->';
const SKILL_MD = path.resolve(__dirname, '..', 'SKILL.md');

// A mono face is the tell gate 2c watches for. Match the word, plus the
// families that are mono without saying so.
const MONO = /\bmono\b|courier|consolas|menlo|iosevka|input\s|operator\smono/i;

function parseArgs(argv) {
  const a = { root: null, write: false, check: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--dataset-root') a.root = argv[++i];
    else if (v === '--write') a.write = true;
    else if (v === '--check') a.check = true;
    else { console.error(`unknown argument: ${v}`); process.exit(2); }
  }
  return a;
}

function runJson(script, category, root) {
  const out = execFileSync(process.execPath, [
    path.join(__dirname, script), category, '--dataset-root', root, '--json',
  ], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(out);
}

/** Read every countable category once, through the scripts that already measure. */
function gather(root) {
  const { usable, broken } = surveyRoot(root);
  const categories = [];
  for (const name of usable) {
    categories.push({
      name,
      tally: runJson('datasetTally.js', name, root),
      scan: runJson('designNotesScan.js', name, root),
    });
  }
  return { categories, broken };
}

const rowOf = (tally, label) => tally.rows.find((r) => r.label === label) || { buckets: '', verdict: '' };
const dimOf = (scan, key) => scan.dimensions.find((d) => d.key === key) || { counts: {}, known: 0, unknown: 0 };

/** "light 9 | dark 1" -> {light: 9, dark: 1} */
function parseBuckets(buckets) {
  const out = {};
  for (const m of String(buckets).matchAll(/([a-z][a-z ]*?)\s+(\d+)(?:\s*\||$)/gi)) {
    out[m[1].trim()] = Number(m[2]);
  }
  return out;
}

function measure(categories) {
  const perCategory = [];
  let colour = 0, desaturated = 0, italics = 0, italicBy = {};
  let monoSites = 0, monoBy = {}, slopSites = 0, slopFontCount = {};
  let twoFamily = 0, singleFamily = 0;
  let sites = 0;

  for (const c of categories) {
    sites += c.tally.sites;

    const bg = parseBuckets(rowOf(c.tally, 'BACKGROUND').buckets);
    perCategory.push({ name: c.name, sites: c.tally.sites, light: bg.light || 0, dark: bg.dark || 0 });

    const photo = dimOf(c.scan, 'PHOTOGRAPHY').counts || {};
    for (const [k, v] of Object.entries(photo)) {
      // "none" means the site uses no photography. Counting it as colour
      // inflated the colour column by every photo-free site.
      if (/^none$/i.test(k)) continue;
      if (/desatur|black|b&w|monochrom/i.test(k)) desaturated += v; else colour += v;
    }

    const ital = dimOf(c.scan, 'ITALIC DISPLAY');
    const italYes = Object.entries(ital.counts || {})
      .filter(([k]) => /yes|present|true/i.test(k))
      .reduce((s, [, v]) => s + v, 0);
    if (italYes) { italics += italYes; italicBy[c.name] = italYes; }

    // Fonts: "DM Sans x4, Fruitiger x2, ..." -> per-face site counts.
    const fonts = String(rowOf(c.tally, 'FONTS').buckets);
    let catMono = 0, catSlop = 0;
    for (const m of fonts.matchAll(/([^,]+?)\s*x(\d+)/g)) {
      const face = m[1].trim(), n = Number(m[2]);
      if (MONO.test(face)) catMono += n;
      if (SLOP_FONTS.some((sf) => face.toLowerCase().includes(sf))) {
        catSlop += n;
        slopFontCount[face] = (slopFontCount[face] || 0) + n;
      }
    }
    if (catMono) { monoSites += catMono; monoBy[c.name] = catMono; }
    slopSites += catSlop;

    const pair = parseBuckets(rowOf(c.tally, 'TYPE PAIRING').buckets);
    twoFamily += pair['two families'] || 0;
    singleFamily += pair['single family'] || 0;
  }

  const lightWins = perCategory.filter((p) => p.light > p.dark).length;
  const topSlop = Object.entries(slopFontCount).sort((a, b) => b[1] - a[1])[0];
  const concentrate = (by) => Object.entries(by).sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${v}`).join(', ') || '(none)';

  return {
    categories: perCategory.length, sites, perCategory,
    lightWins,
    bgCounts: perCategory.map((p) => `${p.light}-${p.dark}`).join(', '),
    colour, desaturated,
    italics, italicBy: concentrate(italicBy),
    monoSites, monoBy: concentrate(monoBy),
    slopSites, topSlop: topSlop ? `${topSlop[0]} on ${topSlop[1]}` : '(none)',
    twoFamily, singleFamily,
  };
}

function render(m) {
  const today = new Date().toISOString().slice(0, 10);
  const L = [];
  L.push(BEGIN);
  L.push(`<!-- generated by scripts/houseStyleTally.js -- do not edit by hand -->`);
  L.push('');
  L.push(`Measured on ${today} by \`houseStyleTally.js\` across **${m.categories} categories,`);
  L.push(`${m.sites} sites**. Regenerate with \`node <skill root>/scripts/houseStyleTally.js --write\``);
  L.push('after building or extending any dataset; `--check` exits 1 when this table');
  L.push('and the corpus disagree.');
  L.push('');
  L.push('| Banned by default | Measured across the corpus | Watch out |');
  L.push('| --- | --- | --- |');
  L.push(`| dark / near-black background | light wins in **${m.lightWins}/${m.categories}** categories (${m.bgCounts}) | never the majority anywhere; check the per-category count before treating it as absolute |`);
  L.push(`| fully desaturated or B&W photography | **${m.colour} colour vs ${m.desaturated} desaturated** where the notes state it | sites with no photography at all are excluded from both columns |`);
  L.push(`| italicised keyword in a headline | **${m.italics}/${m.sites}** notes put italics in a display context | concentrated in: ${m.italicBy} — where it is a category convention it is not a tell. Italic *pull quotes* are excluded: they are a typographic norm, not this tell |`);
  L.push(`| mono type for "technical" flavour | **${m.monoSites}/${m.sites}** sites have a measured mono face | concentrated in: ${m.monoBy} — do NOT ban it there |`);
  L.push(`| slop-flagged font | **${m.slopSites}/${m.sites}** sites use one (most common: ${m.topSlop}) | measured does not mean safe, but "no real site uses these" is false — it needs a reason, not a ban |`);
  L.push(`| single type family | **${m.twoFamily} two-family vs ${m.singleFamily} single** | single-family wins in some categories; count yours |`);
  L.push('');
  L.push('**Not counted, and deliberately absent from the table:** *huge empty sections*');
  L.push('and *abstract / brutalist architecture photography*. No phrase in the notes');
  L.push('measures either reliably, so there is no number to quote — judge them on the');
  L.push('screenshots and do not invent one. The rejection that put the second on the');
  L.push('list was a B&W concrete corridor in a *medical* context: an image with no');
  L.push('narrative function.');
  L.push(END);
  return L.join('\n');
}

function spliceInto(text, block) {
  const i = text.indexOf(BEGIN), j = text.indexOf(END);
  if (i === -1 || j === -1) return null;
  return text.slice(0, i) + block + text.slice(j + END.length);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = findDatasetRoot(args.root);
  const { categories, broken } = gather(root);

  if (!categories.length) {
    console.error(`no countable category under ${root} — nothing to measure.`);
    if (broken.length) for (const b of broken) console.error(`  ${b.name} -- ${b.why}`);
    process.exit(2);
  }

  const m = measure(categories);
  const block = render(m);

  if (broken.length) {
    console.error(`warning: ${broken.length} directory/directories not counted:`);
    for (const b of broken) console.error(`  ${b.name} -- ${b.why}`);
    console.error('');
  }

  if (args.check || args.write) {
    const text = fs.readFileSync(SKILL_MD, 'utf8');
    const updated = spliceInto(text, block);
    if (updated === null) {
      console.error(`SKILL.md has no ${BEGIN} / ${END} markers — cannot ${args.check ? 'check' : 'write'}.`);
      process.exit(2);
    }
    if (args.check) {
      if (updated === text) { console.log(`house-style table is current (${m.categories} categories, ${m.sites} sites).`); return; }
      console.error('SKILL.md house-style table does not match the corpus.');
      console.error(`The corpus now holds ${m.categories} categories and ${m.sites} sites.`);
      console.error('Run: node <skill root>/scripts/houseStyleTally.js --write');
      process.exit(1);
    }
    fs.writeFileSync(SKILL_MD, updated, 'utf8');
    console.log(`written into ${SKILL_MD} (${m.categories} categories, ${m.sites} sites).`);
    return;
  }

  console.log(block);
}

if (require.main === module) main();
module.exports = { measure, render, gather, BEGIN, END };
