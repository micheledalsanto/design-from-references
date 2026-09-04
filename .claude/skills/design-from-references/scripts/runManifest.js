'use strict';
/**
 * runManifest.js — the audit trail that turns "did it follow the skill?" into
 * a file you can read.
 *
 * The gates in this skill are scripts that exit 1, which forces their CONTENT
 * once they run. Nothing forced them to run. A skill is loaded into context and
 * then followed the way any instruction is followed -- imperfectly, and this
 * repo has the receipts: the components-before-screens rule was broken twice
 * ("ancora una volta sei partito dal design e non dai componenti") and the dash
 * rule was broken on the first artefact built after it was written. The skill
 * was loaded on every one of those runs.
 *
 * So each gate records that it ran, and a PreToolUse hook refuses to let the
 * Figma build start until the record is there. The harness executes the hook,
 * not the model, which is the only enforcement in this system that does not
 * depend on the model choosing to comply.
 *
 * Gate 2a (datasetTally) STARTS a run: counting is the first thing that
 * happens, so it is the natural boundary between one design and the next.
 */

const fs = require('fs');
const path = require('path');

/** Same temp root datasetTally has always written its constraints file to. */
function tmpRoot() {
  const base = fs.existsSync('c:/tmp') ? 'c:/tmp' : '/tmp';
  return path.join(base, 'dfr');
}

const manifestPath = () => path.join(tmpRoot(), 'run.json');

function read() {
  try { return JSON.parse(fs.readFileSync(manifestPath(), 'utf8')); }
  catch { return null; }
}

/** Begin a new run, discarding the previous one. Called by gate 2a only. */
function startRun(info) {
  const manifest = {
    runId: `${new Date().toISOString().replace(/[:.]/g, '-')}`,
    startedAt: new Date().toISOString(),
    ...info,
    gates: {},
  };
  fs.mkdirSync(tmpRoot(), { recursive: true });
  fs.writeFileSync(manifestPath(), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}

/**
 * Record that a gate ran. Never throws: a failure to write the audit trail
 * must not take down the gate itself, and the hook treats a missing record as
 * "did not run" anyway, which is the safe direction.
 */
function record(gate, data) {
  try {
    const manifest = read();
    if (!manifest) return null;
    manifest.gates[gate] = { at: new Date().toISOString(), ...data };
    fs.writeFileSync(manifestPath(), JSON.stringify(manifest, null, 2), 'utf8');
    return manifest;
  } catch { return null; }
}

/** The gates that must have run before anything is built in Figma. */
const REQUIRED = [
  ['2a', 'count the references', 'node <skill root>/scripts/datasetTally.js <category>'],
  ['2.5', 'originality engine + the deviation you are spending',
    'node <skill root>/scripts/originalityCheck.js --file <tmp>/originality.json'],
];

/** @returns {{ok: boolean, manifest: object|null, missing: Array}} */
function verify() {
  const manifest = read();
  if (!manifest) return { ok: false, manifest: null, missing: REQUIRED };
  const missing = REQUIRED.filter(([id]) => !manifest.gates || !manifest.gates[id]);
  return { ok: missing.length === 0, manifest, missing };
}

module.exports = { tmpRoot, manifestPath, read, startRun, record, verify, REQUIRED };
