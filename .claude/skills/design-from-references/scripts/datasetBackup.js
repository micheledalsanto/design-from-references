#!/usr/bin/env node
/**
 * datasetBackup.js — copy the measured corpus somewhere a git operation cannot reach.
 *
 * On 2026-09-03 ten of eleven categories were found holding screenshots and
 * nothing else: every dataset.json and all 98 design.md files had been lost.
 * The cause was ordinary. The text was tracked, the screenshots were
 * gitignored, and a history rewrite took the tracked half with it. Ignored
 * files survive that; tracked files do not. They were recovered from a
 * dangling commit, which would have been pruned by the next gc.
 *
 * The corpus is gitignored by policy -- it is measurements of third-party
 * sites and this repo does not redistribute them -- so git is not its backup
 * and cannot be. Something else has to be.
 *
 * Text only by default: dataset.json + design.md is ~1 MB and is the half that
 * was lost, the half that cost real research time, and the half every gate
 * reads. Screenshots are ~287 MB and can be recaptured by the agent.
 *
 * Usage:
 *   node datasetBackup.js                      back up the text
 *   node datasetBackup.js --with-screenshots   include the PNGs too
 *   node datasetBackup.js --dest <dir>         default: ~/designFromReferencesBackups
 *   node datasetBackup.js --list               show existing backups
 *
 * Exit codes: 0 ok · 1 nothing backed up · 2 bad usage
 */
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const { findDatasetRoot, surveyRoot } = require('./datasetRoot.js');

const TEXT = /(^dataset\.json$|\.md$)/i;
const IMAGE = /\.(png|jpe?g|webp|gif|avif)$/i;

function parseArgs(argv) {
  const a = { root: null, dest: null, screenshots: false, list: false };
  for (let i = 0; i < argv.length; i++) {
    const v = argv[i];
    if (v === '--dataset-root') a.root = argv[++i];
    else if (v === '--dest') a.dest = argv[++i];
    else if (v === '--with-screenshots') a.screenshots = true;
    else if (v === '--list') a.list = true;
    else { console.error(`unknown argument: ${v}`); process.exit(2); }
  }
  return a;
}

const defaultDest = () => path.join(os.homedir(), 'designFromReferencesBackups');

function copyTree(from, to, accept, stats) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const src = path.join(from, entry.name);
    const dst = path.join(to, entry.name);
    if (entry.isDirectory()) { copyTree(src, dst, accept, stats); continue; }
    if (!accept(entry.name)) { stats.skipped++; continue; }
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    stats.files++;
    stats.bytes += fs.statSync(src).size;
  }
}

const human = (b) => (b > 1 << 20 ? `${(b / (1 << 20)).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

function main() {
  const args = parseArgs(process.argv.slice(2));
  const dest = args.dest || defaultDest();

  if (args.list) {
    if (!fs.existsSync(dest)) { console.log(`no backups yet under ${dest}`); return; }
    const found = fs.readdirSync(dest).filter((d) => /^datasets-/.test(d)).sort();
    if (!found.length) { console.log(`no backups yet under ${dest}`); return; }
    console.log(`backups under ${dest}:`);
    for (const d of found) {
      const manifest = path.join(dest, d, 'manifest.json');
      let note = '';
      if (fs.existsSync(manifest)) {
        const m = JSON.parse(fs.readFileSync(manifest, 'utf8'));
        note = `  ${m.categories} categories, ${m.sites} sites, ${m.files} files${m.screenshots ? ' (with screenshots)' : ''}`;
      }
      console.log(`  ${d}${note}`);
    }
    return;
  }

  const root = findDatasetRoot(args.root);
  const { usable, broken } = surveyRoot(root);
  if (!usable.length) {
    console.error(`no countable category under ${root} — refusing to write an empty backup.`);
    if (broken.length) for (const b of broken) console.error(`  ${b.name} -- ${b.why}`);
    process.exit(1);
  }

  // Never silently overwrite an earlier backup taken the same day: a second
  // run after a loss would otherwise replace the good copy with the bad one.
  let stamp = new Date().toISOString().slice(0, 10);
  let out = path.join(dest, `datasets-${stamp}`);
  for (let n = 2; fs.existsSync(out); n++) out = path.join(dest, `datasets-${stamp}-${n}`);

  const accept = args.screenshots ? (f) => TEXT.test(f) || IMAGE.test(f) : (f) => TEXT.test(f);
  const stats = { files: 0, bytes: 0, skipped: 0 };
  let sites = 0;

  for (const category of usable) {
    copyTree(path.join(root, category), path.join(out, category), accept, stats);
    const ds = JSON.parse(fs.readFileSync(path.join(root, category, 'dataset.json'), 'utf8'));
    sites += (ds.sites || []).length;
  }

  const manifest = {
    takenAt: new Date().toISOString(),
    source: root,
    categories: usable.length,
    sites,
    files: stats.files,
    bytes: stats.bytes,
    screenshots: args.screenshots,
    notCounted: broken,
  };
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`backed up ${usable.length} categories, ${sites} sites, ${stats.files} files (${human(stats.bytes)})`);
  console.log(`  -> ${out}`);
  if (!args.screenshots) console.log(`  ${stats.skipped} screenshot(s) skipped — pass --with-screenshots to include them`);
  if (broken.length) {
    console.log(`  ${broken.length} directory/directories NOT backed up (nothing countable in them):`);
    for (const b of broken) console.log(`    ${b.name} -- ${b.why}`);
  }
}

if (require.main === module) main();
module.exports = { copyTree, defaultDest };
