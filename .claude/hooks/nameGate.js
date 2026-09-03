#!/usr/bin/env node
/**
 * PreToolUse gate for Figma create_new_file.
 *
 * Exists because the dash ban was written in prose, repeated in a command
 * file, and broken anyway, twice. The file name is the one string that cannot
 * be repaired after the fact: figma.root.name throws "Setting the document
 * name is currently not supported", so only the user can fix it by hand.
 * That makes it the one worth blocking on rather than trusting to memory.
 *
 * Written in node rather than bash+jq because jq is not installed here.
 */
'use strict';
const path = require('path');

let raw = '';
process.stdin.on('data', (c) => { raw += c; });
process.stdin.on('end', () => {
  let name = '';
  try {
    const payload = JSON.parse(raw || '{}');
    const input = payload.tool_input || {};
    name = input.fileName || input.name || '';
  } catch { process.exit(0); }            // unparseable payload: do not block

  if (!name) process.exit(0);             // nothing to check

  // Resolve nameCheck.js relative to THIS file first. The hook and the checker
  // ship together inside .claude/, so __dirname/../skills/... holds both in a
  // cloned repo and in a plugin install. CLAUDE_PROJECT_DIR does not: for a
  // plugin user it points at their own project, which has no skills/ tree, so
  // the gate used to fail open and silently never fire for exactly the people
  // who installed it on purpose.
  const candidates = [
    path.join(__dirname, '..', 'skills', 'design-from-references', 'scripts', 'nameCheck.js'),
    ...[process.env.CLAUDE_PLUGIN_ROOT, process.env.CLAUDE_PROJECT_DIR, process.cwd()]
      .filter(Boolean)
      .map((root) => path.join(root, '.claude/skills/design-from-references/scripts/nameCheck.js')),
  ];

  let check;
  for (const candidate of candidates) {
    try { check = require(candidate).check; break; } catch { /* try the next one */ }
  }
  if (!check) process.exit(0);            // checker missing: fail open, never wedge the tool

  const problems = check(name);
  if (!problems.length) process.exit(0);

  const detail = problems
    .map((p) => `${p.rule} (found ${p.found}): ${p.fix}`)
    .join('; ');
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `"${name}" carries an AI tell. ${detail}. This matters more than usual here: ` +
        `a Figma file name cannot be changed by script afterwards, only by the user by hand. ` +
        `Choose a different name and call create_new_file again.`,
    },
  }));
  process.exit(0);
});
