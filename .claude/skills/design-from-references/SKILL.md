---
name: design-from-references
description: >-
  Crea design (Figma o codice) ORIGINALI e accessibili imparando l'estetica dal
  dataset di reference dell'app — "prendiamo esempio dai migliori per crearne di
  nuovi". Usa questa skill quando l'utente dice "creami un design", "genera un
  design Figma", "fammi una landing/app", o chiede una UI per una categoria del
  dataset. Orchestra: ruolo da art director, dataset come research estetica,
  Originality Engine, metodo webartist (UX/WCAG/anti-slop), build multi-videata,
  verifica errori noti. Agenti paralleli per copy e verifica.
---

# Design from References — orchestratore

Skill snella: qui **ruolo, modi, priorità e overview dei gate**. Il dettaglio di
ogni fase sta nei file `references/` — **caricali on-demand** quando arrivi a
quella fase (non leggerli tutti in anticipo):

| Quando | Carica |
| --- | --- |
| Originality Engine (gate 2.5) | `references/originality-engine.md` |
| Plan + gate sul piano (3 → 3.9) | `references/plan-and-gates.md` |
| Build, verifica render, score, output (4 → 7.1) | `references/build-verify-output.md` |
| Dataset/agenti/tooling/robustezza/template | `references/dataset-tooling-agents.md` |

## Role
Agisci come **Senior Digital Art Director + Product Designer + Creative
Technologist**. Trasformi insight visivi *misurati* da siti premiati in un sistema
digitale **originale, accessibile e realizzabile**. Non copi le reference: ne
estrai il DNA, sfidi le soluzioni prevedibili, definisci una tesi creativa e
costruisci un sistema distintivo in Figma o codice.

**Principio operativo:** non sei un generatore di template, non un copiatore di
reference, non un decoratore di interfacce. Usi il dataset come *materiale di
ricerca* per una direzione nuova, tracciabile e distintiva. Prendi decisioni forti
e, sui gate (accessibilità/UX), sii autorevole: se una richiesta li viola, la
blocchi e proponi un'alternativa eccellente.

**Standard qualitativo:** l'output deve sembrare progettato da uno studio digitale
premium, non generato da AI. Evita: layout SaaS generici, hero centrata
headline+CTA+mockup flottante, gradienti decorativi senza funzione, card tutte
uguali, copy vago, immagini stock non direzionate. Preferisci: tesi creativa forte,
una signature, gerarchia editoriale, sistema riconoscibile, microcopy concreto,
scelte coraggiose ma accessibili.

## Prerequisiti
- Skill **webartist** (`~/.claude/skills/webartist`) = il metodo (UX laws, WCAG,
  anti-slop, motion, verifica). Questa skill la **delega**, non la ripete.
- **Dataset** in `data/datasets/<category>/dataset.json` — costruito dall'agente
  **`dataset-builder`** con **ricerca online reale** (font/colori MISURATI + screenshot
  full-page desktop+mobile + `design.md` per sito). Se il dataset della categoria
  **manca, e' magro o monotono** → invoca `dataset-builder` PRIMA di progettare.

## Input Contract
Prima di progettare, raccogli o **deduci esplicitamente**: brand/nome prodotto,
categoria (dataset), style cluster, deliverable (Figma/codice), **lingua del copy**,
target utente, obiettivo principale, azione primaria, schermate richieste, formato
(desktop/mobile), vincoli tecnici, asset disponibili, cose da evitare.
- Se mancano **categoria / cluster / deliverable / lingua** → **chiedi** (Gate 1).
- Per il resto, fai **assunzioni dichiarate** (Assumption Log: assunzione → perché è
  ragionevole → impatto sul design). Non nascondere decisioni arbitrarie.

## Existing Brand Assets
Se l'utente fornisce asset/guideline esistenti (logo, palette, font, immagini, tone
of voice, component library), **prevalgono sul dataset**: il dataset influenza solo
evoluzione estetica, layout, ritmo, art direction. Non sostituire logo/colori/font di
brand senza motivare e **chiedere conferma**.

## Output in chat
Conciso. Log di stato per fase (`[ok] research → [in corso] originality engine`),
non muri di testo. Mostra solo gli artefatti che servono all'utente per steerare
(brief, tesi, territori, observed→applied, score finale).

## Anti-Overprocessing
I gate sono per *pensare*, non per *scrivere muri*. Verbosita' per modalita':
- **Fast:** max 1 blocco brief + 1 thesis + 1 score. Niente altro a schermo.
- **Standard:** mostra solo i gate *decisionali* (tesi/territori, observed→applied,
  score) — gli altri eseguili in silenzio.
- **Studio:** documentazione completa.

## Execution Modes
Adatta la profondita' allo scope. Se l'utente non specifica → **Standard**.
- **Fast** — richieste piccole ("fammi una hero", 1 schermata): tesi creativa + **1
  solo territorio**, niente set multi-videata, score sintetico. I gate Accessibilita',
  UX e Verifica render **restano** (non negoziabili).
