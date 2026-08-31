---
description: Crea un design (Figma o codice) imparando dal dataset di reference + metodo webartist (alias italiano di /design)
argument-hint: "[categoria opzionale]"
---

Alias italiano di `/design`: invoca la skill `design-from-references` e seguine la procedura per intero — dataset (`Glob data/datasets/*/dataset.json`; se la categoria manca o e' magra → agente `dataset-builder`) → chiedi categoria + cluster → research dal dataset (font/colori REALI, screenshot) → **conteggio (gate 2a)** → metodo webartist → build (Figma via MCP, multi-pagina; o codice) → verifica.

**Conta prima di scegliere (gate 2a, bloccante).** Prima di fissare qualunque direzione esegui entrambi:
- `node .claude/skills/design-from-references/scripts/datasetTally.js <categoria> [--cluster "…"]` — fondo chiaro/scuro, zone di tinta libere per l'accento, font segnalati come slop, accoppiamento tipografico, sezioni comuni. Scrive `<tmp>/<categoria>-constraints.md`.
- `node .claude/skills/design-from-references/scripts/designNotesScan.js <categoria> [--quotes]` — composizione hero, fotografia, dimensione titoli, blocchi statistici, loghi stampa, letti dai `design.md`. `unknown` significa *guarda lo screenshot*, mai tirare a indovinare.

Stampa il conteggio e **segui la maggioranza**. Andare contro un verdetto richiede una ragione dichiarata e il consenso dell'utente, registrato nella tabella Deviations del file. Rileggi il file quando fissi token e tipografia, e passalo a `design-verifier` in fase di verifica.

Categoria eventualmente gia' indicata: $ARGUMENTS

Regola d'oro: ogni scelta cromatica/tipografica/strutturale deve citare una reference del dataset. Impara dai migliori, non copiarli — e se una scelta contraddice il conteggio serve una ragione dichiarata, non una sensazione.
