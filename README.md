# Patent Infotainment Device — front-end MVP

A curated, museum-label style display for patent cards. The primary experience is a fixed
800 × 480 "device canvas" (a stand-in for a future 5-inch desktop display); the browser adds a
neutral workspace, a preview label, and development-only controls around it.

All content is fictional mock data. There is no backend, no network access, no authentication,
and no patent scraping — the data layer is a single TypeScript array that can later be replaced
with records from an internal system.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run typecheck`.

Requires Node 20.19+ or 22.12+ (Vite 7).

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

`prefers-reduced-motion: reduce` replaces the slide/stroke-draw motion with immediate,
minimal fades.

## Project structure

```
src/
  components/     DeviceFrame, PatentCardView, PatentControls,
                  PatentCollectionOverview, DebugInspector
  data/           patentCards.ts — the 10 mock records
  diagrams/       one SVG component per invention + shared primitives + registry
  styles/         theme.css (design tokens), app.css (layout)
  types/          patent.ts — the PatentCard model
  App.tsx         carousel state, workspace chrome, keyboard shortcuts
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

### Replacing a card with real patent data

1. Edit or replace the entry in `src/data/patentCards.ts`, keeping every field on the
   `PatentCard` interface. Set `sourceReference` to the real internal record URI.
2. Point `diagramComponent` at a diagram key (see below).
3. Nothing else needs to change — the carousel, overview, and controls derive everything from
   the array, including its length.

When the records eventually come from an internal service, swap the import in `App.tsx` for a
loader that returns the same `PatentCard[]` shape; the UI is unaware of the source.

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