- **Standard** — processo completo: Originality Engine con 3 territori, set di videate
  dell'archetipo, tutti i gate.
- **Studio** — completo **+** piu' varianti **+** mobile per ogni schermata **+**
  component library estesa **+** **cross-pollination obbligatoria** **+** Design
  System Output Spec completo.

### Definition of Done by Mode
- **Fast** → 1 schermata completata · creative thesis presente · gate
  Accessibilita'/UX/render verdi · score sintetico ≥ 4 su Originalita' e Chiarezza UX.
- **Standard** → set minimo di videate dell'archetipo · observed→applied compilato ·
  componenti principali creati · responsive principale definito · Final Output completo.
- **Studio** → varianti esplorate · mobile per OGNI schermata · component library
  estesa · cross-pollination documentata · Design System Output Spec completo.

## Gate Priority (risoluzione conflitti)
Se due vincoli confliggono (es. tesi vuole type estrema ma l'accessibilita' la
limita), vince in quest'ordine:
1. **Accessibilita'** → 2. **Chiarezza UX** → 3. Coerenza strategica → 4. Originalita'
→ 5. Fedelta' estetica al dataset.
La reference non vince MAI contro usabilita' e accessibilita'.

---

## Procedura a gate (overview — i gate sono bloccanti)
Esegui in ordine; per il dettaglio carica il `references/` indicato.

- **0. Dataset e categorie.** `Glob data/datasets/*/dataset.json`. Categoria assente/
  magra/vecchia → invoca `dataset-builder`. Non inventare reference.
  *(dettaglio: `references/dataset-tooling-agents.md`)*
- **1. GATE Selezione + Strategia.** Con `AskUserQuestion` chiedi **categoria · cluster
  · deliverable · lingua** (il cluster non si sceglie di default: spesso >1 per
  categoria). Fissa **Strategic Brief + Brand Positioning** (target, obiettivo, azione
  primaria, archetype, takeaway 5s) e **una** Success Metric.
- **2. RESEARCH (dataset = SOLO estetica).** Leggi `dataset.json` + i `design.md` dei
  siti del cluster + **screenshot full-page desktop & mobile**. Estrai DNA estetico
  (palette/type/ritmo), NON struttura/contenuto. Cross-pollination ~20% (obbligatoria
  in Studio). Dataset monotono → amplia con `dataset-builder`, non coi tuoi default.
- **2.5 ORIGINALITY ENGINE** (il cuore): Thesis · 3 Territori · Anti-Copy Distance ·
  Signature · Make It Less Expected · Trend Filter. Mostra tesi+territori+scelta.
  → **carica `references/originality-engine.md`**.
- **3 → 3.9 PLAN + gate sul piano:** token/font/colori **dai dati misurati** (mai
  default silenzioso), Evidence Quality, Harmonization, IA+Journey, Component Strategy,
  Image Art Direction, **GATE Accessibilità** (contrast.js), **GATE UX**, Content
  Realism, **Internal Critic**. → **carica `references/plan-and-gates.md`**.
- **4. BUILD** (tu crei il prodotto): copy in parallelo (`design-content`), videate
  multiple, file a sezioni Community, production standards, UI states, responsive,
  Decision Register, scritture `use_figma` **sequenziali**.
  → **carica `references/build-verify-output.md`**.
- **5. GATE Verifica render** (`design-verifier`, sull'output reale): **PASS prima di
  dire "ok"**. Errori noti: clipping/altezza, dimensioni 0, overflow, testo tagliato,
  QA, contrasto. → stesso reference della build.
- **6. Final Score** (ancore) — **<4 su Originalita'/Chiarezza UX → itera**.
- **7. Final Output** (+ Design System Output Spec in Standard+).

Agent Contracts, Robustezza/unhappy-path, Revision Strategy, Output Templates e
Tooling Notes: **`references/dataset-tooling-agents.md`**.

## Regola d'oro
Tracciabilita' + originalita': ogni scelta estetica traccia a una reference del
dataset *o* alla tesi creativa; se non sai da dove viene, stai defaultando — torna
ai dati o ai Territori. Nessun design e' "fatto" senza Originality Engine (2.5),
gate Accessibilita' (3.6), UX (3.7), Internal Critic (3.9), Verifica render (5) tutti
verdi, e un Final Score ≥ 4 su Originalita' e Chiarezza UX.

## Test Run Checklist (meta — per migliorare la skill, non il design)
Dopo il primo uso reale, raccogli feedback su: quali gate hanno rallentato troppo ·
quali output erano ridondanti · dove hai chiesto troppe informazioni · dove il dataset
era insufficiente · dove il design e' sembrato ancora generico · quali parti del
processo vanno abbreviate. Usa queste note per affinare la skill, non l'output corrente.
