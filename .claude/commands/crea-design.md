---
description: Crea un design (Figma o codice) imparando dal dataset di reference + metodo webartist
argument-hint: "[categoria opzionale]"
---

Avvia il flusso **design-from-references**.

Invoca la skill `design-from-references` e seguine la procedura per intero:
1. `Glob data/datasets/*.json` per le categorie disponibili. Se la categoria richiesta manca o e' magra → invoca l'agente `dataset-builder` (ricerca online) per costruirla.
2. **Chiedi categoria + cluster** (dal dataset file) — a meno che l'utente non l'abbia gia' indicata qui: $ARGUMENTS
3. Leggi la research dal dataset file (`data/datasets/<categoria>.json`) e **guarda gli screenshot** dei siti sorgente. Font e colori REALI vengono da li'.
4. Applica le direttive della skill **webartist** (interview leggera → research = dataset → tabella observed→applied tracciabile → plan → check UX/WCAG/anti-slop → build → critique).
5. Costruisci il design (default: Figma via MCP, diviso su piu' pagine; oppure codice se richiesto) e verifica con screenshot accanto alle reference.

Regola d'oro: ogni scelta cromatica/tipografica/strutturale deve citare una reference del dataset. Impara dai migliori, non copiarli.
