#!/usr/bin/env node
/**
 * datasetTally.js — gate 2a: COUNT BEFORE YOU CHOOSE.
 *
 * Reads data/datasets/<category>/dataset.json and prints a fixed-schema tally
 * of what the references actually do, then writes a constraints file the later
 * gates MUST re-read before fixing tokens, fonts and page architecture.
 *
 * Two kinds of rows:
 *   [measured] derived from dataset.json fields — trustworthy, auto-counted.
 *   [by eye]   NOT in the JSON: open the desktop screenshots and count them
 *              yourself, then fill the rows in the constraints file.
 *
 * Usage:
 *   node datasetTally.js <category> [--cluster "<label>"] [--dataset-root <dir>]
 *                        [--out <path>]
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const a = { category: null, cluster: null, root: null, out: null, json: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--cluster') a.cluster = argv[++i];
    else if (v === '--dataset-root') a.root = argv[++i];
    else if (v === '--out') a.out = argv[++i];
    else if (v === '--json') a.json = true;
    else if (!v.startsWith('--') && !a.category) a.category = v;
  }
  return a;
}

const { findDatasetRoot, reportMissing } = require('./datasetRoot.js');

// --- colour helpers ---------------------------------------------------------
function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

function relLuminance(rgb) {
  const [r, g, b] = rgb.map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hueSat(rgb) {
  const [r, g, b] = rgb.map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Fonts repeatedly flagged as "AI slop" — see references/antiSlop.md.
// Being measured in the dataset does NOT clear a font from this list.
const SLOP_FONTS = [
  'inter', 'poppins', 'manrope', 'figtree', 'outfit', 'sora', 'dm sans',
  'playfair', 'cormorant', 'spectral', 'ibm plex', 'space mono',
  'jetbrains mono', 'space grotesk', 'geist', 'satoshi', 'general sans',
];

// Dimensions the JSON cannot answer: they must be counted on the screenshots.
const EYE_ROWS = [
  ['HERO COMPOSITION', 'photo-led / type-led / product-led'],
  ['PHOTOGRAPHY', 'full colour / desaturated / B&W / none'],
  ['PHOTO SUBJECT', 'real people / places / product / abstract'],
  ['HEADLINE SIZE', 'above ~56px / at or below ~56px'],
  ['TEXT ALIGNMENT', 'left / centred'],
  ['ITALIC KEYWORD IN HEADLINE', 'yes / no'],
  ['SHOWS PRODUCT UI', 'yes / no'],
  ['BIG NUMERIC STATS', 'yes / no'],
  ['PRESS / CLIENT LOGOS', 'yes / no'],
  ['COMPARISON TABLE', 'yes / no'],
  ['CUSTOMER FACES', 'yes / no'],
  // Geometry: the most cited NON-typographic tell of generated design is one
  // radius, one padding and one shadow on every surface. dataset.json records
  // no geometry, so these are by-eye rows fed by designNotesScan.js, which
  // reads whatever the prose happens to state and says unknown otherwise.
  ['CORNER RADIUS', 'sharp 0-4px / soft 5-16px / round >16px / pill'],
  ['SURFACE TREATMENT', 'flat-borderless / bordered / shadowed'],
  ['RADIUS UNIFORMITY', 'single value / varied by role'],
];

function tallyRow(label, buckets, verdict, note, strength) {
  return { label, buckets, verdict, note: note || '', strength: strength || '' };
}

/**
 * How hard is this majority?
 *
 * `light 9 | dark 1` and `two families 5 | single family 5` were both reported
 * as "the majority", with the same authority, and the skill said "follow the
 * majority" to both. They are not the same fact. One is a law of the category;
 * the other is the category telling you it has no opinion.
 *
 * Collapsing the two is what makes every output converge on the category mean:
 * conforming where the references are genuinely split buys no safety, and
 * spends the one budget a design has for being itself.
 *
 *   LAW   >= 80% of the sites that stated it agree — deviating reads as a mistake
 *   NORM  60-79% — deviating needs a reason
 *   OPEN  < 60%, or a tie — the references disagree, so this is FREE. Spend it here.
 */
function strengthOf(top, stated) {
  if (!stated || stated < 3) return 'THIN';
  const share = top / stated;
  if (share >= 0.8) return 'LAW';
  if (share >= 0.6) return 'NORM';
  return 'OPEN';
}

