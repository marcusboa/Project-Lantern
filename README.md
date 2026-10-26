# Patent Infotainment Device — front-end MVP

A curated, museum-label style display for patent cards. The primary experience is a fixed
800 × 480 "device canvas" (a stand-in for a future 5-inch desktop display); the browser adds a
neutral workspace, a preview label, and development-only controls around it.

The shipped content is fictional mock data, a single TypeScript array that can later be replaced
with records from an internal system. Cards authored in the Studio are saved by a small local card
server (Node + SQLite). Outside localhost the server requires a password (see
[DEPLOY.md](DEPLOY.md)). There is no external network access and no patent scraping.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173 — app and card API together
```

For the device (or any long-running install), build once and serve the app and card API from a
single process:

```bash
npm run build
npm start        # http://127.0.0.1:8787
```

`npm start` listens on `127.0.0.1` by default; `PORT` changes the port. To reach it from other
machines, set `HOST=0.0.0.0` and `LANTERN_PASSWORD` (12+ characters; `LANTERN_USER` defaults to
`lantern`). The server refuses to listen beyond localhost without a password, and the password
then protects the whole site, Studio and card API included.

To put it on a private website (Docker + automatic HTTPS), see [DEPLOY.md](DEPLOY.md).

Other scripts: `npm run preview`, `npm run lint`, `npm run typecheck`.

Requires Node 20.19+ or 22.12+ (Vite 7). `better-sqlite3` is a native module built for the Node
version that ran `npm install`; rerun `npm install` after switching Node versions.

## Interaction

| Action | Control |
| --- | --- |
| Next / previous card | On-screen arrows, `→` / `←` |
| Jump to a card | Tick marks in the card footer, or the Collection overview |
| Collection overview | `Collection` button, or `O` |
| Full-browser presentation mode | `Presentation` button, or `F`; leave with `Esc` |
| Auto-advance (18 s, off by default) | `Auto-advance` button; any manual interaction turns it off |
| Shuffle | `Shuffle` button |
| Inspector (shows hidden fields) | `Inspector` button |
| Studio (author your own cards) | `Studio` button, or `S` |

`prefers-reduced-motion: reduce` replaces the slide/stroke-draw motion with immediate,
minimal fades.

## Project structure

```
src/
  components/     DeviceFrame, PatentCardView, PatentControls,
                  PatentCollectionOverview, DebugInspector, StudioPanel
  data/           patentCards.ts — the 10 mock records
  studio/         cardSchema.ts (shared validation), cardStore.ts (card API client),
                  diagramImage.ts (bitmap intake)
  diagrams/       one SVG component per invention + shared primitives + registry
  styles/         theme.css (design tokens), app.css (layout)
  types/          patent.ts — the PatentCard model
  App.tsx         carousel state, workspace chrome, keyboard shortcuts
server/
  cardStore.ts    SQLite card table + diagram files
  cardApi.ts      /api routes (mounted by the Vite dev server and by server/index.ts)
  index.ts        production server: dist/ + /api on one port
