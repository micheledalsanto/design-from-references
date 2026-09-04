#!/usr/bin/env node
/**
 * PreToolUse gate for the Figma build tools.
 *
 * The skill's gates are scripts that exit 1. That forces their CONTENT once
 * they run, and nothing forced them to run: a skill is text loaded into
 * context, followed the way any instruction is followed. The run log is the
 * evidence -- components-before-screens broken twice, the dash rule broken on
 * the first artefact built after it was written, with the skill loaded every
 * time. So a test of a design was a test of the model's compliance, not of the
 * skill.
 *
 * This is executed by the harness, not by the model. It refuses to let the
 * build start until the run manifest shows the counting and the originality
 * engine actually ran.
 *
 * DELIBERATELY NOT FAIL-OPEN. nameGate fails open because a missing checker
 * should never wedge a tool; this one's entire purpose is to block, so a
 * missing manifest means "the gates did not run" and denies. What it protects
 * against is skipping the count -- not the model's judgement about the count,
 * which gate 4c (constraintsCheck) covers at build time.
 *
 * ESCAPE HATCH, on purpose: use_figma is also how you inspect a file, rename a
 * layer or fix QA, and blocking all of that would get this hook switched off
 * within a day. Creating <tmp>/dfr/nogate lifts it. That is not a loophole
 * being overlooked -- it converts a silent skip into a visible, recorded
 * action in the transcript, which is the thing that was missing. A gate nobody
 * can live with gets removed; a gate that makes you say so out loud gets kept.
 */
'use strict';
const fs = require('fs');
const path = require('path');

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let manifestApi;
  try {
    // Same resolution as nameGate: next to this file first, so it works in a
    // cloned repo and in a plugin install alike.
    const candidates = [
      path.join(__dirname, '..', 'skills', 'design-from-references', 'scripts', 'runManifest.js'),
      ...[process.env.CLAUDE_PLUGIN_ROOT, process.env.CLAUDE_PROJECT_DIR, process.cwd()]
        .filter(Boolean)
        .map((r) => path.join(r, '.claude/skills/design-from-references/scripts/runManifest.js')),
    ];
    for (const c of candidates) {
      try { manifestApi = require(c); break; } catch { /* next */ }
    }
  } catch { /* handled below */ }

  // If the manifest module itself cannot be found, this is not a
  // design-from-references checkout. Nothing to enforce.
  if (!manifestApi) process.exit(0);

  if (fs.existsSync(path.join(manifestApi.tmpRoot(), 'nogate'))) process.exit(0);

  const { ok, manifest, missing } = manifestApi.verify();
  if (ok) process.exit(0);

  const ran = manifest && manifest.gates ? Object.keys(manifest.gates) : [];
  const lines = missing.map(([id, what, cmd]) => `  gate ${id} (${what}): ${cmd}`);

  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `The design gates have not run, so the build cannot start.\n\n`
        + (manifest
          ? `Run in progress: ${manifest.category || '(no category)'} — gates recorded: ${ran.join(', ') || 'none'}.\n\n`
          : `No run manifest at all: gate 2a has not been run in this session.\n\n`)
        + `Missing:\n${lines.join('\n')}\n\n`
        + `This exists because the counting is what the whole skill rests on, and a `
        + `rule you have to remember is a suggestion. Run the gates, then call this `
        + `tool again.\n\n`
        + `If this is NOT a dataset-driven design run — inspecting a file, renaming a `
        + `layer, fixing QA, publishing — say so to the user and create `
        + `${path.join(manifestApi.tmpRoot(), 'nogate')} to lift the gate for this session.`,
    },
  }));
  process.exit(0);
});
