# Blueprint — File Figma "vendibile" (Community-grade)

Specifica della STRUTTURA target che il generatore deve produrre. La struttura è
fissa (standard di mercato); lo STILE che la riempie è data-driven dal brief
(token, `componentInventory`, `pageStructure`, cluster).

Riferimenti studiati: Untitled UI, Landify, Simple Design System (Figma), Base 02.

## Pagine del file (in ordine)

1. **📕 Cover** — frame 1920×960 (anteprima Community): titolo, tagline, nome
   categoria + cluster, autore, mini-anteprima dei colori. È l'immagine di
   copertina che vende il file.
2. **📖 Get Started** — documentazione: cos'è, come si usa, cosa include,
   provenance (siti analizzati), licenza, changelog, crediti.
3. **🎨 Foundations**
   - Colors: variabili COLOR con modi **Light/Dark** + color styles speculari.
   - Typography: ramp completa (Display XL→Caption) come text styles.
   - Spacing & Grid: scala 4/8 + layout grid (12 col) documentati.
   - Radius: scala (sm/md/lg/full).
   - Elevation: 3–5 ombre come effect styles.
   - Icons, Logo: placeholder/segnaposto.
4. **🧩 Components** — set completo, ognuno COMPONENT_SET con varianti+properties:
   - Actions: Button (variant: primary/secondary/ghost/destructive × size sm/md/lg
     × state default/hover/focus/disabled), Icon Button.
   - Forms: Input, Textarea, Select, Checkbox, Radio, Toggle, Slider.
   - Data display: Badge, Tag/Chip, Avatar, Tooltip, Card, Table row, Stat.
   - Feedback: Alert/Banner, Toast, Modal/Dialog, Progress, Skeleton.
   - Navigation: Navbar, Sidebar item, Tabs, Breadcrumb, Pagination, Footer.
5. **🧱 Blocks** — sezioni componibili (auto-layout, responsive, da istanze di
   Components): Navbar, Hero, Feature grid, Logo wall, Pricing, Testimonial, Stats,
   FAQ, CTA, Footer. Quali e in che ordine: guidato da `pageStructure` +
   `componentInventory` del brief.
6. **🖥 Templates** — schermate intere assemblate dai Blocks, in coppia
   **Desktop (1440) + Mobile (390)**: Landing, Pricing, Login/Signup, Dashboard.

## Standard di qualità (checklist)

- [ ] Variabili con modi (Light/Dark) e scopes espliciti.
- [ ] Auto-layout su ogni contenitore con figli correlati; sizing FILL/HUG corretti.
- [ ] Component properties: boolean (mostra icona), instance-swap (icona/avatar),
      text property (label), variant (state/size/type).
- [ ] Naming coerente `Category/Component/Variant`.
- [ ] Descrizione su ogni componente (a cosa serve).
- [ ] Contrasto AA su testo/sfondo.
- [ ] Color styles + variabili entrambi presenti e nominati coerentemente.
- [ ] Ogni pagina ordinata, nessun nodo orfano a (0,0).

## Mapping dati → blueprint

| Blueprint | Sorgente dato |
|---|---|
| Colors/Typography/Spacing/Radius | `brief.colors/typeScale/spacing/radius` (già misurati) |
| Elevation | `capture.shadows` aggregati (da aggiungere all'aggregatore) |
| Quali Components prioritari | `brief.components` (frequency) |
| Quali Blocks e ordine | `brief.pageStructure` + `componentInventory` |
| Tema (Light/Dark) | `brief.theme` (+ modo opposto generato per contrasto) |
| Cover/Get Started provenance | `brief.sourceUrls`, `clusterLabel`, `sampleSize` |

## Implementazione incrementale (per non rompere nulla)

1. Foundations completo (modi Light/Dark, ombre, grid) ← estende l'attuale.
2. Components con varianti/stati/properties (COMPONENT_SET reali).
3. Blocks libreria.
4. Templates desktop+mobile.
5. Cover + Get Started.

Ogni step validato con screenshot prima del successivo.
