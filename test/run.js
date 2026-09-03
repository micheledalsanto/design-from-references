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

// ---------------------------------------------------------------- design.md front matter

describe('designNotesScan.js front matter (stated beats narrated)', () => {
  const root = path.join(tmp, 'fmRoot');
  const note = (slug, fm, body) => {
    const dir = path.join(root, 'demoCat', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'design.md'), `---\n${fm}\n---\n# ${slug}\n## Layout\n${body}\n`);
  };
  fs.mkdirSync(path.join(root, 'demoCat'), { recursive: true });
  fs.writeFileSync(path.join(root, 'demoCat', 'dataset.json'),
    JSON.stringify({ category: 'demoCat', sites: [{ slug: 'siteA' }, { slug: 'siteB' }] }));
  note('siteA', 'cornerRadiusPx: 2\nsurface: flat\nradiusUniformity: single\nheadlinePx: 88\nphotography: colour\nitalicDisplay: no', 'A restrained editorial grid.');
  note('siteB', 'cornerRadiusPx: 24\nsurface: shadowed\nradiusUniformity: varied\nheadlinePx: 40\nphotography: desaturated\nitalicDisplay: yes', 'Card-heavy.');

  const scan = () => JSON.parse(execFileSync(process.execPath,
    [notesScan, 'demoCat', '--dataset-root', root, '--json'], { cwd: ROOT, encoding: 'utf8' }));
  const dim = (s, k) => s.dimensions.find((d) => d.key === k);

  it('answers the geometry rows the prose never could', () => {
    // These come back unknown for every note in the real corpus: design.md is
    // written for a human and rarely states a radius. Section 7a calls
    // uniformity a tell this repo never counted -- never stated, never counted.
    const s = scan();
    assert(dim(s, 'CORNER RADIUS').unknown === 0, 'corner radius should be fully stated');
    assert(dim(s, 'SURFACE TREATMENT').unknown === 0, 'surface should be fully stated');
    assert(dim(s, 'RADIUS UNIFORMITY').unknown === 0, 'radius uniformity should be fully stated');
  });

  it('maps numbers to buckets and short values to full bucket names', () => {
    const s = scan();
    const radius = dim(s, 'CORNER RADIUS').counts;
    assert(radius['sharp (0-4px)'] === 1 && radius['round (>16px)'] === 1, `2px and 24px should split: ${JSON.stringify(radius)}`);
    const head = dim(s, 'HEADLINE SIZE').counts;
    assert(head['>56px'] === 1 && head['<=56px'] === 1, `88px and 40px should split: ${JSON.stringify(head)}`);
    const photo = dim(s, 'PHOTOGRAPHY').counts;
    assert(photo['desaturated/B&W'] === 1, `"desaturated" should reach the full bucket: ${JSON.stringify(photo)}`);
  });

  it('records that the value was stated, not matched', () => {
    assert(dim(scan(), 'SURFACE TREATMENT').stated === 2, 'both notes stated their surface');
  });

  it('never coerces an unrecognised value into the nearest bucket', () => {
    const dir = path.join(root, 'demoCat', 'siteA', 'design.md');
    const original = fs.readFileSync(dir, 'utf8');
    fs.writeFileSync(dir, original.replace('surface: flat', 'surface: glassmorphic'));
    const r = node([notesScan, 'demoCat', '--dataset-root', root]);
    fs.writeFileSync(dir, original);
    assert(/not recognised/.test(r.stderr), `the bad value must be named, got: ${r.stderr.trim()}`);
    assert(/glassmorphic/.test(r.stderr), 'the offending value must appear in the warning');
    assert(!/flat/.test(r.stdout.split('SURFACE TREATMENT')[1] || ''), 'it must not fall into a bucket anyway');
  });

  it('leaves prose-only notes counting exactly as before', () => {
    // The whole real corpus has no front matter yet. If adding it changed the
    // fallback, every pinned number in this suite would be measuring something
    // new -- so the pins above are also this test's assertion.
    const s = JSON.parse(execFileSync(process.execPath,
      [notesScan, 'longevityClinic', '--dataset-root', FIXTURES, '--json'], { cwd: ROOT, encoding: 'utf8' }));
    assert(dim(s, 'CORNER RADIUS').unknown === 10, 'prose fallback must still report unknown');
    assert(dim(s, 'HEADLINE SIZE').counts['>56px'] === 7, 'the 7-above-56px pin must survive');
  });
});

