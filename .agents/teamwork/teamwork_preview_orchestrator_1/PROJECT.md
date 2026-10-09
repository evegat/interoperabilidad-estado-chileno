# Project: P029 - Interoperabilidad Estado Chileno

## Architecture
- **Tech Stack**: Astro 5+, TypeScript, Tailwind CSS, Cytoscape.js (v3.x), Node.js (v24.12.0 LTS).
- **Core Pattern**: Static Site Generation (SSG) with Vanilla TypeScript Client Island for graph interactivity, zero SSR runtime mismatch, outputting static bundle to `dist/`.
- **Data Flow**: `src/data/interoperabilidad.json` (canonical source of truth) -> validated at build/test time via `scripts/validate-data.ts` (`npm run test:data`) -> imported at build time by Astro and passed as pre-structured JSON to Cytoscape island in browser.
- **Harness Compliance**: Standard `MYWORLD-HARNESS.json` root configuration conforming to MyWorld schema with quality, build, and test gates.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Formal Schema | JSON / TypeScript interfaces for nodes (institutions) and edges (interoperability flows) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | Seed Dataset | 18 real traceable Chilean public relations (PISEE, Registro Civil, SII, TGR, ChileCompra, DIPRES, etc.) | M1 | ORIGINAL_REQUEST §R1 |
| 3 | QA Validator | `npm run test:data` verifying referential integrity, no orphan nodes, strict fields, URL formats | M1 | ORIGINAL_REQUEST §R2 |
| 4 | Graph Metrics | Automated calculation of graph density, degree centrality, and bottleneck nodes in validator | M1 | ORIGINAL_REQUEST §R2 |
| 5 | Astro + Tailwind Setup | Base project initialization with package.json, astro.config, tailwind, typescript | M2 | ORIGINAL_REQUEST §R3 |
| 6 | Cytoscape Island | High-performance HTML5 Canvas graph rendering with deterministic `cose` layout and neighborhood highlights | M2 | ORIGINAL_REQUEST §R3 |
| 7 | Node/Edge Styling | Color-coded nodes by institution typology (Ministerio, Servicio, Municipio, Bus) and protocol badges | M2 | ORIGINAL_REQUEST §R3 |
| 8 | Graph Navigation HUD | Controls for zoom in, zoom out, fit to screen, and reset view | M2 | ORIGINAL_REQUEST §R3 |
| 9 | Live Filters & Search | Real-time search by institution name/sigla and filtering by typology, standard, and observed gaps | M2 | ORIGINAL_REQUEST §R3 |
| 10 | Detail Drawer / Modal | Interactive side panel displaying full technical sheet, official URLs, and observed gaps on click | M2 | ORIGINAL_REQUEST §R3 |
| 11 | Static Production Build | Clean `astro build` producing zero-server distributed assets in `dist/` | M2 | ORIGINAL_REQUEST §R4 |
| 12 | MyWorld Harness | Standard `MYWORLD-HARNESS.json` configuration linked to P029 with quality, build, and test commands | M3 | ORIGINAL_REQUEST §R4 |
| 13 | Bitácora Sync | Update `01 - Bitacora.md` in Obsidian Vault with MVP execution evidence and closure | M3 | ORIGINAL_REQUEST §R4 |
| 14 | E2E Verification | Full end-to-end acceptance verification of all R1-R4 criteria | M3 | ORIGINAL_REQUEST AC |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Data Engine & QA Validator | Schema TS/JSON, seed dataset (18 relations), validation script `npm run test:data`, metrics computation | Survey | DONE (`src/types/interoperabilidad.ts`, `src/data/interoperabilidad.json`, `scripts/validate-data.ts`, `tests/e2e/*`, all tests pass) |
| M2 | Astro Web App & Interactive Visualizer | Base Astro setup, Cytoscape.js island, Tailwind UI, HUD controls, filters, detail drawer, static build `dist/` | M1 | DONE (Astro + Tailwind + Cytoscape.js, `dist/index.html` static build clean, HUD & filters verified) |
| M3 | Harness, Bitácora Sync & E2E Acceptance | `MYWORLD-HARNESS.json`, Git initialization, Obsidian Bitacora entry, comprehensive acceptance pass | M2 | DONE (`MYWORLD-HARNESS.json` valid, Git init `main`, `01 - Bitacora.md` synced, 22/22 E2E tests pass) |

## Code Layout
```
D:/Proyectos/P029 - Interoperabilidad Estado Chileno/
├── package.json
├── tsconfig.json
├── astro.config.mjs
├── tailwind.config.mjs (or CSS integration)
├── MYWORLD-HARNESS.json
├── .gitignore
├── scripts/
│   └── validate-data.ts (or validate-data.mjs)
├── src/
│   ├── types/
│   │   └── interoperabilidad.ts
│   ├── data/
│   │   └── interoperabilidad.json
│   ├── components/
│   │   ├── Header.astro
│   │   ├── FilterBar.astro
│   │   ├── GraphViewport.astro
│   │   ├── DetailDrawer.astro
│   │   └── Legend.astro
│   ├── lib/
│   │   ├── graph-controller.ts
│   │   └── graph-styles.ts
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── dist/ (generated on build)
```

## Interface Contracts
### Data Schema (`src/types/interoperabilidad.ts` ↔ `src/data/interoperabilidad.json`)
- `NodoInstitucion`: `{ id, nombre, sigla, tipo, dependencia, rol_ecosistema, sitio_web, nivel_madurez_digital, estado_adopcion_ley21180 }`
- `AristaInteroperabilidad`: `{ id, origen, destino, plataforma_o_bus, tipo_dato, estandar_o_protocolo, nivel_apertura, fuente_oficial_url, brecha_observada, frecuencia_actualizacion }`
- `DatasetInteroperabilidad`: `{ metadata: { version, fecha_actualizacion, total_nodos, total_aristas }, nodos: NodoInstitucion[], aristas: AristaInteroperabilidad[] }`

### Validator Contract (`scripts/validate-data.ts`)
- Script: `npm run test:data`
- Exit Code: `0` on success, `1` on any referential integrity failure, orphan node, missing mandatory field, or malformed URL.
- Metrics Output: JSON/stdout summary of graph density, degree centrality, and bottleneck nodes.

### Frontend Graph Island Contract (`src/lib/graph-controller.ts`)
- Mount: DOM element `#cy-container` on client load.
- Elements: Cytoscape nodes mapped from `DatasetInteroperabilidad.nodos`, edges from `DatasetInteroperabilidad.aristas`.
- Events: `tap` on node/edge triggers `window.dispatchEvent(new CustomEvent('selection-changed', { detail }))` consumed by `DetailDrawer`.
- Filters: `applyFilters({ search, typology, protocol, onlyGaps })` shows/hides elements in Cytoscape in real time.