```

- `DeviceFrame` renders a fixed 800 × 480 box and scales it uniformly to fit its container, so
  the composition is pixel-identical at every viewport size and the canvas never scrolls.
- `PatentCardView` is the device UI itself and only reads from a `PatentCard`.
- The workspace chrome (status filter, shuffle, inspector, preview label) lives in `App.tsx` and
  is never rendered inside the device canvas — it disappears entirely in presentation mode.

## Where the mock patents live

`src/data/patentCards.ts` exports `patentCards: PatentCard[]`. The model is defined in
`src/types/patent.ts`.

`sourceReference` is an internal provenance field. It is part of the data model but is never
rendered in the card view; it is only visible in the development-only inspector panel outside
the device canvas.

### CPC classification

Each card carries a `cpc: CpcClassification` — the full CPC symbol plus the hierarchy that
leads to it:

```ts
cpc: {
  code: 'G06N 3/006',
  hierarchy: [
    { symbol: 'G', title: 'Physics' },
    { symbol: 'G06', title: 'Computing; calculating; counting' },
    { symbol: 'G06N', title: 'Computing arrangements based on specific computational models' },
    { symbol: 'G06N 3/00', title: 'Computing arrangements based on biological models' },
    {
      symbol: 'G06N 3/006',
      title:
        'Based on simulated virtual individual or collective life forms, e.g. social simulations or particle swarm optimisation [PSO]',
    },
  ],
}
```

The chain is ordered coarsest first (section → class → subclass → main group → subgroup) and the
last entry must be `code` itself. The card renders the code alongside the titles as a breadcrumb,
with the leaf level emphasised; the list wraps, so any depth or title length is safe within the
800×480 canvas.

The symbols shipped with the mock records follow the real CPC scheme, but the records themselves
are fictional — verify symbols against the official scheme before relying on them.

### Replacing a card with real patent data

1. Edit or replace the entry in `src/data/patentCards.ts`, keeping every field on the
   `PatentCard` interface. Set `sourceReference` to the real internal record URI.
2. Point `diagramComponent` at a diagram key (see below).
3. Nothing else needs to change — the carousel, overview, and controls derive everything from
   the array, including its length.

When the records eventually come from an internal service, swap the import in `App.tsx` for a
loader that returns the same `PatentCard[]` shape; the UI is unaware of the source.

## Studio — authoring cards in the browser

The `Studio` panel (desktop chrome only; hidden in presentation mode) writes the same
`PatentCard` shape as the mock data, so authored cards join the carousel, overview, filters, and
shuffle exactly like the shipped ones. Fields cover the full model: title, publication number and
date, applicant, inventor, description, CPC code and hierarchy (one `symbol | title` line per
rung), tags, curation status, featured flag, and the internal-only `sourceReference`.

A diagram can be either one of the built-in line drawings or a bitmap uploaded from disk. Uploads
are downscaled in the browser to a 900 px long edge (PNG and GIF keep their alpha channel,
everything else is re-encoded as JPEG) and sent with the card; the server writes the image to a
file and the card then references it by URL. A bitmap takes precedence over the selected line
diagram.

### Where Studio cards are stored

Cards are saved on the card server, not in the browser, so every browser pointed at the same
server sees and edits the same cards, and they survive clearing browser data.

| Path | Contents |
| --- | --- |
| `data/lantern.db` | SQLite database, one row per card (the card as JSON + timestamps) |
| `data/images/` | Uploaded diagrams, referenced from cards as `/api/images/<file>` |

`data/` is git-ignored; set `LANTERN_DATA_DIR` to keep it elsewhere. Back up the folder to back up
every authored card. Replacing or deleting a card's image removes the old file.

API (mounted at `/api`): `GET /cards`, `PUT /cards/:id` (create or replace), `DELETE /cards/:id`,
`GET /images/:file`. Both the server and the browser validate cards with `parseCard()` in
`src/studio/cardSchema.ts`, which coerces malformed fields to defaults rather than throwing.

Cards saved in a browser's `localStorage` by earlier Studio builds are uploaded to the server the
first time that browser opens the app, then removed from the browser.

## How diagrams are selected

Each record carries a `diagramComponent` key (e.g. `'umbrella'`). `src/diagrams/index.ts` maps
those keys to React SVG components through `diagramRegistry`, and `PatentCardView` looks up the
component at render time.

To add a diagram: create a component in `src/diagrams/` using the shared `Figure`, `Callout`,
`CentreLine`, and `Hatch` primitives (320 × 200 viewBox, `currentColor` strokes), add its key to
`DiagramKey` in `src/types/patent.ts`, and register it in `diagramRegistry`. TypeScript will
flag any record referencing an unknown key.

## Changing the target device resolution

Set `DEVICE_WIDTH` / `DEVICE_HEIGHT` in `src/components/DeviceFrame.tsx` and the matching
`--device-width` / `--device-height` tokens in `src/styles/theme.css`. The scaling, the preview
label, and presentation mode all follow those values. The card layout is tuned for 800 × 480, so
a materially different aspect ratio will want the type scale in `theme.css` revisited.

## Replacing the typography

`theme.css` defines `--font-display`, `--font-interface`, and `--font-technical`. No component
names a font directly, so self-hosting licensed faces is a matter of adding `@font-face` rules
and changing those three stacks. The type scale, colours, spacing, stroke weights, and motion
timings are tokens in the same file.

## Design decisions

- **Fixed canvas, uniform scale.** Rather than reflowing at larger viewports, the 800 × 480
  composition is scaled. What you see in the browser is exactly what the physical display will
  show, and presentation mode cannot drift from the device layout.
- **Monochrome, no colour semantics.** Curation status is communicated by a small square mark
  and typography rather than colour, so the palette stays archival and the same design works on
  a monochrome-ish panel.
- **Three typefaces by role.** Serif for title and description (editorial, museum label), sans
  for metadata values, mono for identifiers, labels, and status.
- **Diagrams as code.** Inline SVG components rather than image assets: they scale without
  artefacts, inherit theme colours, and support the stroke-draw entrance.
- **Staggered, short motion.** Header, text, diagram, and footer enter on a 40–180 ms stagger
  with a 560 ms calm ease; the outgoing card fades down rather than sliding away, avoiding any
  sense of page navigation.
- **Chrome lives outside the device.** Anything that will not exist on the physical object
  (status filter, shuffle, inspector, preview label) is rendered in the workspace, so the device
  interface is already final.
