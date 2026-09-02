# Sistema di autonomia per la generazione di design

Obiettivo: rendere l'agente capace di generare design **affidabili senza
supervisione** — partendo dal dataset di reference (l'app) e applicando il metodo
**webartist**, con **gate automatici** che impediscono di dichiarare "fatto" un
design che non rispetta i criteri di stile, UX e accessibilità.

Finora la generazione funzionava ma richiedeva l'occhio dell'utente per cogliere
errori. Questo documento definisce il processo a gate che chiude quei buchi.

## Gap individuati (perché serve il sistema)

| Gap osservato | Conseguenza | Gate che lo chiude |
|---|---|---|
| Chiesta solo la **categoria**, non lo **stile** | L'app ha più cluster/stile per categoria; ho scelto io di default | Gate 1 — Selezione |
| **Blu #0000ee su nero per testo** (2.09:1) | Testo illeggibile, fallisce WCAG AA | Gate 4 — Accessibilità |
| **Frame Figma tagliato** (root fisso a 900px) | Output incompleto non verificato | Gate 6 — Verifica render |
| Nessuna verifica UX esplicita | Rischio di design bello ma poco usabile | Gate 5 — UX laws |

## Il workflow a gate (ogni gate è bloccante)

```
1. SELEZIONE   categoria + CLUSTER DI STILE (sempre chiesti)
2. RESEARCH    dataset (buildspec/directive/sites) + osserva gli screenshot reali
3. PLAN        webartist: tabella observed→applied, token, type, layout, signature, motion
4. A11Y GATE   contrast audit di OGNI coppia testo/sfondo: testo ≥4.5:1, large/UI ≥3:1
5. UX GATE     ux-laws.md di webartist (Fitts, Hick, Jakob, gerarchia, feedback)
6. BUILD       Figma (MCP) o codice; immagini gratuite keyless (Picsum/upload_assets)
7. RENDER GATE frame integrity (root=hug, niente clipping) + screenshot FULL + ri-misura
```

I gate 4–5 si applicano **sul piano** (prima di costruire) e di nuovo **sul
render** (gate 7), perché un valore può passare in teoria e fallire sull'output
reale (es. testo sopra una foto).

## Criteri di accettazione (da webartist — vincolanti)

Un design è "fatto" solo se TUTTO è verde:

- **Accessibilità** (`webartist/references/wcag-checklist.md`):
  - Contrasto testo ≥ 4.5:1 (≥ 3:1 per testo large ≥24px/bold ≥18.66px e per UI/bordi).
  - Focus tastiera visibile (in codice); target ≥ 24px; HTML semantico; `alt` sulle immagini.
  - `prefers-reduced-motion` rispettato se c'è motion.
- **UX** (`webartist/references/ux-laws.md`):
  - Gerarchia visiva chiara (un protagonista per vista).
  - Azioni primarie evidenti e coerenti (Fitts/Jakob); navigazione prevedibile.
  - Carico cognitivo controllato (Hick/Miller).
- **Anti-slop** (`webartist/references/anti-slop.md`): nessuna scelta "di default";
  ogni colore/font/struttura traccia a una reference del dataset.
- **Integrità render**: il frame contiene tutto (root in hug, nessuna sezione oltre
  i bordi), verificato a schermo, non solo nel codice.

## Strumenti del sistema

- **Selezione stile**: `GET /api/directive` → `styleClusters` (chiedi quale).
- **Conteggio del dataset** (gate 2a, prima di fissare qualunque direzione):
  `scripts/datasetTally.js <categoria>` misura fondo chiaro/scuro, zone di tinta
  libere per l'accento, font segnalati come slop, accoppiamento tipografico e
  sezioni comuni, e scrive `<tmp>/<categoria>-constraints.md` — i cui verdetti
  sono **vincolanti** e vanno riletti quando si fissano i token e nella critica
  interna. `scripts/designNotesScan.js <categoria>` conta ciò che il JSON non
  registra (composizione hero, fotografia, dimensione titoli, statistiche,
  loghi stampa) leggendo i `design.md`; risponde `unknown` invece di inventare.
  Serve perché un design tracciato correttamente a **1 reference su 10** è stato
  rifiutato e rifatto: la citazione era vera, la maggioranza diceva il contrario.
- **Contrast audit**: `.claude/skills/design-from-references/scripts/contrast.js`
  (WCAG 2.x, ratio per coppie hex). Da eseguire su tutte le coppie testo/sfondo del
  piano e sui token usati come testo.
- **Accent leggibile**: se l'accento misurato fallisce come testo, derivarne una
  variante più chiara (mantenendo l'accento "vero" solo per fill/linee/forme grandi).
- **Frame integrity**: dopo il build, `root.primaryAxisSizingMode='AUTO'` e
  `get_metadata`/screenshot del FULL frame per confermare zero clipping.

## Divisione dei ruoli (chiarita)

Le **reference dal dataset = SOLO estetica** (palette, tipografia, mood, sensazione
del layout). Tutto il resto lo produce l'agente:

1. **Contenuti & copy** realistici e appropriati, **in inglese** (titoli, intro,
   nomi progetto, descrizioni, label, CTA, microcopy, stati vuoti/errore). Mai
   "lorem ipsum"; copy credibile per il soggetto.
2. **Più videate** (non una sola landing). Set minimo per archetipo:
   - *Portfolio*: Home, Work (index), Project detail (case study), About/Studio, Contact.
   - *SaaS*: Landing, Pricing, Features, Login/Signup, Dashboard.
   - *E-commerce*: Home, Listing (PLP), Product (PDP), Cart, Checkout.
   Ogni schermata **desktop + mobile** dove sensato.
3. **File Figma organizzato in sezioni** come i file Community più visti:
   `📕 Cover` · `📖 Documentation` · `🎨 Foundations` · `🧩 Components` ·
   `🖥 Screens` (una pagina o sezione per gruppo di videate) · `🌊 Flows` (opz).
   Thumbnail/emoji per navigare; nomi coerenti.
4. **Verifica ad ogni implementazione** (gli "errori noti", vedi sotto).

## Errori noti da verificare SEMPRE (gate render esteso)

Dopo OGNI schermata costruita, controlla e correggi:
- **Altezza frame / clipping**: root e sezioni in `primaryAxisSizingMode='AUTO'`
  (hug); il frame contiene tutto. (Bug ricorrente: `resize(w,900)` lascia il root
  fisso → ri-asserire `AUTO` dopo aver aggiunto i figli.)
- **Dimensioni componenti**: niente testo a larghezza ~0 (TEXT in auto-layout con
  `textAutoResize` corretto), niente `FILL` collassato, niente nodi a 0px.
- **Layout strani**: nessun overflow oltre i bordi, niente sovrapposizioni,
  spaziatura coerente, immagini effettivamente piazzate (non placeholder).
- **Testo tagliato**: line-height non taglia i glifi; headline non troncate.
- **Contrasto** (ri-misura sull'output, anche testo su immagini).
- **Padding dei frame e pagine vuote**: ogni frame auto-layout con un lato sotto
  i 16px e' una segnalazione, e il `COMPONENT_SET` conta (le varianti sono
  posizionate in assoluto e senza padding restano attaccate al bordo). Nessuna
  pagina puo' restare vuota. Vale anche per un file con un solo componente.
- **Stati presenti, non presunti**: per ogni componente interattivo verifica che
  il variant set porti davvero **hover, focus e disabled**; per ogni schermata
  con dati, che esistano lo stato **vuoto** e quello di **caricamento**. La
  critica pubblica al design generato dall'AI cita questi stati mancanti piu'
  spesso di qualsiasi scelta cromatica, e finora nessun gate li controllava.
- **Uniformita' geometrica**: raggio unico, padding unico e una sola ombra su
  ogni superficie sono il segnale non tipografico piu' citato. Elenca i valori
  distinti effettivamente usati nel file e confrontali con quello che fanno le
  reference contate al gate 2a: la domanda non e' "e' coerente" ma "qualcuno
  l'ha deciso".
Strumenti: `get_metadata` (struttura/altezze) + `get_screenshot` FULL (visivo) +
`contrast.js`. Un design non è "fatto" se anche un solo check fallisce.

## Architettura ad agenti paralleli

I **write su Figma DEVONO restare sequenziali** (un solo scrittore: regola
`figma-use` 13 — mai `use_figma` in parallelo). Si parallelizza tutto il resto:

- **Fase 1 — parallelo** (agenti): `design-content` (copy/contenuti inglesi per
  ogni videata) + distillazione estetica dalle reference. Output: testi + DNA.
- **Fase 2 — sequenziale** (un solo costruttore): build del file Figma sezione per
  sezione e schermata per schermata, usando copy + DNA.
- **Fase 3 — verifica** (agente `design-verifier`, read-only, in parallelo sulle
  schermate): audit degli errori noti via `get_metadata`/`get_screenshot`; riporta;
  il costruttore corregge.

Agenti definiti: `.claude/agents/design-content.md`, `.claude/agents/design-verifier.md`.

## Evoluzione v2 — da "corretto" a "originale" (review Gemini + ChatGPT)

Una review terza ha rilevato che il sistema garantiva **perfezione formale** ma
ostacolava l'**innovazione** (output derivativo: media dei trend passati). Aggiunto
alla skill orchestratrice:

- **Role** esplicito: Senior Digital Art Director + Product Designer + Creative
  Technologist (non "esecutore di UI"). Decisioni forti, autorita' sui gate.
- **Originality Engine** (gate centrale tra dataset e build): Creative Thesis →
  3 Creative Territories → Anti-Copy Distance (≥3 dimensioni diverse dalle ref) →
  Signature Element obbligatorio → "Make It Less Expected" (sostituisci ≥3 scelte
  prevedibili) + una Controlled Rule-Break. Cross-pollination ~20% da categoria opposta.
- **Strategia**: Input Contract, Strategic Brief + Brand Positioning, Assumption Log.
- **Architettura**: Information Architecture + User Journey + archetipi per categoria.
- **Art direction immagini**: niente foto casuali; preferire SVG/forme/pattern/UI
  mock; se foto, trattamento coerente (grayscale/duotone/crop/overlay) + licensing/alt.
- **Content Realism Gate** + lingua del copy (inglese solo default).
- **Internal Critic Pass** (One-Screen Test, Memorable Detail Test) prima del build.
- **Figma Production Standards** (auto-layout, naming, variants, no "Rectangle 42",
  istanze≠componenti) + **UI States** (default/hover/focus/active/disabled, loading/
  empty/populated) + **Responsive rules**.
- **Final Design Score** (rubrica 1–5; <4 su Originalita'/UX → iterare).
- **Robustezza**: unhappy path (API/dataset/MCP), Decision Register (memoria di stato
  riletta prima di ogni schermata), protocollo revisioni post-consegna, chat concisa.

## Stato

- Skill orchestratrice: `.claude/skills/design-from-references/SKILL.md` (incorpora i gate + Originality Engine).
- Metodo di design: skill `webartist` (`.claude/skills/webartist`, inclusa nel repo).
- Comando: `/design` (alias italiano: `/crea-design`).
- Vedi anche: [figma-kit-blueprint.md](figma-kit-blueprint.md), README.md.
