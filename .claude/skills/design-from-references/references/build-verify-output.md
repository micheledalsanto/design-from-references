# BUILD → Verifica render → Score → Output (4 → 7.1)

## 4. BUILD — TU crei il prodotto
Default Figma via MCP (`figma-use` + `figma-generate-*`). Le reference sono solo
estetica.

**ORDINE DI COSTRUZIONE (obbligatorio — NON partire dalle schermate):**
1. **Foundations** — token (colore/spacing/radius) + text style **E lo specimen
   VISIVO** sulla pagina `📖 Foundations & Docs`: swatch colore (chip + nome + hex),
   type scale (campione per ogni text style), spacing/radius. I token sono invisibili:
   la pagina **NON va lasciata vuota**, deve documentarli a vista.
2. **Components** — costruisci la **libreria** sulla pagina `🧩 Components`:
   Button, Nav, Field/Input, Dropdown, Table Row, Card, Footer… come **component
   set con varianti+stati** (default/hover/focus/disabled, header/data, ecc.).
   Disponili in modo **ORDINATO**: una **griglia/colonne per categoria** (atoms /
   cards / chrome), **non** una singola colonna verticale lunga. SENZA sovrapposizioni
   (gap adeguati; le coordinate di componenti creati in call diverse possono collidere
   → riposizionali raggruppandoli).
   **Controlli obbligatori sulla pagina Components:**
   - Ogni componente deve **HUG il contenuto** (`primaryAxisSizingMode='AUTO'`, e per
     gli orizzontali `counterAxisSizingMode='AUTO'`): **niente `resize()` con altezza
     fissa** che taglia testo/figli (= "frame troppo stretti/tagliati"). `clipsContent`
     off sui contenitori-componente.
   - **Nessuna etichetta di testo "manuale"** accanto ai componenti: Figma mostra gia'
     il nome del componente/variant. Non aggiungere TEXT decorativi sulla pagina.
   - Dopo il layout: verifica **overlap=0** (bounding box) **e** che ogni componente
     contenga i suoi figli (nessun child che sfora il frame).
   - **Ri-verifica DOPO ogni fix di sizing:** cambiare la dimensione di un componente
     gia' disposto (tipico: da size fissa a hug) sposta le colonne e puo' ricreare
     overlap/clipping → ri-disponi e ri-esegui il check. La verifica della pagina
     Components va rifatta come **ULTIMO passo**, dopo tutti i fix.
3. **Screens** — COMPONI le schermate da **ISTANZE** dei componenti
   (`component.createInstance()`), NON ridisegnando a mano ciò che è gia' un
   componente. Solo lo scaffold specifico della schermata (hero, header, signature)
   è costruito ad hoc; il resto sono istanze con override di testo/varianti.
4. **Cover** — disegna la pagina `📕 Cover` come **thumbnail in stile Community**
   (≈1920×960): brand/wordmark + tagline + un preview visivo + meta (cluster, n.
   schermate, desktop+mobile, accessibilità). È ciò che si vede in elenco file/Community.
Costruire le schermate prima dei componenti = ordine SBAGLIATO: rifai partendo dai componenti.

**Nessuna pagina vuota:** a fine build TUTTE le pagine devono avere contenuto —
`📕 Cover`, `📖 Foundations & Docs` (specimen token + documentazione/crediti),
`🧩 Components`, `🖥 Screens`. Una pagina vuota = build incompleto.

- **4a. Copy (parallelo):** lancia l'agente `design-content` (anche piu' istanze) per
  copy realistico nella lingua scelta.
- **4b. Videate multiple** (set per archetipo), **composte da istanze**. Desktop + mobile dove sensato.
- **4c. File organizzato come la Community:** pagine `📕 Cover · 📖 Foundations & Docs ·
  🧩 Components · 🖥 Screens` (+ `🌊 Flows` se serve). **Foundations e Documentation
  stanno in UNA pagina unica** (specimen token + documentazione/crediti affiancati).
- **4d. Figma Production Standards (obbligatori):** Auto Layout ovunque sensato;
  **layer naming leggibile** (mai "Rectangle 42"); text styles + color variables +
  spacing/radius tokens; **component variants** con stati; constraints responsive;
  componenti separati dalle istanze; nessun gruppo disordinato. Il file dev'essere
  usabile da un designer umano dopo la generazione.
- **4e. UI States (obbligatori):** per ogni componente interattivo almeno
  default/hover/focus/active/disabled (+ error/success dove rilevante). Per ogni
  schermata con dati: loading / empty / populated.
