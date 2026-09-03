<div align="center">

# Design from References

### Learn aesthetics from the best-rated sites on the web — then generate original, accessible, production-grade Figma design systems.

*Nothing hardcoded. Every font and colour is **measured** from real award-winning sites. Every screen is **original**, **WCAG-checked**, and **component-driven**.*

<br/>

![Cover](docs/screenshots/cover.png)

<br/>

[![CI](https://github.com/micheledalsanto/design-from-references/actions/workflows/ci.yml/badge.svg)](https://github.com/micheledalsanto/design-from-references/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-3da638)](LICENSE)
[![Built with Claude Code](https://img.shields.io/badge/built%20with-Claude%20Code-d97757)](https://claude.com/claude-code)
[![Figma MCP](https://img.shields.io/badge/Figma-MCP-1e1e1e?logo=figma)](https://www.figma.com)
[![Accessibility](https://img.shields.io/badge/contrast-WCAG%20AA%2FAAA-1f6b48)](#-principles)
![Components](https://img.shields.io/badge/screens-5%20%C3%97%20desktop%20%2B%20mobile-5b5750)
![No slop](https://img.shields.io/badge/anti--AI--slop-yes-141414)

</div>

---

## What is this?

**Design from References** is a system of **[Claude Code](https://claude.com/claude-code) skills + agents** that does two things:

1. **Researches the best.** The `dataset-builder` agent goes online, navigates award-winning / highly-rated sites with Playwright, and **measures their real design DNA** — fonts and colours via `getComputedStyle`, full-page screenshots (desktop **and** mobile), and a written `design.md` analysis per site. The result is a reusable, *evidence-based* aesthetic dataset.

2. **Creates from it.** The `design-from-references` skill uses that dataset as **research material only** — then runs an *Originality Engine* (creative thesis, three territories, a signature element), the **webartist** method (UX laws, WCAG, anti-slop), and builds a complete **component-driven** design in Figma via the MCP, with parallel agents for copy, imagery, and QA.

> The reference sites teach *taste*. The agent invents the *product* — original copy, multiple screens, a real component library, and a sellable file structure.

---

## 🎨 The showcase — *Plumbline Investment Partners*

A full corporate-website design system generated end-to-end from the **"Swiss Clean Precision"** style cluster of the `corporate website` dataset.

- **Creative thesis** — *a plumbline finds true vertical*: a vertical reference line with measurement ticks and a weight runs through the layout — a signature derived from the brand name.
- **Measured palette** — warm paper `#f4f2ef` · ink `#141414` · deep green `#1f6b48` (the cluster's accent, darkened to pass WCAG AA). **Geist + Geist Mono** as declared substitutes for the real grotesques measured in the cluster.
- **Component-driven** — Foundations → Components (with states) → Screens **composed from instances**.
- **5 screens × desktop + mobile**, real B&W photography, full accessibility pass.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/home-desktop.png" alt="Home — desktop"/><br/><sub><b>Home</b> · hero + plumbline signature, metrics, data-table portfolio</sub></td>
    <td width="50%"><img src="docs/screenshots/portfolio-desktop.png" alt="Portfolio — desktop"/><br/><sub><b>Portfolio</b> · 10-row editorial data table</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/screenshots/team-desktop.png" alt="Team — desktop"/><br/><sub><b>Team</b> · partner cards with real B&amp;W portraits</sub></td>
    <td width="50%"><img src="docs/screenshots/contact-desktop.png" alt="Contact — desktop"/><br/><sub><b>Contact</b> · accessible form with field states</sub></td>
  </tr>
</table>

<table>
  <tr>
    <td width="32%"><img src="docs/screenshots/home-mobile.png" alt="Home — mobile"/><br/><sub><b>Mobile</b> · single-column, hamburger nav</sub></td>
    <td width="68%"><img src="docs/screenshots/foundations.png" alt="Foundations"/><br/><sub><b>Foundations</b> · colour tokens, type scale, spacing — all from measured data</sub></td>
  </tr>
</table>

---

## ⚙️ How it works

```
        ┌─────────────────┐     real award-winning / highly-rated sites
        │ dataset-builder │ ◀── Playwright: getComputedStyle + full-page shots
        └────────┬────────┘
                 │ writes  data/datasets/<category>/
                 ▼            ├── dataset.json   (measured fonts + colours + clusters)
                 │            └── <site>/{desktop.png, mobile.png, design.md}
        ┌────────▼─────────────────┐
        │ design-from-references   │  the orchestrator skill
        │  0 research (dataset)    │
        │  1 strategy + cluster    │
        │  2a COUNT the references │  datasetTally.js + designNotesScan.js → constraints file
        │  2.5 ORIGINALITY ENGINE  │  thesis · territories · signature · trend filter
        │  3 plan + A11y/UX gates  │  constraints re-read · contrast.js · ux-laws
        │  4 BUILD (Figma MCP)     │  Foundations → Components → Screens (instances)
        │  5 verify render gate    │  design-verifier (clipping/contrast/overflow)
        │  6 score + ship          │
        └──────────┬───────────────┘
                   │ parallel agents
        ┌──────────┴───────────────────────────────┐
        │ design-content · image-sourcer · design-verifier │
        └──────────────────────────────────────────┘
```

The long skill is split into a lean orchestrator (`SKILL.md`) plus **on-demand `references/`** files — so the gate detail loads only when needed (no context rot).

---

## 🧩 Architecture

| Piece | Path | Role |
|---|---|---|
| **Orchestrator skill** | `.claude/skills/design-from-references/` | Role, modes, gate overview + `references/*.md` (loaded on demand) |
| **Contrast tool** | `.claude/skills/.../scripts/contrast.js` | WCAG ratio CLI (Node, zero deps) |
| **Dataset tally** | `.claude/skills/.../scripts/datasetTally.js` | Counts the references before any direction is fixed — background lightness, free accent hue bands, slop-flagged fonts, type pairing, shared sections. Writes a **binding constraints file** re-read at the plan gates |
| **Design notes scan** | `.claude/skills/.../scripts/designNotesScan.js` | Counts what the JSON can't: hero composition, photography, headline size, stat blocks, press logos, **corner radius, surface treatment and radius uniformity** — by reading the per-site `design.md`. Reports `unknown` rather than guessing, which for geometry is most of the time |
| **House-style tally** | `.claude/skills/.../scripts/houseStyleTally.js` | Regenerates the gate 2c ban table **from the corpus** instead of trusting the prose. `--check` exits 1 when the skill's numbers and the datasets disagree — which they had, silently: the table cited 7 categories while the corpus had grown to 11 |
| **Name gate** | `.claude/hooks/nameGate.js` | `PreToolUse` hook that **blocks** `create_new_file` when the Figma file name carries an AI tell (pause dash, kebab slug, slop word). It gates rather than warns because `figma.root.name` cannot be set by script — a bad file name is the one thing only the user can repair, by hand |
| **Method** | `.claude/skills/webartist/` | UX laws, WCAG, anti-slop, motion (delegated to — **bundled**) |
| **Agents** | `.claude/agents/` | `dataset-builder`, `design-content`, `image-sourcer`, `design-verifier` |
| **Commands** | `.claude/commands/` | `/design` (+ `/crea-design`, Italian alias) · `/imagePrompts` for image-generation prompts grounded in the measured art direction · `/publish-data` and `/publish-screenshots` for shipping a finished file to the Figma Community |
| **Dataset** | `data/datasets/<category>/` | Generated by the `dataset-builder` agent (one folder per category). Gitignored by policy, so `npm run dataset:backup` exists — git cannot be its backup |
| **Docs** | `docs/` | gate system + "sellable" Figma file blueprint |
| **Tests** | `test/run.js` | `npm test` — the same suite CI runs, zero dependencies. Pins the numbers the counting scripts must keep producing against a frozen fixture dataset |

---

## 🛡️ Principles

- **Measured, not hallucinated.** Fonts and colours come from real `getComputedStyle` data. The skill *forbids* default fonts/colours unless they trace to the dataset or a declared invention.
- **Counted, not remembered.** Before a direction is fixed, `datasetTally.js` and `designNotesScan.js` tabulate what the references actually do, and the resulting constraints file is re-read when tokens are chosen and again by the internal critic. This exists because the opposite failed: a design was once built on a dark background taken from **1 reference out of 10** (the other 9 were light) and had to be rebuilt. The same discipline is applied to the skill's own rules — a hand-written ban on "headlines above 56px" was **removed** when the scan measured 7 of 9 references above it.
- **Original, not a clone.** The Originality Engine enforces an *anti-copy distance* (≥3 dimensions different from any single reference) and a proprietary **signature element**.
- **Accessible by gate.** Every text/background pair is measured with `contrast.js` (AA min); focus, target size, reduced-motion from the WCAG checklist.
- **Component-driven & sellable.** Build order is enforced: **Foundations → Components (with variants/states) → Screens from instances** — never the reverse. No empty pages, no cropped frames (bbox-verified).
- **Verified before "done".** A read-only `design-verifier` must pass (clipping, overflow, contrast, states) before any screen is declared finished.
- **Checked against the outside critique, not only our own taste.** The anti-slop rules here grew from designs this repo's reviewer rejected — which made them sharp about type, colour, imagery and naming, and blind elsewhere. Section 7 of `references/antiSlop.md` adds the tells the published criticism of AI design names and these gates did not measure: **uniform geometry** (one radius, one padding, one shadow on every surface), **missing focus/disabled/empty/loading states**, **semantic** accessibility beyond contrast (`alt="image"`, "Click here", decorative heading order), motion applied as default finish, and **invented social proof** presented as fact. Where the outside advice contradicts what this repo measured — "just use Playfair Display", "switch to APCA" — the measurement wins, and the disagreement is written down.

---

## 🚀 Install & use

**As a Claude Code plugin** (recommended — works in any project):

```text
/plugin marketplace add micheledalsanto/design-from-references
/plugin install design-from-references@design-from-references
```

**Or clone the repo** and open it in Claude Code — everything loads from `.claude/`.

Then, with the Figma MCP connected:

```text
# 0) Build a category dataset first — reference material is generated
#    locally by the dataset-builder agent (nothing is bundled with the repo).
"Use the dataset-builder agent for the 'restaurant' category"

# 1) Generate a design
/design             →  pick category + style cluster + language, then watch it build

# 2) Ship it to the Figma Community, if that is the destination
/publish-data          →  every field the publish dialog asks for, counted from the file
/publish-screenshots   →  the 2:1 carousel, exported and checked at thumbnail size
```

The only external requirement is **Node** (for `contrast.js`, `datasetTally.js` and `designNotesScan.js` — all zero-dependency). No server, no API keys, no build step.

---

## 📁 Repo structure

```
.claude/
  skills/design-from-references/   orchestrator + references/ + scripts/
  skills/webartist/                the method: UX laws, WCAG, anti-slop, motion (bundled)
  agents/                          dataset-builder · design-content · image-sourcer · design-verifier
  commands/                        design.md (/design) · crea-design.md (Italian alias)
                                   imagePrompts.md (prompts for generated imagery)
                                   publish-data.md · publish-screenshots.md (Community listing)
  hooks/                           nameGate.js — blocks a Figma file name that carries an AI tell
.claude-plugin/                    plugin + marketplace manifests (installable via /plugin)
test/                              run.js (`npm test`) + fixtures/ — the frozen dataset CI counts against
data/datasets/<category>/          measured datasets — generated locally, never committed (gitignored in full)
docs/                              system docs + screenshots/
```

Want to add a category dataset or improve the skills? See **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## 📝 Credits & licensing

Everything in this repo (skills, agents, scripts) is **[MIT licensed](LICENSE)** — fork it, adapt it, ship it.

Plumbline (the showcase) is a **fictional brand** built as a design comp. Photography is royalty-free (Unsplash License): hero by *Kilyan Sockalingum*; portraits by *Vitaly Gariev, Ali Morshedlou, Christina @ wocintechchat.com, Willian Souza*. Figures marked `*` are illustrative. Measured reference fonts are credited in the file's **Foundations & Docs** page.

<div align="center"><sub>Made with Claude Code · Figma MCP · the webartist method</sub></div>
