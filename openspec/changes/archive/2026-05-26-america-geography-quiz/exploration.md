# Exploration: Interactive map-based geography quiz for the Americas

## Current State
- Empty project (`nico`).
- `openspec/` exists with config and base directories.
- No source code, no dependencies installed.
- The change (`america-geography-quiz`) needs to be built from scratch using the Vite + React 18 + TypeScript + Tailwind CSS stack suggested in `openspec/config.yaml`.

## Affected Areas
- `index.html` — single entry point (recommended in `sdd/init`).
- `src/main.tsx` — bootstraps React 18 with StrictMode.
- `src/App.tsx` — top-level routing (study vs practice vs quiz modes).
- `src/features/map/` — interactive Leaflet map component, GeoJSON layers, hover/click handlers, animations.
- `src/features/quiz/` — quiz engine (scoring, rounds, feedback, progress tracking).
- `src/features/study/` — study mode (browsable list + map highlights, capital reveal).
- `src/data/` — curated set of countries and capitals; GeoJSON shapes for map rendering.
- `src/hooks/` — custom hooks for quiz round state, scoring, keyboard shortcuts.
- `src/store/` — centralized state logic (state mgmt library TBD).
- `src/types/` — shared TypeScript definitions for `Country`, `Capital`, `Geo`, `QuizSession`, etc.
- `public/geojson/` — map data assets (sovereign states of the Americas).
- `tests/` — unit + integration + e2e coverage per `openspec/config.yaml`.

## Domain Analysis
### What does “all countries and capitals of America” mean exactly?
- The Americas span **North America**, **Central America**, **the Caribbean**, and **South America**.
- A commonly accepted “complete” educational set is the **35 sovereign states** recognized by the UN and the OAS.
- The 35 sovereign states include transcontinental countries like the USA and Canada (North America) plus all of Central America, the Caribbean, and South America. (Iceland is not included in typical America quiz datasets.)
- **Dependencies / territories** often get added in more advanced modes (e.g., Puerto Rico, Bermuda, Cayman Islands, French Guiana, Greenland). These are valuable for educational quizzes because they’re commonly known in geography.
- **Recommendation for MVP**: Start with the **35 sovereign states** and optionally include up to **10 dependencies/territories** as an “extra credit” toggle in settings. This keeps the data manageable while leaving room for future expansion.

## Decision 1: Map Library
### Option A: Leaflet + react-leaflet
- **Pros**: Lightweight (~40 kB), battle-tested, excellent React bindings (`react-leaflet`), extensive plugin ecosystem, easy GeoJSON layer support, permissive BSD license.
- **Cons**: WebGL-based animations (camera fly-to, smooth zoom) are not as fluid as Mapbox/MapLibre by default; requires plugins for advanced animations; default raster tiles for base map are acceptable but less modern looking.
- **Effort**: Low-Medium.

### Option B: MapLibre GL JS (`react-map-gl`) or Mapbox GL JS
- **Pros**: Native WebGL = smooth camera transitions (fly-to, zoom, rotate). Gorgeous default styles. Extremely performant with large GeoJSON datasets. `react-map-gl` has great React integration.
- **Cons**: Larger bundle size (~150–200 kB), Mapbox’s token-based pricing can become a concern if traffic grows (MapLibre avoids pricing). GeoJSON support is excellent, but simpler than Leaflet for rapid prototyping.
- **Effort**: Medium-High.

### Option C: D3-geo (custom SVG/Canvas map)
- **Pros**: No tile dependency; completely customizable visual style of countries; perfect for “animated drawing” effects and custom projections; small self-contained bundle if only Americas region geometries are included.
- **Cons**: No built-in pan/zoom/interaction library; pan/zoom must be hand-rolled or bolted on; much heavier development cost; less performant with large vector datasets.
- **Effort**: High.

### Recommendation
- **Leaflet + react-leaflet** for the initial build because of low barrier to entry, strong React community, lightweight bundle, and plugin ecosystem (`leaflet-geojson-vt`, `react-leaflet-markercluster`). If fly-to animations become a key requirement later, add the `leaflet.smoothmarkerbouncing` plugin or migrate map engine to MapLibre in a later change.

## Decision 2: State Management
### Option A: React Context + `useReducer`
- **Pros**: Zero dependencies, built-in, trivial for centralized quiz state (current round, score, high score, settings). Good enough for a single-user quiz app without server sync.
- **Cons**: Can trigger re-renders across the entire tree if not partitioned properly. Harder to scale if multiple “games” run concurrently (not a concern here).
- **Effort**: Low.

### Option B: Zustand
- **Pros**: Minimal boilerplate (~300 bytes overhead in bundle), supports selectors (reduces re-renders), excellent TypeScript support, middleware for persistence (`zustand/middleware/persist`).
- **Cons**: Another dependency.
- **Effort**: Low.

### Option C: Redux Toolkit
- **Pros**: Excellent DevTools, robust pattern, great for complex async flows.
- **Cons**: More boilerplate than necessary for a game state; larger bundle size.
- **Effort**: Medium.

