'use strict';
/**
 * Locating the dataset root, and telling the truth about what is in it.
 *
 * Both counting scripts had their own copy of findDatasetRoot, and both
 * answered "dataset not found" by listing every DIRECTORY under the root as if
 * it were a usable category. That is how a real data loss stayed invisible:
 * ten categories lost their dataset.json and every design.md to a history
 * rewrite -- only the gitignored screenshots survived -- and the gate kept
 * reporting all eleven as `available`. The operator reads that list and
 * concludes they typed the name wrong.
 *
 * A directory is a category only if it has a dataset.json that parses. Say so.
 */

const fs = require('fs');
const path = require('path');

function findDatasetRoot(explicit) {
  if (explicit) return explicit;
  const candidates = [
    path.resolve(process.cwd(), 'data/datasets'),
    path.resolve(__dirname, '../../../../data/datasets'), // project checkout
    path.resolve(__dirname, '../../../data/datasets'),    // plugin install
  ];
  return candidates.find((c) => fs.existsSync(c)) || candidates[0];
}

/**
 * Split the root into categories that can actually be counted and directories
 * that cannot, with the reason for each.
 * @returns {{usable: string[], broken: {name: string, why: string}[]}}
 */
function surveyRoot(root) {
  const usable = [];
  const broken = [];
  if (!fs.existsSync(root)) return { usable, broken };

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(root, entry.name, 'dataset.json');
    if (!fs.existsSync(file)) {
      // Distinguish "never built" from "lost its measurements": a directory
      // holding screenshots but no dataset.json is the signature of the
      // history-rewrite loss, and it is recoverable, so it deserves saying.
      const leftovers = fs.readdirSync(path.join(root, entry.name)).length;
      broken.push({
        name: entry.name,
        why: leftovers
          ? `no dataset.json, but ${leftovers} item(s) still on disk -- measurements lost, screenshots kept`
          : 'empty directory',
      });
      continue;
    }
    try {
      const data = JSON.parse(fs.readFileSync(file, 'utf8'));
      const n = Array.isArray(data.sites) ? data.sites.length : 0;
      if (!n) { broken.push({ name: entry.name, why: 'dataset.json lists no sites' }); continue; }
      usable.push(entry.name);
    } catch (err) {
      broken.push({ name: entry.name, why: `dataset.json does not parse: ${err.message}` });
    }
  }
  return { usable, broken };
}

/**
 * The shared "I cannot count this" message. Never exits -- the caller does,
 * so each script keeps its own exit code contract.
 */
function reportMissing(root, category) {
  const { usable, broken } = surveyRoot(root);
  console.error(`dataset not found: ${path.join(root, category, 'dataset.json')}`);

  const lost = broken.find((b) => b.name === category);
  if (lost) {
    console.error(`\n"${category}" exists but cannot be counted: ${lost.why}.`);
    console.error('If the measurements were lost to a history rewrite, they may still be');
    console.error('in the object store: git log --all --diff-filter=AD -- data/datasets,');
    console.error('and git fsck --lost-found for dangling commits. Recover before gc runs.');
  }

  console.error(`\ncountable categories (${usable.length}): ${usable.join(', ') || '(none)'}`);
  if (broken.length) {
    console.error(`not countable (${broken.length}):`);
    for (const b of broken) console.error(`  ${b.name} -- ${b.why}`);
  }
}

module.exports = { findDatasetRoot, surveyRoot, reportMissing };
