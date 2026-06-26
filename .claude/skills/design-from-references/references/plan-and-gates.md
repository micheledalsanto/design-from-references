# PLAN + Gate sul piano (3 → 3.9)

## 3. PLAN
Token (4–6 colori con ruolo), tipografia, layout concept + wireframe, motion
language — ognuno **tracciato a**: la reference osservata *o* la tesi creativa.
Niente riga sourceless.
- **Font (DAI DATI, non a caso) — bloccante:** leggi i `font-family` REALI dal dataset
  (`sites[].fonts` del cluster, display/body/mono). Usa QUELLI; se uno non e'
  disponibile in Figma (`listAvailableFontsAsync`) scegli l'equivalente piu' vicino e
  **dichiara la sostituzione**. **VIETATO** scegliere font "di default" (Cormorant,
  Playfair, Inter, Spectral, Roboto Mono, Geist…) senza aver prima letto i font del
  dataset: se il tuo font non e' tra quelli misurati o un loro equivalente dichiarato,
  stai defaultando — torna ai dati (o amplia il dataset con `dataset-builder`).
- **Colori (DAI DATI):** la palette CORE viene dai colori MISURATI nel dataset
  (`sites[].bg/colors/accent`). Ogni scostamento va **dichiarato come invenzione** con
  motivo — mai un default silenzioso. Se la palette del dataset e' monotona, ampliala
  con `dataset-builder`, non con il tuo gusto.
- **Evidence Quality:** per ogni decisione osservata dal dataset marca la qualita'
  della fonte — *High* (in piu' siti del cluster o chiaramente misurata) / *Medium*
  (un solo sito ma coerente col cluster) / *Low* (interpretazione soggettiva o
  screenshot ambiguo). Le scelte **core** del design non possono basarsi solo su
  evidenze Low.
- **Visual Harmonization Gate:** il font ha la stessa "voce" di colori e forme? C'e'
  tensione visiva non intenzionale (effetto Frankenstein da collage di 3 siti)?
  Armonizza.
- **Leggi i `design.md`** dei siti del cluster (`data/datasets/<cat>/<site>/design.md`,
  campo `sites[].design`) per type/color/layout system, sezioni e "how to apply": sono
  la reference *ragionata*, non solo i numeri.

## 3.3 Information Architecture + User Journey
- IA: messaggio principale, gerarchia contenuti, sezioni e ordine, cosa sta above
  the fold, primario vs secondario, cosa rimuovere. Ogni sezione ha una funzione:
  explain / prove / convert / reassure / navigate / compare / deepen.
- Journey: cosa vede → capisce → esplora → lo convince → azione. Ogni schermata
  supporta una fase. Archetipi per categoria (set minimo di videate):
  *SaaS*: Landing, Features, Pricing, Login, Dashboard. *Agency/Portfolio*: Home,
  Work, Case study, About, Contact. *E-commerce*: Home, PLP, PDP, Cart, Checkout.
  *Restaurant*: Home, Menu, Booking, Story, Location. *Education*: Home, Course,
  Lesson, Quiz, Progress.

## 3.4 Component Strategy
Identifica: componenti base, compositi, specifici-del-concept, varianti, **stati**,
regole di riuso, token collegati. Ogni componente importante e' parte di un sistema.

## 3.5 Image Art Direction (NON immagini casuali)
Le immagini casuali rendono tutto "template". Prima di usarle definisci: soggetto,
inquadratura, trattamento colore, realismo, **relazione con la tesi**, cosa evitare.
- **Preferisci elementi grafici proprietari** (SVG astratti, pattern geometrici,
  forme custom, noise/grain di sfondo, UI mock costruite) a foto stock: spesso piu'
  innovativi.
- Se servono foto reali: invoca l'agente **`image-sourcer`** (ricerca + fetch, NO API
  key, NO immagini casuali) — trova foto **pertinenti** su Unsplash/Pexels per keyword,
  estrae l'URL diretto e le scarica. Poi caricale sul nodo col tool MCP
  **`upload_assets`** (`figma.createImageAsync` NON e' supportato in use_figma) e
  applica un **trattamento coerente** (grayscale/duotone/crop/overlay) — mai grezze.
  (Per il B&W in Figma: sul paint immagine imposta `filters.saturation = -1`.)
  Riporta l'**attribuzione** (autore/piattaforma) in `📖 Documentation`.
- Licensing: salva la fonte, `alt` descrittivo, evita volti reali se non necessari,
  ogni immagine ha una funzione narrativa/compositiva.

## 3.6 GATE Accessibilità (bloccante, sul piano)
Misura ogni coppia testo/sfondo:
`node .claude/skills/design-from-references/scripts/contrast.js "#fg:#bg" ...`
Testo ≥ 4.5:1; large (≥24px o ≥18.66 bold)/UI/bordi ≥ 3:1. Se un accento misurato
fallisce come testo (tipico blu/viola su nero), NON usarlo per testo: derivane una
variante leggibile e tieni l'accento "vero" per fill/linee/forme grandi. Rispetta il
resto di `webartist/references/wcag-checklist.md` (focus, target, semantica, alt,
reduced-motion).

## 3.7 GATE UX (bloccante, sul piano)
`webartist/references/ux-laws.md`: gerarchia (un protagonista per vista), azioni
primarie evidenti e coerenti (Fitts/Jakob), carico cognitivo controllato
(Hick/Miller), feedback e stati. Annota come il piano le soddisfa.

## 3.8 Content Realism Gate (+ lingua)
Copy specifico, credibile, contestuale, nella lingua scelta. **Evita** frasi vaghe,
slogan intercambiabili, buzzword, CTA generiche, metriche inventate senza contesto.
**Preferisci** benefici concreti, microcopy utile, esempi realistici, label precise,
dati marcati come *sample* se non reali. (Copy generato in parallelo dall'agente
`design-content`.)
- **Lingua UNICA nel file (bloccante):** TUTTO il testo *dentro il deliverable* —
  schermate, **pagina Documentation**, specimen Foundations, label dei componenti,
  note/crediti — è nella lingua scelta. **Mai mix** (es. IT/EN). La lingua di lavoro
  in chat con l'utente è separata: non farla colare nel file. Rileggi i testi prima
  di chiudere e correggi ogni frase fuori lingua.

## 3.9 Internal Critic Pass (bloccante)
Critica brutalmente il piano *prima* di costruire: cosa sembra generico? cosa
copiato? gerarchia debole? poco memorabile? confonde? difficile da implementare?
Correggi. Poi due test:
- **One-Screen Test:** la prima schermata comunica in 5s cosa e' il prodotto, perche'
  e' rilevante, cosa puo' fare l'utente, l'atmosfera, cosa lo rende diverso? Se la
  hero e' intercambiabile con un altro prodotto → rifai la direzione.
- **Memorable Detail Test:** quale dettaglio ricordera' l'utente? quale elemento non
  potrebbe stare in un template? Se non c'e' risposta → aggiungi una signature.