// Datasets record fonts either as a bare family ("Fruitiger") or as a whole CSS
// stack ("DM Sans, sans-serif"). Keep only the first family, minus quotes.
function normalizeFont(raw) {
  const first = String(raw).split(',')[0].trim().replace(/^["']|["']$/g, '');
  return first;
}
// Generic fallbacks are not a type choice — never count them as a family.
const GENERIC_FAMILIES = new Set([
  'sans-serif', 'serif', 'monospace', 'system-ui', 'ui-sans-serif',
  'ui-serif', 'ui-monospace', 'cursive', 'fantasy', 'inherit', 'none',
]);

function buildRows(sites, n) {
  const rows = [];

  // 1. Background lightness — the dimension that sank the first Otava build.
  let light = 0, dark = 0, unknownBg = 0;
  for (const s of sites) {
    const rgb = hexToRgb(s.bg);
    if (!rgb) { unknownBg++; continue; }
    if (relLuminance(rgb) >= 0.5) light++; else dark++;
  }
  const bgKnown = light + dark;
  let bgVerdict;
  if (bgKnown < 3) {
    bgVerdict = `TOO FEW MEASURED (${bgKnown}) — extend the dataset with dataset-builder before trusting this`;
  } else if (light === dark) {
    bgVerdict = 'SPLIT — decide explicitly and say why';
  } else {
    bgVerdict = light > dark ? 'LIGHT' : 'DARK';
  }
  rows.push(tallyRow(
    'BACKGROUND [measured]',
    `light ${light} | dark ${dark}${unknownBg ? ` | unknown ${unknownBg}` : ''}`,
    bgVerdict,
    'The base surface token must match this verdict.',
    strengthOf(Math.max(light, dark), bgKnown)
  ));

  // 2. Accent hue occupancy — a crowded hue is the category cliche.
  const hues = [];
  for (const s of sites) {
    const rgb = hexToRgb(s.accent);
    if (!rgb) continue;
    const { h, s: sat } = hueSat(rgb);
    if (sat >= 15) hues.push({ hue: h });
  }
  const buckets12 = new Array(12).fill(0);
  hues.forEach((x) => { buckets12[Math.floor(x.hue / 30) % 12]++; });
  const occupied = buckets12.map((c, i) => (c ? `${i * 30}-${i * 30 + 29}deg x${c}` : null)).filter(Boolean);
  const free = buckets12.map((c, i) => (c ? null : `${i * 30}-${i * 30 + 29}deg`)).filter(Boolean);
  rows.push(tallyRow(
    'ACCENT HUES [measured]',
    occupied.join(' ') || '(no saturated accents)',
    free.length ? `FREE ZONES: ${free.join(' ')}` : 'ALL ZONES TAKEN — differentiate on saturation/depth',
    'Prefer a free zone over the crowded category hue.'
  ));

  // 3. Measured fonts, flagged against the slop list.
  const fontCount = new Map();
  for (const s of sites) {
    for (const role of ['display', 'body', 'mono']) {
      const f = s.fonts && s.fonts[role];
      if (!f) continue;
      const key = normalizeFont(f);
      if (!key || GENERIC_FAMILIES.has(key.toLowerCase())) continue;
      fontCount.set(key, (fontCount.get(key) || 0) + 1);
    }
  }
  const fontList = [...fontCount.entries()].sort((a, b) => b[1] - a[1]);
  const flagged = fontList.filter(([f]) => SLOP_FONTS.some((sf) => f.toLowerCase().includes(sf)));
  rows.push(tallyRow(
    'FONTS [measured]',
    fontList.map(([f, c]) => `${f} x${c}`).join(', ') || '(none recorded)',
    flagged.length
      ? `SLOP-FLAGGED: ${flagged.map(([f]) => f).join(', ')} — do NOT ship these even though measured`
      : 'no slop-flagged font in this cluster',
    'Measured does not mean safe. See references/antiSlop.md.'
  ));

  // 4. Superfamily check — one family for everything reads as generated.
  const pairing = sites.filter((s) => s.fonts && s.fonts.display && s.fonts.body
    && normalizeFont(s.fonts.display).toLowerCase() !== normalizeFont(s.fonts.body).toLowerCase()).length;
  rows.push(tallyRow(
    'TYPE PAIRING [measured]',
    `two families ${pairing} | single family ${n - pairing}`,
    pairing >= n - pairing ? 'PAIR TWO FAMILIES' : 'a single family is the norm here',
    'Display+body from one superfamily tastes AI-neutral.',
    strengthOf(Math.max(pairing, n - pairing), n)
  ));

  // 5. Section vocabulary — the page architecture to steal (gate 2b).
  const secCount = new Map();
  for (const s of sites) {
    for (const sec of s.structure || []) {
      const key = String(sec).trim();
      secCount.set(key, (secCount.get(key) || 0) + 1);
    }
  }
  const common = [...secCount.entries()]
    .filter(([, c]) => c >= Math.ceil(n / 2))
    .sort((a, b) => b[1] - a[1]);
  rows.push(tallyRow(
    'SECTIONS >=50% [measured]',
    common.map(([s, c]) => `${s} ${c}/${n}`).join(', ') || '(no section in half the sites)',
    common.length ? 'THESE SECTIONS MUST APPEAR' : 'no shared architecture — inspect the screenshots',
    'Gate 2b: steal the structure, not the skin.'
  ));

  // 6. What each site opens with.
  const firsts = new Map();
  for (const s of sites) {
    const f = (s.structure || [])[0];
    if (!f) continue;
    const key = String(f).trim();
    firsts.set(key, (firsts.get(key) || 0) + 1);
  }
  const firstRanked = [...firsts.entries()].sort((a, b) => b[1] - a[1]);
  const firstStated = firstRanked.reduce((s, [, c]) => s + c, 0);
  rows.push(tallyRow(
    'OPENING SECTION [measured]',
    firstRanked.map(([s, c]) => `${s} x${c}`).join(', ') || '(unknown)',
    'Open the page the way the majority opens it.',
    '',
    strengthOf(firstRanked.length ? firstRanked[0][1] : 0, firstStated)
  ));

  return rows;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.category) {
    console.error('usage: node datasetTally.js <category> [--cluster "<label>"] [--dataset-root <dir>] [--out <path>]');
    process.exit(2);
  }

  const root = findDatasetRoot(args.root);
  const file = path.join(root, args.category, 'dataset.json');
  if (!fs.existsSync(file)) {
    reportMissing(root, args.category);
    process.exit(2);
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let sites = Array.isArray(data.sites) ? data.sites : [];
  const clusters = Array.isArray(data.clusters) ? data.clusters : [];

  let clusterLabel = 'ALL SITES';
  if (args.cluster) {
    const c = clusters.find((x) => (x.label || '').toLowerCase().includes(args.cluster.toLowerCase()));
    if (!c) {
      console.error(`cluster "${args.cluster}" not found. available: ${clusters.map((x) => x.label).join(' | ') || '(none)'}`);
      process.exit(2);
    }
    const urls = new Set(c.memberUrls || []);
    sites = sites.filter((s) => urls.has(s.url));
    clusterLabel = c.label;
  }

  const n = sites.length;
  if (n === 0) { console.error('no sites to count'); process.exit(2); }

  const rows = buildRows(sites, n);

  // --- print ---------------------------------------------------------------
  const W = 30;
  // --json exists so houseStyleTally.js can aggregate these counts across every
  // category instead of re-implementing the measurement. It prints the rows and
  // stops: no human table, no constraints file.
  if (args.json) {
    console.log(JSON.stringify({
      category: data.category || args.category,
      cluster: clusterLabel,
      sites: n,
      rows: rows.map((r) => ({ label: r.label.replace(' [measured]', ''), buckets: r.buckets, verdict: r.verdict, note: r.note })),
    }, null, 2));
    return;
  }

  const pad = (s) => String(s).padEnd(W);
  const out = [];
  out.push(`DATASET TALLY — ${data.category || args.category} · ${clusterLabel} · ${n} sites`);
  out.push('='.repeat(72));
  for (const r of rows) {
    out.push(`${pad(r.label)} ${r.buckets}`);
    out.push(`${pad('')} -> ${r.strength ? `[${r.strength}] ` : ''}${r.verdict}${r.note ? `  (${r.note})` : ''}`);
  }
  const open = rows.filter((r) => r.strength === 'OPEN');
  out.push('');
  out.push(open.length
    ? `FREE TO DEVIATE (the references disagree here): ${open.map((r) => r.label.replace(' [measured]', '')).join(', ')}`
    : 'FREE TO DEVIATE: nothing — every measured dimension has a real majority.');
  out.push('Spend your deviation on an OPEN row. Deviating on a LAW row reads as a mistake,');
  out.push('and conforming on an OPEN row buys no safety — it just costs you the design.');
  out.push('');
  out.push('COUNT THESE BY EYE — open every desktop screenshot and fill them in:');
  for (const [label, opts] of EYE_ROWS) out.push(`${pad(label)} ${opts}   ___/${n}`);
  out.push('');
  out.push(`Screenshots: ${sites.map((s) => (s.screenshots && s.screenshots.desktop) || s.slug).join(', ')}`);
  console.log(out.join('\n'));

  // --- constraints file ----------------------------------------------------
  const tmp = fs.existsSync('c:/tmp') ? 'c:/tmp' : '/tmp';
  const outPath = args.out || path.join(tmp, `${args.category}-constraints.md`);
  const md = [];
  md.push(`# Dataset constraints — ${data.category || args.category} · ${clusterLabel}`);
  md.push('');
  md.push(`Counted from ${n} sites on ${new Date().toISOString().slice(0, 10)}.`);
  md.push('**Re-read this file at gate 3 (tokens/fonts) and gate 3.9 (internal critic).**');
  md.push('Any choice that contradicts a verdict below needs a stated reason AND the');
  md.push('user agreement, recorded in the Deviations section. "More distinctive" is');
  md.push('not a reason.');
  md.push('');
  md.push('## Measured verdicts (binding)');
  md.push('');
  md.push('**Strength decides how binding.** A majority is not one thing:');
  md.push('');
  md.push('- **LAW** (>=80% agree) — deviating reads as a mistake, not as a choice.');
  md.push('- **NORM** (60-79%) — deviating needs a stated reason and the user\'s agreement.');
  md.push('- **OPEN** (<60%, or a tie) — the references disagree, so there is nothing to');
  md.push('  overrule. **This is where the design gets to be itself.** Conforming here');
  md.push('  buys no safety; it only spends the one budget you have for not looking');
  md.push('  like everything else in the category.');
  md.push('- **THIN** (<3 sites stated it) — not enough data. Extend the dataset.');
  md.push('');
  md.push('| Dimension | Counted | Strength | Verdict |');
  md.push('| --- | --- | --- | --- |');
  // Escape the pipes inside the counts. "light 9 | dark 1" was splitting the
  // row into four cells, so the binding table rendered with the verdict in the
  // wrong column in every markdown viewer -- including the one the internal
  // critic re-reads it in at gate 3.9.
  const cell = (s) => String(s).replace(/\|/g, '\\|');
  for (const r of rows) md.push(`| ${cell(r.label.replace(' [measured]', ''))} | ${cell(r.buckets)} | ${r.strength || '—'} | ${cell(r.verdict)} |`);
  md.push('');
  const openRows = rows.filter((r) => r.strength === 'OPEN');
  md.push(openRows.length
    ? `**Free to deviate:** ${openRows.map((r) => r.label.replace(' [measured]', '')).join(', ')}.`
    : '**Free to deviate:** nothing measured here is open — look to the by-eye rows below.');
  md.push('Pick **one** and say so at gate 2.5. A design that deviates on every open row');
  md.push('is not braver, it is noise: one deliberate difference is what reads as a choice.');
  md.push('');
  md.push('## Counted by eye (fill before gate 2.5 — blank rows block the gate)');
  md.push('');
  md.push('| Dimension | Options | Count | Verdict |');
  md.push('| --- | --- | --- | --- |');
  for (const [label, opts] of EYE_ROWS) md.push(`| ${label} | ${opts} |  /${n} |  |`);
  md.push('');
  md.push('## Deviations (majority overruled — reason + user agreement)');
  md.push('');
  md.push('| Dimension | Majority says | We chose | Reason | User agreed |');
  md.push('| --- | --- | --- | --- | --- |');
  md.push('|  |  |  |  |  |');
  md.push('');
  fs.writeFileSync(outPath, md.join('\n'), 'utf8');
  console.log(`\nwritten: ${outPath}`);
  console.log('Fill the by-eye rows before gate 2.5, and re-read this file at gate 3.');
}

// Guarded like contrast.js and nameCheck.js, so houseStyleTally.js can borrow
// the slop list instead of keeping a second copy that drifts.
if (require.main === module) main();
module.exports = { SLOP_FONTS };
