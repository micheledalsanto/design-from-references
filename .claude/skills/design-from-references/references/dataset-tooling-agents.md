# Dataset, Agenti, Robustezza, Tooling, Template

## Dataset & categorie (gate 0)
`Glob data/datasets/*/dataset.json` → le categorie disponibili sono i dataset presenti.
Se la categoria richiesta non ha un dataset (o e' magro/monotono / vecchio) →
invoca l'agente **`dataset-builder`** per costruirlo con ricerca online, poi procedi.
Non inventare reference.

**Dataset — forma attesa** (`data/datasets/<category-slug>/dataset.json`, scritto da
`dataset-builder`; se un campo manca degrada con grazia, non allucinare):
```
{ category, researchedAt,
  sites:[{ url, slug,
           screenshots:{desktop, mobile},   // path relativi alla cartella categoria
           design,                          // <site>/design.md — analisi usabile
           fonts:{display,body,mono}, colors:[#…], bg:#…, accent:#…,
           structure:[…], mood:[…], whatWorks, avoid }],
  clusters:[{ label, memberUrls:[…], summary }] }
```
Struttura su disco: `data/datasets/<cat>/dataset.json` +
`data/datasets/<cat>/<site>/{desktop.png, mobile.png, design.md}`.
→ **`fonts`/`colors` sono REALI misurati online: USALI (vedi PLAN), non scegliere a
caso.** **Guarda gli screenshot full-page (desktop+mobile) e leggi i `design.md`** per
composizione e "how to apply". Se il file e' magro/monotono, amplialo con `dataset-builder`.

## Agent Contracts
Cosa devono restituire gli agenti paralleli (definiti in `.claude/agents/`):
- **`design-content`** — per OGNI schermata: headline, subheadline, CTA, microcopy,
  label, empty/error/success states, e tutto il copy della schermata; tono coerente
  col brand positioning; nella lingua del brief; mai buzzword/lorem.
- **`design-verifier`** (read-only) — controlla: clipping/altezza frame, contrasto,
  layout/overflow, gerarchia, **component states**, responsive, **somiglianza
  eccessiva alle reference**, **presenza della signature element**. Riporta
  PASS/FAIL con nodeId e fix; non modifica Figma.
- **`image-sourcer`** — foto reali pertinenti via ricerca+fetch (no API key); torna
  `localPath`, `sourceUrl`, `author`, `platform`, `alt`, `treatment`. Non tocca Figma.
- **`dataset-builder`** — ricerca online, screenshot full-page desktop+mobile,
  `design.md` per sito, scrive `data/datasets/<cat>/dataset.json`.

## Robustezza (unhappy path & iterazioni)
- **Dataset ancora magro dopo `dataset-builder`:** avvisa l'utente e dichiara
  esplicitamente piu' invenzione (non allucinare font/colori "misurati").
- **MCP Figma cade a meta':** i `use_figma` sono atomici; riprendi dallo stato reale
  (`get_metadata`) e dal Decision Register, non da memoria.
- **Revision Strategy (post-consegna):** classifica la modifica e interveni al livello
  giusto, senza rifare tutto:
  - *Surface* (colore/font/spacing/copy) → modifica token/componenti.
  - *Structural* (nuove sezioni/IA/flow) → torna a IA + Journey (3.3).
  - *Concept* (metafora/tono/target) → torna a Originality Engine (2.5).
  - *Dataset* (categoria/cluster) → riparti da Research (2).
  Aggiorna sempre il Decision Register.

## Output Templates
**Strategic Brief:** `Brand · Category/Cluster · Deliverable · Language · Audience ·
Goal · Primary action · Success metric · Archetype · 5s-takeaway · Avoid`

**Creative Thesis:** formato obbligatorio in `originality-engine.md` (punto 1).

**Territory (×3):** `Name · Metaphor · From references · What it breaks · Image
treatment · Type mood · Risk · Why memorable` → poi la scelta motivata.

**Observed → Applied (tabella):**
`| Observed evidence | Source (site) | Evidence quality (H/M/L) | Applied decision | Reason |`

**Final Score:** una riga per dimensione `Dim: n/5`, poi verdetto (itera se <4 su
Originalita'/Chiarezza UX).

## Tooling Notes
La tecnica sta qui, separata dal metodo (puo' cambiare senza toccare l'impianto creativo).

**Path temporaneo (portabile):** Windows `c:/tmp/<project>-decisions.md`, Unix/Mac
`/tmp/<project>-decisions.md`. Usa quello disponibile nell'ambiente corrente.

**Figma (MCP):**
- `use_figma` mai in parallelo (un solo costruttore). Carica `figma-use` prima.
- `figma.createImageAsync` NON e' supportato in `use_figma` → usa il tool MCP
  **`upload_assets`** (con `nodeId`): scarica i byte con `curl -L`, poi POSTali al
  `submitUrl` con `Content-Type` corretto. Per B&W: `fills[0].filters.saturation=-1`.
- Anti-clipping: dopo aver aggiunto i figli, imposta sul root
  `primaryAxisSizingMode='AUTO'` (il `resize(w,900)` lo lascia fisso).

**Contrast audit:** `node .claude/skills/design-from-references/scripts/contrast.js
"#fg:#bg" ...` (exit 1 se almeno una coppia FAIL).
