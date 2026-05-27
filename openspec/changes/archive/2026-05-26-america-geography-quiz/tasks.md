# Tasks: America Geography Quiz

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~2,500 (35 files greenfield + tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation, data, store, core logic | PR 1 | base: main |
| 2 | Map rendering, pages, question types | PR 2 | base: PR 1 branch |
| 3 | Polish, animations, full test suite | PR 3 | base: PR 2 branch |

## Phase 1: Foundation

- [x] 1.1 Scaffold Vite + React 18 + TypeScript + Tailwind; install react-router-dom, leaflet, react-leaflet, zustand, framer-motion, canvas-confetti, @types
- [x] 1.2 Create `src/types/index.ts`: `Country`, `QuizState`, `Question`, `Region` types
- [x] 1.3 Create `src/data/countries.ts`: 35+ sovereign entries with ISO, name, capital, coordinates, region, funFact, territory flag
- [x] 1.4 Add `public/geojson/americas-110m.geojson` with simplified Natural Earth geometry
- [x] 1.5 Create `src/data/validate.ts` build-time validation (duplicate ISO, missing coords, invalid GeoJSON)
- [x] 1.6 Update `index.html` title/meta for quiz app; create `src/styles/index.css` with Tailwind + Leaflet overrides

## Phase 2: Store & Core

- [x] 2.1 Create `src/store/quizSlice.ts`: mode, questions, index, phase, targetCountry, onCountryClick
- [x] 2.2 Create `src/store/scoresSlice.ts` with `persist` middleware for scores, streaks, progress
- [x] 2.3 Create `src/store/uiSlice.ts` for territories toggle and theme preferences
- [x] 2.4 Implement state machine in quizSlice: idle→question→answered→correct/wrong→next→complete
- [x] 2.5 Create `src/hooks/useTimer.ts` (start/pause/reset/expiry); `src/hooks/useConfetti.ts`; `src/hooks/useFlyTo.ts`
- [x] 2.6 Implement scoring algorithm in scoresSlice: first-try + streak bonus + speed bonus

## Phase 3: Map Feature

- [x] 3.1 Create `src/features/map/MapView.tsx` with `MapContainer` and GeoJSON layer; `CountryTooltip.tsx`; `Legend.tsx` (4 regions)
- [x] 3.2 Add hover fill highlighting, click-to-select/deselect, and tiny-island ≥8px hit target at zoom ≤5
- [x] 3.3 Add keyboard Tab navigation with visible focus outline and Enter selection
- [x] 3.4 Create `src/components/CountryList.tsx` as sortable accessible list alternative
- [x] 3.5 Bridge map clicks to `quizSlice.onCountryClick` for cross-feature highlighting

## Phase 4: UI & Modes

- [x] 4.1 Create `src/features/study/StudyPage.tsx`: free browse, capital + fun fact display, no scoring
- [x] 4.2 Create `src/features/practice/PracticePage.tsx` with hint-on-request (region/neighbor highlight)
- [x] 4.3 Create `src/features/quiz/QuizPage.tsx` shell with timer and question routing
- [x] 4.4 Create question types: `ClickOnMap.tsx`, `TextInput.tsx`, `MultipleChoice.tsx`
- [x] 4.5 Create `src/pages/ResultsPage.tsx` with score breakdown, retry; `ModeTabs.tsx`; `ScoreBadge.tsx`
- [x] 4.6 Wire routes in `App.tsx`: `/`→`/study`, `/practice`, `/quiz`, `/results`; handle empty dataset message
- [x] 4.7 Implement interrupted session resume/restart offer on return

## Phase 5: Animations & Polish

- [x] 5.1 Wrap router outlet with `AnimatePresence` for route transitions
- [x] 5.2 Add score count-up animation on `ResultsPage`; trigger confetti on completion
- [x] 5.3 Apply eye-catching color theming for regions, scores, accents
- [x] 5.4 Add loading states and error boundaries for map/data failures

## Post-Verification Fixes (Verification Warnings)

- [x] **Fix 1**: GeoJSON loaded with `fetch()` → static `import … ?raw` + `JSON.parse` at module level
  - File: `src/features/map/MapView.tsx`
  - Removed `geoJsonData`, `loading`, `error` useState; removed fetch useEffect; removed loading/error overlays
  - Added `import geojsonRaw from '../../data/americas-110m.geojson?raw'` + `const americasGeoJson = JSON.parse(geojsonRaw)`
  - Created `src/data/geojson.d.ts` for `?raw` type declarations
  - Copied `americas-110m.geojson` to `src/data/` for Vite static import
- [x] **Fix 2**: 10 spec scenarios untested → added tests
  - Created `src/features/map/Legend.test.tsx` (3 tests)
  - Created `src/components/CountryList.test.tsx` (2 tests)
  - Added to `src/test/integration.test.tsx` (2 tests)
  - Added to `src/store/quizSlice.test.ts` (1 test)
  - Created `src/store/uiSlice.test.ts` (3 tests)
  - Total: 51 tests across 8 files, all passing
- [x] **Fix 3**: Build-time data validation wired
  - Added `import { validateAndThrow } from './validate'` to `src/data/countries.ts`
  - Added `validateAndThrow(allCountries)` after array definition
- [x] **Fix 4**: Removed unused `'answered'` from `QuizPhase`
  - File: `src/types/index.ts`
  - Verified zero references to `'answered'` across `src/`

### Post-Verification Verification
- `npm run build`: PASS
- `npx vitest run`: PASS (8 files, 51 tests)