// ---------------------------------------------------------------- houseStyleTally.js

describe('houseStyleTally.js (gate 2c is generated, not typed)', () => {
  const houseStyle = path.join(SCRIPTS, 'houseStyleTally.js');

  it('aggregates the fixture corpus and reports the corpus size', () => {
    const r = exits(0, [houseStyle, '--dataset-root', FIXTURES]);
    assert(/1 categories/.test(r.stdout), `expected the fixture's single category, got:\n${r.stdout}`);
    assert(/10\s*\nsites|10 sites/.test(r.stdout), `expected 10 sites, got:\n${r.stdout}`);
  });

  it('carries the markers so SKILL.md can be spliced', () => {
    const { BEGIN, END } = require(path.join(ROOT, houseStyle));
    const r = exits(0, [houseStyle, '--dataset-root', FIXTURES]);
    assert(r.stdout.includes(BEGIN) && r.stdout.includes(END), 'generated block is missing its markers');
  });

  it('the background verdict matches what datasetTally counted', () => {
    // Same pinned number as the tally test, reached by a different route: if
    // the aggregation ever stops reading the rows correctly, this diverges.
    const r = exits(0, [houseStyle, '--dataset-root', FIXTURES]);
    assert(/light wins in \*\*1\/1\*\*/.test(r.stdout), `expected 1/1 categories, got:\n${r.stdout}`);
    assert(/\(9-1\)/.test(r.stdout), `expected the 9-1 split, got:\n${r.stdout}`);
  });

  it('counts italics in a display context, and skips italic pull quotes', () => {
    // The dimension matched NOTHING across the whole corpus before this: it was
    // scoped to the Type section and required the phrase "italic keyword",
    // while the notes write "centered italic serif headline overlay". The
    // 6/70 in gate 2c came from a hand grep, not from the script.
    const scan = JSON.parse(
      execFileSync(process.execPath, [notesScan, 'longevityClinic', '--dataset-root', FIXTURES, '--json'], {
        cwd: ROOT, encoding: 'utf8',
      })
    );
    const ital = scan.dimensions.find((d) => d.key === 'ITALIC DISPLAY');
    assert(ital, 'ITALIC DISPLAY dimension is missing');
    const yes = (ital.counts || {}).yes || 0;
    // Ezra, Fountain Life, Function Health -- the exact three the run log names.
    assert(yes === 3, `expected 3 italic-display sites in longevityClinic, got ${yes}`);
  });

  it('refuses to invent a table when there is no corpus', () => {
    const r = exits(2, [houseStyle, '--dataset-root', path.join(tmp, 'nothing-here')]);
    assert(/nothing to measure/.test(r.stderr), `expected a clear refusal, got: ${r.stderr.trim()}`);
  });
});

// ---------------------------------------------------------------- datasetBackup.js

describe('datasetBackup.js (git is not the corpus backup, and cannot be)', () => {
  const backup = path.join(SCRIPTS, 'datasetBackup.js');
  const dest = path.join(tmp, 'backups');

  it('copies the measured text and leaves the screenshots behind', () => {
    const r = exits(0, [backup, '--dataset-root', FIXTURES, '--dest', dest]);
    assert(/1 categories, 10 sites/.test(r.stdout), `unexpected summary: ${r.stdout}`);
    const dir = fs.readdirSync(dest).find((d) => /^datasets-/.test(d));
    assert(dir, 'no dated backup directory was created');
    const manifest = JSON.parse(fs.readFileSync(path.join(dest, dir, 'manifest.json'), 'utf8'));
    assert(manifest.sites === 10, `manifest should record 10 sites, got ${manifest.sites}`);
    assert(manifest.screenshots === false, 'text-only backup must say so in the manifest');
    // The half that was actually lost has to be the half that is saved.
    const files = [];
    (function walk(d) {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        if (e.isDirectory()) walk(path.join(d, e.name)); else files.push(e.name);
      }
    })(path.join(dest, dir));
    assert(files.includes('dataset.json'), 'dataset.json was not backed up');
    assert(files.filter((f) => f === 'design.md').length === 10, 'not every design.md was backed up');
    assert(!files.some((f) => /\.png$/i.test(f)), 'screenshots must be skipped by default');
  });

  it('never overwrites an earlier backup taken the same day', () => {
    // A second run after a loss must not replace the good copy with the bad one.
    exits(0, [backup, '--dataset-root', FIXTURES, '--dest', dest]);
    const dirs = fs.readdirSync(dest).filter((d) => /^datasets-/.test(d));
    assert(dirs.length === 2, `expected two distinct backups, got ${JSON.stringify(dirs)}`);
  });

  it('refuses to write an empty backup when there is no corpus', () => {
    const r = exits(1, [backup, '--dataset-root', path.join(tmp, 'nothing-here'), '--dest', dest]);
    assert(/refusing to write an empty backup/.test(r.stderr), `expected a refusal, got: ${r.stderr.trim()}`);
  });
});