### Recommendation
- **Zustand** for the quiz/game state because its persistence middleware is ideal for saving high scores and progress locally. Use React Context only for UI theming / accessibility settings.

## Decision 3: Quiz Mode Structure
### Option A — Linear Mastery Flow
- **Study Mode**: Browse the full list of 35 (or 45) countries with an interactive map. Clicking a country highlights it, zooms to it, and reveals its capital and fun fact.
- **Practice Mode**: Same as quiz but without scoring; unlimited hints; immediate feedback (“You clicked Uruguay; its capital is Montevideo”).
- **Quiz Mode**: Timed or untimed. Score = correct first answers / total questions × 100. Multipliers for streaks. Three question types: (1) “Where is this country?” (click on map), (2) “What is the capital of X?” (text input or multiple choice), (3) “Which country has capital Y?” (multiple choice).
- **Progress Tracking**: Save per-mode progress in localStorage via Zustand. Simple spaced repetition tag: countries answered incorrectly are re-queued.

### Option B — Game-Level Flow (levels)
- Break 35 countries into geographic “levels”: North America, Central America, South America, Caribbean.
- Must pass a quiz level with ≥80% accuracy to unlock the next one.
- Slightly more gamified, but less flexibility for users who already know some regions.

### Recommendation
- **Option A** (Linear Mastery Flow) for flexibility. Provide a “region filter” in quiz settings so learners can still self-select regions without rigid lockout. Add “streak bonus” and “speed bonus” for scoring depth.

## Decision 4: Data Sources
- **Country shapes (GeoJSON)**: **Natural Earth** (public domain, 1:110m scale is sufficient for web map). 1:50m for slightly more accurate small Caribbean islands. `naturalearthdata.com`.
- **Capital coordinates**: Embed manually from authoritative sources (Wikipedia / UN OAS lists) into a static JSON file. Prevents API dependency issues and guarantees quiz stability.
- **Country metadata**: Name, ISO code, region, capital, flag emoji (or SVG path from `flagpack` or similar), population, fun fact. Stored in `src/data/countries.json`.
- **Freshness**: Map shapes change very rarely. Snapshot once on project creation and update manually.

## Decision 5: Animation Opportunities
- **Country highlight**: `react-leaflet` GeoJSON `onEachFeature` to style fill color with CSS transition or Framer Motion wrapper.
- **Zoom-to-capital**: `leaflet.flyTo()` on capital coordinates with a short duration (1.2s). Coupled with an animated pin marker.
- **Score counter animation**: A rolling number component using `framer-motion` counting up from previous score.
- **Confetti / particles**: On 100% perfect quiz complete, use `canvas-confetti` (2 kB).
- **Progress bar**: Framer Motion `animate` width transitions between questions.

## Data Model Sketch (TypeScript)
```typescript
interface Country {
  id: string;        // ISO 3166-1 alpha-3
  name: string;
  capital: string;
  capitalCoords: [number, number]; // [lat, lng]
  region: 'north-america' | 'central-america' | 'caribbean' | 'south-america';
  flags?: { svg: string; emoji: string };
  geojson: GeoJSON.Feature; // loaded at build or runtime
  funFact?: string;
}

interface QuizSession {
  mode: 'study' | 'practice' | 'quiz';
  questionBank: Country[];
  currentIndex: number;
  score: number;
  streak: number;
  answers: Array<{
    countryId: string;
    correct: boolean;
    timeMs: number;
    attempts: number;
  }>;
  settings: {
    includeTerritories: boolean;
    selectedRegions: string[];
    timerEnabled: boolean;
    questionTypes: QuestionType[];
  };
}
```

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| GeoJSON for tiny Caribbean islands may be too large or visually cluttered at Americas zoom. | Medium | Use marker clustering (`react-leaflet-cluster`) and simplified 1:110m geometry. |
| Leaflet smooth zoom-to-capital animations feel sluggish compared to WebGL maps. | Low-Medium | Use Leaflet’s `.flyTo()` with short duration; consider upgrading to MapLibre later if UX feels sub-par. |
| Manual data entry (capitals, coordinates, facts) is error-prone. | Low | Centralize in `countries.json` and validate via unit tests against a second source (Wikipedia scrape/CI). |
| Bundle size grows with embedded SVG flags or large geojson. | Low | Use `emoji` flags by default (zero size) and lazy-load SVG flags when requested. |
| Accessibility of map-only interactions (click on map) for keyboard / screen reader users. | Medium | Ensure every map interaction has a non-map counterpart (list-based selection, keyboard shortcuts). |

## Ready for Proposal?
- **Yes** — the domain and architecture are clear enough to write a scoped proposal.
- We know the exact dataset (35 sovereign states + optional dependencies), we know the tech stack, and we have a recommended path for each major architectural decision.
- We should include a brief rollback plan in the proposal: since this is a greenfield build, rollback is reverting the branch / deleting the change folder and starting over.

---
*Artifact produced by `sdd-explore` for change `america-geography-quiz`.*