- **4f. Responsive:** definisci grid desktop, comportamento tablet/mobile,
  breakpoint, nav mobile (hamburger accessibile), riordino sezioni, scaling tipo,
  gestione immagini, CTA mobile.
- **4g. Decision Register (memoria di stato):** scrivi i token finali, gli stili e i
  componenti base in un path temporaneo dell'ambiente corrente
  (`<tmp>/<project>-decisions.md` — vedi `dataset-tooling-agents.md`) e **rileggilo
  prima di ogni nuova schermata** (scritture sequenziali: rischio amnesia tra schermate).
- **4h. Scritture sequenziali:** mai `use_figma` in parallelo (un solo costruttore).
- **Codice** se richiesto: HTML+CSS moderno, mobile-first, accessibile, multi-pagina,
  con **Motion Direction** (cosa anima, durata, easing, trigger, funzione, fallback
  reduced-motion) e un **Feasibility & Performance Gate** (effetti realizzabili,
  immagini ottimizzabili, performance mobile).

## 5. GATE Verifica render (bloccante, sull'output reale)
Dopo ogni schermata, lancia l'agente **`design-verifier`** (read-only, in parallelo
per schermata) con `fileKey`+`nodeId`. **NON dichiarare la schermata "fatta" / "ok"
prima che il verifier sia PASS**: aspetta il suo esito e risolvi gli issue (le
scritture restano sequenziali). Un testo tagliato in un rail stretto o una caption che
sfora NON si vedono in uno screenshot a bassa risoluzione — fidati del verifier, non
dell'occhio sul thumbnail. **Verifica con uno screenshot OGNI pagina costruita, non
solo le schermate** — anche `📕 Cover`, `📖 Foundations & Docs` (specimen) e
`🧩 Components` soffrono lo stesso crop da size fisse. Cerca gli **errori noti**:
1. **Altezza/larghezza frame / clipping:** ogni contenitore auto-layout deve **HUG**
   il contenuto (`primaryAxisSizingMode='AUTO'`, e l'asse opposto `counterAxisSizingMode=
   'AUTO'` per le altezze). **Gotcha ricorrente:** `resize(w,h)` su un frame auto-layout
   ne forza il sizing a **FIXED** → se `h` e' piccolo (es. 10) il frame **croppa** i
   figli. Dopo ogni `resize()` ri-asserisci `AUTO` sull'asse che deve crescere (o usa
   `layoutSizing*`), poi **controlla via codice** che ogni figlio stia dentro il padre
   (bbox) prima di considerare la pagina fatta.
2. **Dimensioni componenti:** niente nodi a 0px, TEXT a larghezza ~0, FILL collassati,
   immagini senza fill reale.
3. **Layout strani:** overflow oltre i bordi, sovrapposizioni, allineamenti rotti.
4. **Testo:** troncato, line-height che taglia i glifi.
5. **Design QA:** allineamenti globali, padding coerente, ritmo verticale, gerarchia
   heading, consistenza card/bottoni, leggibilita' testi piccoli, stati interattivi.
6. **Contrasto** ri-misurato sull'output (anche testo su immagini).

## 6. Final Design Score
Valuta 1–5: Originalita' visiva · Coerenza col dataset · Distanza dalle reference ·
Chiarezza UX · Accessibilita' · Qualita' tipografica · Responsive · Memorabilita' ·
Realismo contenuto · Scalabilita' del design system.
**Ancore (per ridurre soggettivita'):**
- *Originalita'*: 5 = signature chiara, non riconducibile a template; 3 = buono ma
  riconducibile a pattern comuni; 1 = generico/derivativo.
- *Chiarezza UX*: 5 = scopo e azione primaria ovvi in 5s, zero ambiguita'; 3 = chiaro
  con qualche frizione; 1 = confuso.
- *Accessibilita'*: 5 = tutto AA misurato + focus/target/reduced-motion; 3 = AA sul
  testo ma lacune; 1 = fallimenti di contrasto.
**< 4 su Originalita' o Chiarezza UX → itera** (torna a 2.5 o 3).

## 7. Final Output
Consegna sempre: link al file Figma/codice, **creative thesis**, reference usate,
tabella observed→applied, token principali, schermate create, check accessibilita' e
UX, note immagini/licenze, assunzioni e limiti.

## 7.1 Design System Output Spec (Standard+ / obbligatorio in Studio)
Documenta il sistema cosi' che sia **riutilizzabile** da un umano, non solo bello:
color tokens · typography tokens · spacing scale · radius scale · shadows/elevation ·
grid · components · component variants · interaction states · motion tokens ·
**usage rules** · **anti-patterns**. In Figma vive nelle pagine Foundations +
Components; in codice come tokens + README.