// ---------------------------------------------------------------- constraintsCheck.js

describe('constraintsCheck.js (the build is held against the count)', () => {
  const check = path.join(SCRIPTS, 'constraintsCheck.js');
  const constraints = path.join(tmp, 'constraints.md');
  const buildFile = (name, obj) => {
    const p = path.join(tmp, name);
    fs.writeFileSync(p, JSON.stringify(obj));
    return p;
  };

  // Generated by the real tally, so the parser is tested against the real format.
  exits(0, [tally, 'longevityClinic', '--dataset-root', FIXTURES, '--out', constraints]);

  // The design that was deleted on 2026-08-18: a dark background taken from the
  // 1 reference out of 10, and fonts flagged as slop.
  const rejected = buildFile('rejected.json', {
    background: '#12161a', fonts: ['IBM Plex Sans', 'IBM Plex Mono'], accent: '#6b78ff',
  });
  const sound = buildFile('sound.json', {
    background: '#faf9f6', fonts: ['Söhne', 'GT Sectra Fine'], accent: '#1f6b48',
  });

  it('fails the build that was actually rejected', () => {
    const r = exits(1, [check, '--constraints', constraints, '--build', rejected]);
    assert(/BACKGROUND\s+VIOLATED/.test(r.stdout), `background should be violated:\n${r.stdout}`);
    assert(/FONTS\s+VIOLATED/.test(r.stdout), `slop fonts should be violated:\n${r.stdout}`);
  });

  it('passes a build that agrees with the count', () => {
    const r = exits(0, [check, '--constraints', constraints, '--build', sound]);
    assert(/BACKGROUND\s+HONOURED/.test(r.stdout), `background should be honoured:\n${r.stdout}`);
    assert(!/VIOLATED/.test(r.stdout), `nothing should be violated:\n${r.stdout}`);
  });

  it('the empty Deviations row the template ships excuses nothing', () => {
    // datasetTally writes one blank row. If a blank row counted as a recorded
    // deviation, every verdict would be excusable out of the box.
    const r = exits(1, [check, '--constraints', constraints, '--build', rejected]);
    assert(/VIOLATED/.test(r.stdout), 'a blank Deviations row must not excuse a violation');
  });

  it('a named Deviations row downgrades a violation to DEVIATED', () => {
    const withRow = path.join(tmp, 'constraints-deviated.md');
    fs.writeFileSync(withRow, fs.readFileSync(constraints, 'utf8').replace(
      '|  |  |  |  |  |',
      '| BACKGROUND | light | dark slate | night-time sleep clinic | yes, 2026-09-03 |'
    ));
    const r = exits(1, [check, '--constraints', withRow, '--build', rejected]);
    assert(/BACKGROUND\s+DEVIATED/.test(r.stdout), `background should be deviated:\n${r.stdout}`);
    // Still exit 1: the FONTS violation has no row of its own.
    assert(/FONTS\s+VIOLATED/.test(r.stdout), 'the undocumented violation must survive');
  });

  it('reads the escaped pipes datasetTally writes', () => {
    // "light 9 | dark 1" inside a cell was splitting the binding table into
    // four columns, putting the verdict in the wrong one.
    const { parseConstraints } = require(path.join(ROOT, check));
    const { verdicts } = parseConstraints(fs.readFileSync(constraints, 'utf8'));
    assert(verdicts.BACKGROUND, 'BACKGROUND row not parsed');
    assert(
      /light 9 \| dark 1/.test(verdicts.BACKGROUND.counted),
      `counts should survive unescaping, got: ${verdicts.BACKGROUND.counted}`
    );
    assert(/LIGHT/.test(verdicts.BACKGROUND.verdict), `verdict landed in the wrong column: ${verdicts.BACKGROUND.verdict}`);
  });

  it('refuses a build file that describes none of the counted dimensions', () => {
    const empty = buildFile('empty.json', { notes: 'nothing measurable here' });
    const r = exits(2, [check, '--constraints', constraints, '--build', empty]);
    assert(/nothing could be checked/.test(r.stderr), `expected a refusal, got: ${r.stderr.trim()}`);
  });

  it('bad usage exits 2', () => {
    exits(2, [check]);
    exits(2, [check, '--constraints', constraints, '--build', path.join(tmp, 'nope.json')]);
  });
});

