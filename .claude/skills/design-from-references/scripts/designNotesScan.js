#!/usr/bin/env node
/**
 * designNotesScan.js — reads the per-site design.md files and counts the visual
 * dimensions that dataset.json does not record: hero composition, photography
 * treatment, headline size, alignment, italic keywords, product UI, stat
 * blocks, press logos, comparison tables, customer faces.
 *
 * These are exactly the dimensions past rejections turned on, and they were
 * previously left to be counted by hand — which meant they usually were not.
 *
 * Design rule: this script NEVER guesses. Every dimension resolves to one of
 *   hit      — a phrase matched, with the sentence quoted as evidence
 *   none     — the notes clearly indicate the absence
 *   unknown  — the notes do not say; YOU must look at the screenshot
 * An "unknown" is a correct answer. A wrong count is worse than no count.
 *
 * Matching is scoped to the relevant section of the note where it matters:
 * "monochrome" inside "Components/signature" describes award logos, not the
 * photography, and counting it as B&W photography is a real false positive
 * observed on this dataset.
 *
 * Usage:
 *   node designNotesScan.js <category> [--cluster "<label>"]
 *                           [--dataset-root <dir>] [--json] [--quotes]
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const a = { category: null, cluster: null, root: null, json: false, quotes: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--cluster') a.cluster = argv[++i];
    else if (v === '--dataset-root') a.root = argv[++i];
    else if (v === '--json') a.json = true;
    else if (v === '--quotes') a.quotes = true;
    else if (!v.startsWith('--') && !a.category) a.category = v;
  }
  return a;
}

const { findDatasetRoot, reportMissing } = require('./datasetRoot.js');

// Split a design.md into its "## " sections, lowercased keys.
function sections(md) {
  const out = { _all: md };
  const parts = md.split(/^##\s+/m);
  for (let i = 1; i < parts.length; i++) {
    const nl = parts[i].indexOf('\n');
    const title = (nl < 0 ? parts[i] : parts[i].slice(0, nl)).trim().toLowerCase();
    out[title] = nl < 0 ? '' : parts[i].slice(nl + 1);
  }
  return out;
}

// Concatenate the sections whose heading matches any of the given patterns.
function scope(secs, patterns) {
  const keys = Object.keys(secs).filter((k) => k !== '_all'
    && patterns.some((p) => p.test(k)));
  if (!keys.length) return null;
  return keys.map((k) => secs[k]).join('\n');
}

// Everything EXCEPT the "Avoid" section. A note's Avoid prose describes what
// NOT to do, so counting it inverts the meaning: GOV.UK's "avoid the visual
// starkness (zero border-radius, no shadows)" is a warning about copying
// GOV.UK, not an observation of it. Rare -- 1 of 69 geometry-bearing sections
// across the datasets -- but it flips the value when it lands, so the geometry
// rows read this instead of the raw note.
function exceptAvoid(secs) {
  const keys = Object.keys(secs).filter((k) => k !== '_all' && !/^avoid/.test(k));
  if (!keys.length) return null;
  return keys.map((k) => secs[k]).join('\n');
}

const SEC = {
  type: [/^type/, /typograph/],
  color: [/^colou?r/],
  layout: [/^layout/, /^grid/],
  sections: [/^sections?\b/],
  components: [/component/, /signature/],
  works: [/^what works/, /^how to apply/],
};

// Pull the sentence containing a match, for evidence.
function evidence(text, re) {
  const m = re.exec(text);
  if (!m) return null;
  const start = Math.max(0, text.lastIndexOf('\n', m.index) + 1);
  let end = text.indexOf('\n', m.index + m[0].length);
  if (end < 0) end = text.length;
  return text.slice(start, end).replace(/\s+/g, ' ').replace(/^[-*\d.\s]+/, '').trim().slice(0, 150);
}

function probe(text, positive, negative) {
  if (!text) return { verdict: 'unknown', quote: null };
  if (negative) {
    const q = evidence(text, negative);
    if (q) return { verdict: 'none', quote: q };
  }
  const q = evidence(text, positive);
  if (q) return { verdict: 'hit', quote: q };
  return { verdict: 'unknown', quote: null };
}

// --- the dimensions --------------------------------------------------------
// Each returns { verdict, quote, value? }. Order matches the by-eye rows the
// tally prints, so the two scripts line up.
/**
 * Front matter: the measured half of a design.md, stated rather than narrated.
 *
 * Everything below this comment reads free prose with regexes, which is why
 * the geometry rows come back `unknown` for almost every note: design.md is
 * written for a human, and a regex can only find the phrasings someone
 * happened to use. Section 7a of antiSlop.md calls uniformity a tell this repo
 * never counted -- it was never counted because it was never stated.
 *
 * So dataset-builder now states it. A `---` block at the top of design.md
 * carries the facts; the prose keeps the narrative and the "how to apply"
 * notes. The scan reads the block first and falls back to the regexes, so
 * older notes keep working exactly as before.
 *
 * A value that is not a recognised bucket is reported as unknown and warned
 * about. It is never coerced into the nearest option: inventing the missing
 * value is the one thing this scan exists not to do.
 */
function frontMatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(md);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = /^\s*([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.+?)\s*$/.exec(line);
    if (!kv) continue;
    fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return fm;
}

/** Map a stated front-matter value onto a dimension's buckets. */
function fromFrontMatter(dim, raw) {
  const v = String(raw).trim().toLowerCase();
  const quote = `stated in front matter: ${dim.fm}: ${raw}`;

  if (dim.fmNumber) {
    const px = parseFloat(v);
    if (!Number.isFinite(px)) return null;
    const value = dim.fmNumber(px);
    return value ? { verdict: 'hit', value, px, quote } : null;
  }

  const yesNo = dim.buckets.length === 2 && dim.buckets[0] === 'yes';
  if (yesNo) {
    if (/^(yes|true)$/.test(v)) return { verdict: 'hit', value: 'yes', quote };
    if (/^(no|false)$/.test(v)) return { verdict: 'none', value: 'no', quote };
    return null;
  }

  // Match a bucket by its leading word, so "flat" finds "flat/borderless"
  // and "desaturated" finds "desaturated/B&W".
  const hit = dim.buckets.find((b) => {
    const bl = b.toLowerCase();
    return bl === v || bl.split(/[\/ ]/)[0] === v || bl.startsWith(v);
  });
  if (!hit) return null;
  return { verdict: hit === 'none' ? 'none' : 'hit', value: hit, quote };
}

