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

function findDatasetRoot(explicit) {
  if (explicit) return explicit;
  const candidates = [
    path.resolve(process.cwd(), 'data/datasets'),
    path.resolve(__dirname, '../../../../data/datasets'),
    path.resolve(__dirname, '../../../data/datasets'),
  ];
  return candidates.find((c) => fs.existsSync(c)) || candidates[0];
}

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
const DIMENSIONS = [
  {
    key: 'HERO COMPOSITION',
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
    key: 'ITALIC KEYWORD',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.type, ...SEC.components]);
      return probe(t, /italic\w*\s+(keyword|word|emphasis|accent)|keyword[^.\n]{0,30}italic|italic\w*\s+(inside|within)\s+the\s+(headline|h1)/i, null);
    },
  },
  {
    key: 'SHOWS PRODUCT UI',
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
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /\bstat(s|istic)?\s+(block|row|band|section|strip)|big\s+numbers?|large\s+numerals?|numeric\s+(stat|callout)|metrics?\s+(row|band|strip)/i, null);
    },
  },
  {
    key: 'PRESS / CLIENT LOGOS',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /press\s+logos?|as\s+seen\s+in|logo\s+(row|wall|strip|bar)|client\s+logos?|award\s+(logos?|badges?)|media\s+logos?/i, null);
    },
  },
  {
    key: 'COMPARISON TABLE',
    buckets: ['yes', 'no'],
    run(secs) {
      const t = scope(secs, [...SEC.sections, ...SEC.components]) || secs._all;
      return probe(t, /comparison\s+(table|grid|chart)|versus\s+(table|grid)|\bvs\.?\s+(the\s+)?(standard|competitor|typical)|us\s+vs\b/i, null);
    },
  },
  {
    key: 'CUSTOMER FACES',
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
    console.error(`dataset not found: ${file}`);
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
    notes.push({ slug: s.slug || rel, secs: sections(fs.readFileSync(p, 'utf8')) });
  }
  if (!notes.length) {
    console.error(`no design.md found under ${catDir} — nothing to scan`);
    process.exit(2);
  }

  const results = DIMENSIONS.map((d) => {
    const per = notes.map((nt) => ({ slug: nt.slug, ...d.run(nt.secs) }));
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
    return { key: d.key, buckets: d.buckets, counts, unknown, known, verdict, per };
  });

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