// ---------------------------------------------------------------- originalityCheck.js

describe('originalityCheck.js (gate 2.5 can no longer be skipped)', () => {
  const gate = path.join(SCRIPTS, 'originalityCheck.js');
  const doc = (name, obj) => {
    const p = path.join(tmp, name);
    fs.writeFileSync(p, JSON.stringify(obj));
    return p;
  };

  // Plumbline, the showcase in the README, as gate 2.5 would record it.
  const complete = {
    thesis: 'This interface is built around the idea of a plumbline finding true vertical, expressed through a measured vertical reference line running the full layout, to make users understand that this firm\'s judgement is instrument-grade.',
    territories: [
      { name: 'Plumbline', concept: 'A measuring instrument as the organising grammar', breaks: 'Breaks the centred hero: the page hangs off a vertical axis left of centre' },
      { name: 'Ledger', concept: 'The page as an accounting document with visible rules', breaks: 'Breaks the card grid: the portfolio is a data table with no cards' },
      { name: 'Bedrock', concept: 'Geological strata as a metaphor for long holding periods', breaks: 'Breaks the white background for banded strata of warm stone' },
    ],
    chosen: 'Plumbline',
    chosenBecause: 'It derives from the brand name without illustrating it, and gives every screen the same spine.',
    antiCopyDistance: ['hero composition', 'section rhythm', 'typographic hierarchy'],
    signature: { name: 'The plumbline', description: 'A vertical hairline with measurement ticks and a weight at its foot, threading the full page height' },
    defaults: [
      { default: 'gradient hero', replacedWith: 'Flat warm paper with the plumbline as the only vertical incident' },
      { default: 'huge centred headline', replacedWith: 'Left-hung headline aligned to the plumbline axis' },
      { default: 'floating dashboard mockup', replacedWith: 'A real 10-row editorial data table of holdings' },
      { default: 'blue CTA' },
      { default: 'alternating image/text sections' },
    ],
  };

  it('passes a gate that was actually run', () => {
    const r = exits(0, [gate, '--file', doc('complete.json', complete)]);
    assert(/complete/.test(r.stdout), `expected a pass, got:\n${r.stdout}`);
    // It must say plainly what it cannot judge, so a green line is not
    // mistaken for "the design is good".
    assert(/not that it was good/.test(r.stdout), 'the script must state its own limit');
  });

  it('blocks a gate that was skipped', () => {
    const r = exits(1, [gate, '--file', doc('skipped.json', { thesis: 'A clean, modern investment site.' })]);
    assert(/requirement\(s\) unmet/.test(r.stdout), 'expected a blocking verdict');
  });

  it('rejects the template placeholders left unfilled', () => {
    const r = exits(1, [gate, '--file', doc('placeholder.json', {
      ...complete,
      thesis: 'This interface is built around the idea of [concept], expressed through [visual system], to make users feel [effect].',
    })]);
    assert(/thesis/.test(r.stdout), 'an unfilled template must not pass as a thesis');
  });

  it('requires the thesis to take the mandatory form', () => {
    const r = exits(1, [gate, '--file', doc('freeform.json', { ...complete, thesis: 'A calm, precise site about long-term investing and trust.' })]);
    assert(/mandatory form/.test(r.stdout), 'a free-form sentence is not the thesis format');
  });

  it('refuses a distance dimension that is not one of the seven', () => {
    // Free text here would let "it just feels different" count as distance.
    const r = exits(1, [gate, '--file', doc('vague.json', {
      ...complete, antiCopyDistance: ['hero composition', 'section rhythm', 'it feels different'],
    })]);
    assert(/not a recognised dimension: it feels different/.test(r.stdout), `got:\n${r.stdout}`);
  });

  it('refuses the signatures gate 2.5 explicitly disqualifies', () => {
    const r = exits(1, [gate, '--file', doc('generic.json', {
      ...complete, signature: { name: 'Hero gradient', description: 'A soft gradient behind rounded cards on every surface' },
    })]);
    assert(/signature/.test(r.stdout), 'a gradient and rounded cards are not a signature');
  });

  it('requires three territories in standard, one in fast', () => {
    const one = { ...complete, territories: [complete.territories[0]] };
    exits(1, [gate, '--file', doc('one.json', one)]);
    exits(0, [gate, '--file', doc('oneFast.json', one), '--mode', 'fast']);
  });

  it('counts only the defaults that were actually replaced', () => {
    const r = exits(1, [gate, '--file', doc('unreplaced.json', {
      ...complete, defaults: complete.defaults.map((d) => ({ default: d.default })),
    })]);
    assert(/0 of them replaced/.test(r.stdout), `got:\n${r.stdout}`);
  });

  it('bad usage exits 2', () => {
    exits(2, [gate]);
    exits(2, [gate, '--file', path.join(tmp, 'complete.json'), '--mode', 'turbo']);
  });
});