const DIMENSIONS = [
  {
    key: 'HERO COMPOSITION',
    fm: 'heroComposition',
    buckets: ['photo-led', 'type-led', 'product-led'],
    run(secs) {
      const t = scope(secs, [...SEC.layout, ...SEC.sections]) || secs._all;
      const photo = /full[- ]bleed\s+(hero\s+)?(photo|image)|hero\s+photograph|photographic hero|hero\s+(is\s+)?a?\s*full[- ]bleed|photo(graph)?\s+hero/i;
      const product = /hero\s+(shows|features|is)\s+(the\s+)?(product|app|dashboard|ui)|product\s+shot\s+hero|app\s+screenshot\s+in\s+the\s+hero/i;
      const type = /type[- ]led\s+hero|typographic\s+hero|hero\s+is\s+(pure\s+)?type|text[- ]only\s+hero|no\s+hero\s+image/i;
      for (const [re, val] of [[photo, 'photo-led'], [product, 'product-led'], [type, 'type-led']]) {
        const q = evidence(t, re);
        if (q) return { verdict: 'hit', value: val, quote: q };
      }
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'PHOTOGRAPHY',
    fm: 'photography',
    buckets: ['colour', 'desaturated/B&W', 'none'],
    run(secs) {
      // Scoped to colour/layout: "monochrome" in the components section
      // describes award badges, not the photography.
      const t = scope(secs, [...SEC.color, ...SEC.layout]);
      if (!t) return { verdict: 'unknown', quote: null };
      const bw = /(photograph\w*|photo|imagery|images)[^.\n]{0,60}(black[- ]and[- ]white|b&w|grayscale|greyscale|desaturat\w*|monochrom\w*)|(black[- ]and[- ]white|grayscale|greyscale|desaturat\w*)[^.\n]{0,40}(photograph\w*|photo|imagery|images)/i;
      const nophoto = /no\s+photograph|without\s+photograph|illustration\s+only|no\s+imagery/i;
      const colour = /photograph\w*|photo\b|imagery|full[- ]bleed\s+image/i;
      let q = evidence(t, bw);
      if (q) return { verdict: 'hit', value: 'desaturated/B&W', quote: q };
      q = evidence(t, nophoto);
      if (q) return { verdict: 'none', value: 'none', quote: q };
      q = evidence(t, colour);
      if (q) return { verdict: 'hit', value: 'colour', quote: q };
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'HEADLINE SIZE',
    fm: 'headlinePx',
    fmNumber: (px) => (px > 56 ? '>56px' : '<=56px'),
    buckets: ['>56px', '<=56px'],
    run(secs) {
      const t = scope(secs, SEC.type);
      if (!t) return { verdict: 'unknown', quote: null };
      // Only sizes on a line that also names the hero/H1/display role.
      const lines = t.split('\n');
      for (const line of lines) {
        if (!/hero|h1|display|headline/i.test(line)) continue;
        const m = /([0-9]{2,3}(?:\.[0-9]+)?)\s*px/i.exec(line);
        if (!m) continue;
        const px = parseFloat(m[1]);
        return {
          verdict: 'hit',
          value: px > 56 ? '>56px' : '<=56px',
          px,
          quote: line.replace(/\s+/g, ' ').replace(/^[-*\s]+/, '').trim().slice(0, 150),
        };
      }
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'TEXT ALIGNMENT',
    fm: 'textAlignment',
    buckets: ['left', 'centred'],
    run(secs) {
      const t = scope(secs, [...SEC.layout, ...SEC.type]);
      if (!t) return { verdict: 'unknown', quote: null };
      const centred = /cent(er|re)ed\s+(hero|headline|text|type|layout|copy)|hero[^.\n]{0,30}cent(er|re)ed/i;
      const left = /left[- ]align\w*|flush\s+left|left[- ]hand\s+column/i;
      let q = evidence(t, centred);
      if (q) return { verdict: 'hit', value: 'centred', quote: q };
      q = evidence(t, left);
      if (q) return { verdict: 'hit', value: 'left', quote: q };
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'ITALIC DISPLAY',
    fm: 'italicDisplay',
    buckets: ['yes', 'no'],
    run(secs) {
      // Was scoped to the type/components sections and required the phrase
      // "italic keyword"/"italic emphasis". It matched nothing in the whole
      // corpus while eight design.md files describe italics, because the notes
      // write "centered italic serif headline overlay" and "headline moments
      // use italic serif" -- in the hero and sections prose, not under Type.
      // The 6/70 quoted in gate 2c came from a hand grep, not from here.
      //
      // Now: italics within 40 characters of a display context, either order.
      // Deliberately NOT "any mention of italic": an italic pull quote or a
      // caption is not the tell. Section 7a records what a loose pattern costs
      // -- it turned 2 into 7 in saasPricing before being tightened.
      // Verified against the corpus by hand, 2026-09-03: this matches 6 of the
      // 8 notes that mention italics, and the 2 it skips are both pull quotes
      // ("large centered pull-quote in serif italic") -- an italic quote is a
      // typographic convention, not the headline tell. "key word"/"key phrase"
      // is in the list because Ezra's note reads "italic used for the key
      // phrase", which IS the tell and was the one real miss.
      const t = scope(secs, [...SEC.type, ...SEC.components, ...SEC.sections, ...SEC.layout, ...SEC.works]) || secs._all;
      const DISPLAY = 'headline|display|hero|tagline|h1|heading|title|key\\s+(word|phrase)|keyword';
      return probe(t, new RegExp(
        `italic\\w*[^.\\n]{0,40}(${DISPLAY})|(${DISPLAY})[^.\\n]{0,40}italic`, 'i'), null);
    },
  },
  {
    key: 'SHOWS PRODUCT UI',
    fm: 'productUi',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components, ...SEC.works]) || secs._all;
      return probe(t,
        /product\s+(ui|screenshot|shot)|app\s+screenshot|dashboard\s+(mock|screenshot|ui)|ui\s+mock|interface\s+screenshot|results\s+ui|biomarker\s+(ui|dashboard)/i,
        /no\s+(product\s+)?(ui|dashboard|screenshot)|zero\s+biomarker\s+ui|no\s+data\/dashboard/i);
    },
  },
  {
    key: 'BIG NUMERIC STATS',
    fm: 'bigStats',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /\bstat(s|istic)?\s+(block|row|band|section|strip)|big\s+numbers?|large\s+numerals?|numeric\s+(stat|callout)|metrics?\s+(row|band|strip)/i, null);
    },
  },
  {
    key: 'PRESS / CLIENT LOGOS',
    fm: 'pressLogos',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /press\s+logos?|as\s+seen\s+in|logo\s+(row|wall|strip|bar)|client\s+logos?|award\s+(logos?|badges?)|media\s+logos?/i, null);
    },
  },
  {
    key: 'COMPARISON TABLE',
    fm: 'comparisonTable',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /comparison\s+(table|grid|chart)|versus\s+(table|grid)|\bvs\.?\s+(the\s+)?(standard|competitor|typical)|us\s+vs\b/i, null);
    },
  },
  // --- geometry ------------------------------------------------------------
  // Added 2026-09-02. The most cited NON-typographic tell of generated design
  // is uniform geometry: one radius, one padding and one shadow on every
  // surface. Nothing in this repo counted it, so a design could pass every
  // gate and still read as machine made. dataset.json has no geometry fields,
  // so these read the prose like the rows above — and stay `unknown` when the
  // notes are silent, which for radius is roughly two notes in three.
  {
    key: 'CORNER RADIUS',
    fm: 'cornerRadiusPx',
    fmNumber: (px) => (px <= 4 ? 'sharp (0-4px)' : px <= 16 ? 'soft (5-16px)' : 'round (>16px)'),
    buckets: ['sharp (0-4px)', 'soft (5-16px)', 'round (>16px)', 'pill'],
    run(secs) {
      // Radius is stated wherever the note happens to describe a button or
      // card, so scope to the whole note rather than losing two thirds of it.
      const t = exceptAvoid(secs);
      if (!t) return { verdict: 'unknown', quote: null };
      const pill = /\b(pill[- ]shaped|pill\s+radius|full[- ]radius|fully\s+rounded)\b|radius[^.\n]{0,24}\b9999\b/i;
      const px = /(?:border[- ]?radius|corner\s+radius|radius)[^.\n]{0,24}?`?([0-9]{1,4})(?:\s*[-–]\s*([0-9]{1,4}))?\s*px/i;
      const sharp = /\b(sharp|square)\s+corners?\b|\bzero\s+border[- ]?radius\b|\bno\s+rounded\s+corners?\b/i;
      let q = evidence(t, pill);
      if (q) return { verdict: 'hit', value: 'pill', quote: q };
      const m = px.exec(t);
      if (m) {
        // "8-12px" — take the low end, the value the base token would use.
        const v = parseFloat(m[1]);
        const val = v <= 4 ? 'sharp (0-4px)' : v <= 16 ? 'soft (5-16px)' : 'round (>16px)';
        return { verdict: 'hit', value: val, px: v, quote: evidence(t, px) };
      }
      q = evidence(t, sharp);
      if (q) return { verdict: 'hit', value: 'sharp (0-4px)', quote: q };
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'SURFACE TREATMENT',
    fm: 'surface',
    buckets: ['flat/borderless', 'bordered', 'shadowed'],
    run(secs) {
      const t = exceptAvoid(secs);
      if (!t) return { verdict: 'unknown', quote: null };
      // Order matters: an explicit "no shadow" outranks the word "shadow".
      // "flat bullet list" and "flat surface color" are not elevation claims:
      // requiring an explicit shadow/elevation word removed 5 false positives
      // in saasPricing, where 7/7 was really 2/7.
      const noShadow = /\bno\s+(drop\s+|box[- ])?shadows?\b|\bwithout\s+shadows?\b|\bborderless\b|\bno\s+elevation\b|\bflat\s+(card|panel|surface)s?\b[^.\n]{0,30}\bno\s+shadow\b/i;
      const shadowed = /\bbox-shadow\b|\bdrop[- ]shadows?\b|\bshadows?\s+(on|under|beneath)\b|\belevat(ion|ed)\b/i;
      const bordered = /\b(1px|hairline|thin)\s+(solid\s+)?(border|rule)\b|\bborder:\s*1px\b|\bbordered\s+cards?\b/i;
      let q = evidence(t, noShadow);
      if (q) return { verdict: 'hit', value: 'flat/borderless', quote: q };
      q = evidence(t, shadowed);
      if (q) return { verdict: 'hit', value: 'shadowed', quote: q };
      q = evidence(t, bordered);
      if (q) return { verdict: 'hit', value: 'bordered', quote: q };
      return { verdict: 'unknown', quote: null };
    },
  },
  {
    key: 'RADIUS UNIFORMITY',
    fm: 'radiusUniformity',
    buckets: ['varied', 'single'],
    run(secs) {
      // The actual tell is not the value but whether ANYONE decided: a system
      // using one radius everywhere reads as generated, unless the references
      // genuinely do that. Count the distinct radius values the note states.
      const t = exceptAvoid(secs);
      if (!t) return { verdict: 'unknown', quote: null };
      const vals = new Set();
      const re = /(?:border[- ]?radius|corner\s+radius|radius)[^.\n]{0,24}?`?([0-9]{1,4})\s*px/gi;
      let m;
      while ((m = re.exec(t))) vals.add(parseFloat(m[1]));
      if (/\b(pill[- ]shaped|full[- ]radius|fully\s+rounded)\b|radius[^.\n]{0,24}\b9999\b/i.test(t)) vals.add(9999);
      if (!vals.size) return { verdict: 'unknown', quote: null };
      // One stated value is not proof of a single-radius system — the note may
      // simply have described one component. Say so rather than over claiming.
      if (vals.size === 1) {
        return {
          verdict: 'hit',
          value: 'single',
          quote: `only one radius stated (${[...vals].map((v) => (v === 9999 ? 'pill' : v + 'px')).join(', ')}) — confirm on the screenshot that it is the whole system`,
        };
      }
      return {
        verdict: 'hit',
        value: 'varied',
        quote: `${vals.size} distinct radii stated: ${[...vals].sort((a, b) => a - b).map((v) => (v === 9999 ? 'pill' : v + 'px')).join(', ')}`,
      };
    },
  },
  {
    key: 'CUSTOMER FACES',
    fm: 'customerFaces',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components, ...SEC.color]) || secs._all;
      return probe(t, /customer\s+(photo|face|portrait)|testimonial[^.\n]{0,40}(photo|portrait|face)|real\s+(people|patients|customers)|portraits?\s+of\s+(real\s+)?(people|customers|patients|guests)|guests?\s+in\b/i, null);
    },
  },
];

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.category) {
    console.error('usage: node designNotesScan.js <category> [--cluster "<label>"] [--dataset-root <dir>] [--json] [--quotes]');
    process.exit(2);
  }

  const root = findDatasetRoot(args.root);
  const catDir = path.join(root, args.category);
  const file = path.join(catDir, 'dataset.json');
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
  if (!sites.length) { console.error('no sites to scan'); process.exit(2); }

  // Read every design.md.
  const notes = [];
  const missing = [];
  for (const s of sites) {
    const rel = s.design || `${s.slug}/design.md`;
    const p = path.join(catDir, rel);
    if (!fs.existsSync(p)) { missing.push(s.slug || rel); continue; }
    const md = fs.readFileSync(p, 'utf8');
    notes.push({ slug: s.slug || rel, secs: sections(md), fm: frontMatter(md) });
  }
  if (!notes.length) {
    console.error(`no design.md found under ${catDir} — nothing to scan`);
    process.exit(2);
  }

  // A stated fact beats a matched phrase. Falls through to the prose regexes
  // when the note has no front matter, or none for this dimension.
  const rejected = [];
  const resolve = (d, nt) => {
    if (d.fm && nt.fm && nt.fm[d.fm] !== undefined) {
      const stated = fromFrontMatter(d, nt.fm[d.fm]);
      if (stated) return { ...stated, source: 'front matter' };
      // Never coerce an unrecognised value into the nearest bucket. Say it out
      // loud and fall back, so a typo in a note surfaces instead of becoming a
      // silently wrong count.
      rejected.push(`${nt.slug}: ${d.fm}: ${nt.fm[d.fm]} is not one of ${d.buckets.join(' / ')}`);
    }
    return { ...d.run(nt.secs), source: 'prose' };
  };

  const results = DIMENSIONS.map((d) => {
    const per = notes.map((nt) => ({ slug: nt.slug, ...resolve(d, nt) }));
    const counts = {};
    let unknown = 0;
    for (const r of per) {
      if (r.verdict === 'unknown') { unknown++; continue; }
      const label = r.value || (r.verdict === 'hit' ? 'yes' : 'no');
      counts[label] = (counts[label] || 0) + 1;
    }
    const known = per.length - unknown;
    const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    let verdict;
    if (known === 0) verdict = 'UNKNOWN — look at the screenshots';
    else if (known < Math.ceil(per.length / 2)) verdict = `WEAK (only ${known}/${per.length} stated) — confirm on the screenshots`;
    else if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) verdict = 'SPLIT — decide explicitly';
    else verdict = `${ranked[0][0].toUpperCase()} (${ranked[0][1]}/${known} stated)`;
    const stated = per.filter((r) => r.source === 'front matter' && r.verdict !== 'unknown').length;
    return { key: d.key, buckets: d.buckets, counts, unknown, known, stated, verdict, per };
  });

  if (rejected.length) {
    console.error('front matter values not recognised (falling back to the prose for these):');
    for (const r of rejected) console.error(`  ${r}`);
    console.error('');
  }

  if (args.json) {
    console.log(JSON.stringify({ category: data.category || args.category, cluster: clusterLabel, sites: notes.length, missing, dimensions: results }, null, 2));
    return;
  }

  const W = 26;
  const pad = (s) => String(s).padEnd(W);
  console.log(`DESIGN NOTES SCAN — ${data.category || args.category} · ${clusterLabel} · ${notes.length} notes read`);
  console.log('='.repeat(74));
  console.log('Counted from the design.md prose. "unknown" = the notes do not say:');
  console.log('open that screenshot yourself. Never invent the missing value.');
  console.log('');
  for (const r of results) {
    const tally = Object.entries(r.counts).map(([k, v]) => `${k} ${v}`).join(' | ') || '(nothing stated)';
    console.log(`${pad(r.key)} ${tally}${r.unknown ? `  · unknown ${r.unknown}` : ''}`);
    console.log(`${pad('')} -> ${r.verdict}`);
    if (args.quotes) {
      for (const p of r.per) {
        if (p.quote) console.log(`${pad('')}    ${p.slug}: "${p.quote}"`);
        else console.log(`${pad('')}    ${p.slug}: (not stated — check the screenshot)`);
      }
    }
  }
  if (missing.length) console.log(`\nmissing design.md: ${missing.join(', ')}`);
  const needEyes = results.filter((r) => r.unknown > 0);
  if (needEyes.length) {
    console.log('\nStill needs your eyes on the screenshots:');
    for (const r of needEyes) {
      const who = r.per.filter((p) => p.verdict === 'unknown').map((p) => p.slug).join(', ');
      console.log(`  ${r.key}: ${who}`);
    }
  }
  console.log('\nCopy these into the by-eye rows of <tmp>/<category>-constraints.md,');
  console.log('resolving every "unknown" on the screenshot first.');
}

main();
