# Vite + React 19 + TypeScript — Americas Geography Quiz

## Tech Stack
- Bundler: Vite 8
- Framework: React 19 + TypeScript
- Styling: Tailwind CSS v4
- Map: Leaflet + react-leaflet
- Animations: Framer Motion
- State: Zustand (persist middleware)
- Tests: Vitest + React Testing Library + Playwright
- I18n: Custom lightweight i18n (ES/EN)

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm test` — unit tests
- `npm run test:ui` — vitest UI
- `npm run e2e` — Playwright tests
- `npm run lint` — ESLint
- `npm run preview` — preview build

## Architecture
- Feature-based folder structure: `features/{map,practice,quiz,study}`
- Zustand store split into slices: `store/quizSlice.ts`, `store/scoresSlice.ts`, `store/uiSlice.ts`
- i18n via React context + custom translation helper
- Country data validated at import-time via `validateAndThrow`

## GitHub Pages
- Base path: `/nico_capitales/`
- Router: HashRouter (required for static hosting)
- Deploy: `npx gh-pages -d dist`

## Key Conventions
- Use `getCountryNames(country, lang)` for translated names/capitals
- Use `REGION_LABEL_KEY` from `utils/regionLabels` for region translation keys
- `maskText()` in `utils/maskText` handles hint obfuscation with accent normalization
- All feedback overlays must have `role="status"` + `aria-live="polite"`
- Inputs with no visible label must have `aria-label`