// ---------------------------------------------------------------- the browser-side audits

describe('webartist browser audits (never executed by anything else)', () => {
  // contrast-audit.js and layout-audit.js run in the PAGE, pasted into devtools
  // or handed to page.evaluate. Nothing in this repo ever loads them, so a
  // syntax error or a drifted formula would sit there indefinitely and only
  // surface mid-QA on a real design.
  const dir = path.join(ROOT, '.claude', 'skills', 'webartist', 'scripts');
  const audits = ['contrast-audit.js', 'layout-audit.js'];

  for (const name of audits) {
    it(`${name} is syntactically valid`, () => {
      const r = node(['--check', path.join(dir, name)]);
      assert(r.code === 0, `${name} does not parse:\n${r.stderr}`);
    });
  }

  it('contrast-audit agrees with contrast.js on the WCAG ratio', () => {
    // It cannot require() contrast.js -- it runs in a browser -- so the
    // luminance formula is duplicated by necessity. What must not happen is the
    // two drifting apart on the one number every gate in this repo depends on.
    const src = fs.readFileSync(path.join(dir, 'contrast-audit.js'), 'utf8');
    const grab = (name) => {
      // Each is a one-liner; matching to end-of-line rather than to the first
      // ";" is what makes `lin` (which has semicolons inside its braces) work.
      const m = new RegExp(`^\\s*const ${name} = .*$`, 'm').exec(src);
      assert(m, `could not find ${name} in contrast-audit.js — has it been rewritten?`);
      return m[0].trim();
    };
    const browserRatio = new Function(
      `${grab('lin')} ${grab('lum')} ${grab('ratio')} return ratio;`
    )();

    const { parseHex, ratio: nodeRatio } = require(path.join(ROOT, contrast));
    const rgb = (hex) => { const [r, g, b] = parseHex(hex); return { r, g, b }; };
    for (const [fg, bg] of [['#ffffff', '#000000'], ['#777777', '#777777'], ['#6b78ff', '#0b0b0b'], ['#1f6b48', '#f4f2ef']]) {
      const a = browserRatio(rgb(fg), rgb(bg));
      const b = nodeRatio(parseHex(fg), parseHex(bg));
      assert(Math.abs(a - b) < 0.01, `${fg}/${bg}: browser says ${a}, node says ${b}`);
    }
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

  it('the Italian alias delegates instead of restating the procedure', () => {
    // The two used to describe the gate sequence separately and had already
    // drifted: /crea-design was missing gates the English one had gained.
    const alias = fs.readFileSync(path.join(ROOT, '.claude', 'commands', 'crea-design.md'), 'utf8');
    assert(/design\.md/.test(alias), 'the alias must point at the one definition');
    assert(
      !/datasetTally\.js/.test(alias),
      'the alias restates the procedure again — it will drift from design.md'
    );
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
