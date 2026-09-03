#!/usr/bin/env node
/**
 * The whole test suite, in one command: `npm test`.
 *
 * These assertions used to live inline in .github/workflows/ci.yml as ~200
 * lines of bash heredocs and `node -e` one-liners. That made them impossible
 * to run locally — CONTRIBUTING told you to paste the commands by hand, so in
 * practice nobody ran them before pushing, and the bash quoting had already
 * been broken once by a YAML edit without anyone noticing.
 *
 * Every assertion here is ported 1:1 from that workflow, pinned numbers
 * included. The pinned numbers are the point: each one is a mistake this repo
 * actually made and does not want back. Read the comment before changing one.
 *
 * Zero dependencies, Node >= 20.
 */
'use strict';

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FIXTURES = path.join('test', 'fixtures', 'datasets');
const SCRIPTS = path.join('.claude', 'skills', 'design-from-references', 'scripts');
const contrast = path.join(SCRIPTS, 'contrast.js');
const nameCheck = path.join(SCRIPTS, 'nameCheck.js');
const tally = path.join(SCRIPTS, 'datasetTally.js');
const notesScan = path.join(SCRIPTS, 'designNotesScan.js');
const nameGate = path.join('.claude', 'hooks', 'nameGate.js');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dfr-test-'));

// ---------------------------------------------------------------- harness

let passed = 0;
const failures = [];
let group = '';

function describe(name, fn) {
  group = name;
  console.log(`\n${name}`);
  fn();
}

function it(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures.push({ group, name, message: err.message });
    console.log(`  FAIL ${name}\n         ${err.message.split('\n').join('\n         ')}`);
  }
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

/** Run a node script and capture exit code + output, without throwing. */
function node(args, opts = {}) {
  const res = spawnSync(process.execPath, args, {
    cwd: opts.cwd || ROOT,
    encoding: 'utf8',
    input: opts.input,
    env: { ...process.env, ...opts.env },
  });
  return { code: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
}

function exits(expected, args, opts) {
  const r = node(args, opts);
  assert(
    r.code === expected,
    `expected exit ${expected}, got ${r.code}\n  argv: ${args.join(' ')}\n  stderr: ${r.stderr.trim()}`
  );
  return r;
}

/** Fixture categories, so an empty fixtures dir fails loudly instead of silently. */
function categories() {
  const dir = path.join(ROOT, FIXTURES);
  const found = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((c) => fs.existsSync(path.join(dir, c, 'dataset.json')));
  assert(found.length > 0, 'no fixture dataset found: these assertions would pass vacuously');
  return found;
}

// ---------------------------------------------------------------- contrast.js

describe('contrast.js', () => {
  it('passing pairs exit 0', () => {
    exits(0, [contrast, '#fff:#000', '#6b78ff:#0b0b0b']);
    exits(0, [contrast, '#ffffff', '#0b0b0b']);
  });

  it('a failing pair exits 1', () => {
    exits(1, [contrast, '#777:#999']);
  });

  it('invalid input exits 2', () => {
    exits(2, [contrast, 'nope:#000']);
  });

  it('no arguments exits 2', () => {
    exits(2, [contrast]);
  });

  it('known ratios are exact', () => {
    const { parseHex, ratio } = require(path.join(ROOT, contrast));
    const check = (fg, bg, expected) => {
      const r = ratio(parseHex(fg), parseHex(bg));
      assert(Math.abs(r - expected) <= 0.01, `${fg}/${bg}: got ${r}, expected ${expected}`);
    };
    check('#ffffff', '#000000', 21);
    check('#fff', '#000', 21); // 3-digit expansion
    check('#777777', '#777777', 1);
  });
});

// ---------------------------------------------------------------- nameCheck.js

describe('nameCheck.js', () => {
  // The exact name that shipped, and the copy that shipped with it.
  const rejected = [
    'Ledger — accessible form validation kit',
    'Otava - wellness landing page',
    'design-from-references-kit',
    'Unlock seamless onboarding',
  ];
  // Ordinary spelling hyphens must survive: banning them produced "e bike"
  // and "real world range" on a shipped project once.
  const accepted = [
    'Ledger, an accessible form validation kit',
    'Fettle e-bike servicing, a 10-year guarantee',
    'real-world range on a mid-drive all-rounder',
    'Kvitto, a pricing table that shows the first year total',
  ];

  for (const name of rejected) {
    it(`rejects: ${name}`, () => exits(1, [nameCheck, name]));
  }
  for (const name of accepted) {
    it(`keeps: ${name}`, () => exits(0, [nameCheck, name]));
  }

  it('no arguments exits 2', () => {
    exits(2, [nameCheck]);
  });
});

// ---------------------------------------------------------------- nameGate.js

describe('nameGate.js (the PreToolUse hook)', () => {
  const payload = (toolInput) => JSON.stringify({ tool_input: toolInput });
  const gate = (input, env) => node([nameGate], { input, env: { CLAUDE_PROJECT_DIR: ROOT, ...env } });

  it('denies a file name carrying a tell, and says why', () => {
    const r = gate(payload({ fileName: 'Ledger — accessible form validation kit' }));
    assert(r.code === 0, `hooks must always exit 0, got ${r.code}`);
    const out = JSON.parse(r.stdout);
    const hook = out.hookSpecificOutput;
    assert(hook.hookEventName === 'PreToolUse', `wrong hookEventName: ${hook.hookEventName}`);
    assert(hook.permissionDecision === 'deny', `expected deny, got ${hook.permissionDecision}`);
    assert(
      /pause-dash/.test(hook.permissionDecisionReason),
      `the reason must name the broken rule, got: ${hook.permissionDecisionReason}`
    );
  });

  it('reads the name from `name` as well as `fileName`', () => {
    const r = gate(payload({ name: 'design-from-references-kit' }));
    assert(JSON.parse(r.stdout).hookSpecificOutput.permissionDecision === 'deny', 'expected deny');
  });

  it('lets a clean name through silently', () => {
    const r = gate(payload({ fileName: 'Kvitto, a pricing table' }));
    assert(r.code === 0 && r.stdout.trim() === '', `expected silence, got: ${r.stdout}`);
  });

  // Three fail-open paths. A hook that wedges create_new_file is worse than a
  // hook that misses a bad name, so each of these must stay silent.
  it('fails open on an unparseable payload', () => {
    const r = gate('not json at all');
    assert(r.code === 0 && r.stdout.trim() === '', `expected silence, got: ${r.stdout}`);
  });

  it('fails open when there is no name to check', () => {
    const r = gate(payload({ somethingElse: 1 }));
    assert(r.code === 0 && r.stdout.trim() === '', `expected silence, got: ${r.stdout}`);
  });

  it('finds the checker by its own location, not by CLAUDE_PROJECT_DIR', () => {
    // A plugin install puts the hook next to the checker but points
    // CLAUDE_PROJECT_DIR at the USER's project, which has no skills/ tree.
    // Pointing it somewhere useless must not stop the gate from firing.
    const r = gate(payload({ fileName: 'Ledger — accessible form validation kit' }), {
      CLAUDE_PROJECT_DIR: tmp,
      CLAUDE_PLUGIN_ROOT: tmp,
    });
    assert(
      JSON.parse(r.stdout).hookSpecificOutput.permissionDecision === 'deny',
      'the gate stopped firing when CLAUDE_PROJECT_DIR pointed elsewhere'
    );
  });

  it('fails open when nameCheck.js really is missing', () => {
    // The hook alone, with no skills/ tree anywhere near it.
    const orphan = path.join(tmp, 'nameGate.js');
    fs.copyFileSync(path.join(ROOT, nameGate), orphan);
    const r = node([orphan], {
      input: payload({ fileName: 'Ledger — accessible form validation kit' }),
      cwd: tmp,
      env: { CLAUDE_PROJECT_DIR: tmp, CLAUDE_PLUGIN_ROOT: tmp },
    });
    assert(r.code === 0 && r.stdout.trim() === '', `expected silence, got: ${r.stdout}`);
  });
});

// ---------------------------------------------------------------- datasetTally.js

describe('datasetTally.js', () => {
  it('runs on every bundled dataset and writes a constraints file', () => {
    for (const c of categories()) {
      const out = path.join(tmp, `${c}.md`);
      exits(0, [tally, c, '--dataset-root', FIXTURES, '--out', out]);
      const written = fs.readFileSync(out, 'utf8');
      assert(written.length > 0, `no constraints file written for ${c}`);
      assert(written.includes('Deviations'), `constraints file for ${c} lacks the Deviations table`);
    }
  });

  it('an unknown category exits 2', () => {
    exits(2, [tally, 'noSuchCategory']);
  });

  it('no arguments exits 2', () => {
    exits(2, [tally]);
  });

  it('verdicts match the data', () => {
    const r = exits(0, [tally, 'longevityClinic', '--dataset-root', FIXTURES, '--out', path.join(tmp, 'lc.md')]);
    // 9 of the 10 sites sit on a light background: the verdict a rejected
    // design got wrong by hand, on a dark background taken from the 1.
    assert(/light 9 \| dark 1/.test(r.stdout), 'background tally changed');
    assert(/-> LIGHT/.test(r.stdout), 'expected a LIGHT verdict');
    // Fonts measured in the dataset must still be flagged as slop.
    assert(/SLOP-FLAGGED/.test(r.stdout), 'slop flagging is not firing');
  });
});

// ---------------------------------------------------------------- datasetRoot.js

describe('datasetRoot.js (what counts as a countable category)', () => {
  // A root with one of each kind of directory.
  const root = path.join(tmp, 'roots');
  const mk = (name, files) => {
    const dir = path.join(root, name);
    fs.mkdirSync(dir, { recursive: true });
    for (const [f, body] of Object.entries(files)) fs.writeFileSync(path.join(dir, f), body);
  };
  mk('goodCategory', { 'dataset.json': JSON.stringify({ sites: [{ slug: 'a' }] }) });
  mk('lostItsText', { 'desktop.png': 'x', 'mobile.png': 'x' }); // the real failure
  mk('emptyOne', {});
  mk('unparseable', { 'dataset.json': '{ not json' });
  mk('noSites', { 'dataset.json': JSON.stringify({ sites: [] }) });

  const { surveyRoot } = require(path.join(ROOT, SCRIPTS, 'datasetRoot.js'));

  it('counts only directories with a dataset.json that parses and has sites', () => {
    const { usable } = surveyRoot(root);
    assert(
      usable.length === 1 && usable[0] === 'goodCategory',
      `expected only goodCategory to be usable, got ${JSON.stringify(usable)}`
    );
  });

  it('names a category that kept its screenshots but lost its measurements', () => {
    // This is the case that stayed invisible: ten categories lost their
    // dataset.json and every design.md to a history rewrite while the
    // gitignored PNGs survived, and the gate listed all of them as available.
    const { broken } = surveyRoot(root);
    const lost = broken.find((b) => b.name === 'lostItsText');
    assert(lost, 'a directory with screenshots but no dataset.json must be reported as broken');
    assert(/measurements lost/.test(lost.why), `expected the loss to be named, got: ${lost.why}`);
    const empty = broken.find((b) => b.name === 'emptyOne');
    assert(/empty/.test(empty.why), `an empty dir is not a data loss, got: ${empty.why}`);
  });

  it('reports the other ways a dataset.json can be unusable', () => {
    const { broken } = surveyRoot(root);
    assert(/does not parse/.test(broken.find((b) => b.name === 'unparseable').why), 'bad JSON');
    assert(/no sites/.test(broken.find((b) => b.name === 'noSites').why), 'empty site list');
  });

  it('both counting scripts report the loss instead of listing it as available', () => {
    for (const script of [tally, notesScan]) {
      const r = node([script, 'lostItsText', '--dataset-root', root]);
      assert(r.code === 2, `${script} should exit 2, got ${r.code}`);
      assert(
        /measurements lost/.test(r.stderr),
        `${script} must name the loss, got: ${r.stderr.trim()}`
      );
      assert(
        !/countable categories \(\d+\):[^\n]*lostItsText/.test(r.stderr),
        `${script} still lists the broken category as countable`
      );
    }
  });
});

// ---------------------------------------------------------------- designNotesScan.js

describe('designNotesScan.js', () => {
  const scanOf = (c) =>
    JSON.parse(
      execFileSync(process.execPath, [notesScan, c, '--dataset-root', FIXTURES, '--json'], {
        cwd: ROOT,
        encoding: 'utf8',
      })
    );

  it('runs on every bundled dataset', () => {
    for (const c of categories()) {
      exits(0, [notesScan, c, '--dataset-root', FIXTURES]);
    }
  });

  it('an unknown category exits 2', () => {
    exits(2, [notesScan, 'noSuchCategory']);
  });

  it('headline sizes are read, not assumed', () => {
    const scan = scanOf('longevityClinic');
    const get = (k) => {
      const d = scan.dimensions.find((x) => x.key === k);
      assert(d, `missing dimension: ${k}`);
      return d;
    };
    // The measurement that disproved the hand-written ">56px is slop" rule.
    const h = get('HEADLINE SIZE');
    assert(h.counts['>56px'] === 7, `expected 7 sites above 56px, got ${JSON.stringify(h.counts)}`);
    // Silence must stay silence: unknown is a valid answer, never a guess.
    const align = get('TEXT ALIGNMENT');
    assert(align.unknown === 10, `alignment should be unknown for all 10 notes, got ${align.unknown}`);
  });

  it('geometry rows never invent a value', () => {
    const scan = scanOf('longevityClinic');
    const get = (k) => {
      const d = scan.dimensions.find((x) => x.key === k);
      assert(d, `missing geometry dimension: ${k}`);
      return d;
    };
    // design.md rarely records radius or elevation, so on this fixture they
    // are almost all unknown -- which is the correct answer, and the one worth
    // protecting: a future loosening of these regexes would start inventing
    // values.
    assert(get('CORNER RADIUS').unknown === 10, 'CORNER RADIUS should be unknown for all 10 notes');
    assert(get('RADIUS UNIFORMITY').unknown === 10, 'RADIUS UNIFORMITY should be unknown for all 10');
    // SURFACE TREATMENT matches one real elevation claim here. It must stay at
    // one: "flat bullet list" is not a flat surface, and the loose
    // word-boundary flat pattern that counted it turned 2 into 7 in saasPricing
    // before the pattern was tightened.
    const surface = get('SURFACE TREATMENT');
    assert(
      surface.known === 1,
      `SURFACE TREATMENT should have exactly 1 stated, got ${surface.known} ${JSON.stringify(surface.counts)}`
    );
  });
});

// ---------------------------------------------------------------- repo integrity

describe('repo integrity', () => {
  it('every site in a dataset has the design.md the scan reads', () => {
    const missing = [];
    for (const c of categories()) {
      const dir = path.join(ROOT, FIXTURES, c);
      const ds = JSON.parse(fs.readFileSync(path.join(dir, 'dataset.json'), 'utf8'));
      for (const s of ds.sites || []) {
        const rel = s.design || `${s.slug}/design.md`;
        if (!fs.existsSync(path.join(dir, rel))) missing.push(`${c}/${rel}`);
      }
    }
    assert(!missing.length, `missing design.md:\n  ${missing.join('\n  ')}`);
  });

  it('plugin and dataset JSON are well-formed', () => {
    const files = [
      path.join('.claude-plugin', 'plugin.json'),
      path.join('.claude-plugin', 'marketplace.json'),
      path.join('.claude', 'settings.json'),
      ...categories().map((c) => path.join(FIXTURES, c, 'dataset.json')),
    ];
    for (const f of files) {
      try {
        JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
      } catch (err) {
        throw new Error(`${f}: ${err.message}`);
      }
    }
  });

  it('everything plugin.json points at exists', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
    const declared = [
      ...(manifest.skills || []),
      ...(manifest.commands || []),
      ...(manifest.agents || []),
      ...(manifest.hooks ? [manifest.hooks] : []),
    ];
    assert(declared.length > 0, 'plugin.json declares nothing');
    const missing = declared.filter((p) => !fs.existsSync(path.join(ROOT, p)));
    assert(!missing.length, `plugin.json points at paths that do not exist:\n  ${missing.join('\n  ')}`);
  });

  it('every references/ and scripts/ path the skills cite exists', () => {
    const skillsDir = path.join(ROOT, '.claude', 'skills');
    const skills = fs.readdirSync(skillsDir).filter((s) => fs.statSync(path.join(skillsDir, s)).isDirectory());
    const cited = /(?:references|scripts)\/[A-Za-z0-9._-]+\.(?:md|js)/g;
    // The two skills cite each other in prose ("webartist/references/ux-laws.md",
    // "design-from-references ships `scripts/datasetTally.js`"), and the skill
    // name is not always adjacent to the path. So a citation counts as live if
    // it resolves under ANY skill root. That still catches what this is for: a
    // filename that exists nowhere, which is how a renamed reference goes
    // silently dead.
    const missing = [];
    for (const skill of skills) {
      const base = path.join(skillsDir, skill);
      const docs = [path.join(base, 'SKILL.md')];
      const refs = path.join(base, 'references');
      if (fs.existsSync(refs)) {
        for (const f of fs.readdirSync(refs)) docs.push(path.join(refs, f));
      }
      for (const doc of docs) {
        if (!doc.endsWith('.md') || !fs.existsSync(doc)) continue;
        const text = fs.readFileSync(doc, 'utf8');
        for (const ref of text.match(cited) || []) {
          const resolves = skills.some((s) => fs.existsSync(path.join(skillsDir, s, ref)));
          if (!resolves) missing.push(`${path.relative(ROOT, doc)} -> ${ref}`);
        }
      }
    }
    assert(!missing.length, `dead links in the skills:\n  ${missing.join('\n  ')}`);
  });
});

// ---------------------------------------------------------------- report

fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) {
  console.log('\nfailures:');
  for (const f of failures) console.log(`  ${f.group} > ${f.name}\n    ${f.message}`);
  process.exit(1);
}
