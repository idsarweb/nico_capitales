# Proposal: America Geography Quiz

## Intent

Build an interactive geography quiz for the Americas (35 sovereign states + optional territories). Includes an animated Leaflet map, study/practice/quiz modes, and progress tracking with eye-catching colors — satisfying the request for a visually engaging educational experience.

## Scope

### In Scope
- Interactive Americas map using Leaflet + react-leafltet with GeoJSON layers
- Study, Practice, and Quiz modes with Framer Motion animations
- Zustand-persisted scores/progress and canvas-confetti rewards
- Static curated dataset: countries, capitals, coordinates, fun facts

### Out of Scope
- Backend or user accounts
- Switching map engines (e.g. MapLibre) — future change
- Real-time multiplayer or leaderboards

## Capabilities

### New Capabilities
<!-- Each becomes openspec/specs/<name>/spec.md -->
- `map-interaction`: Render Americas GeoJSON, country highlighting, zoom-to-capital animations
- `quiz-engine`: Linear mastery flow with 3 question types and scoring
- `country-data`: Curated dataset for 35+ countries and capitals

### Modified Capabilities
- None

## Approach

Use the Vite + React 18 + TypeScript + Tailwind stack. Map layer consumes Natural Earth GeoJSON at build time. Zustand with `persist` middleware stores scores and progress locally. Quiz engine supports click-on-map, text input, and multiple choice. Animations via Framer Motion and canvas-confetti. Accessibility is ensured by providing list-based alternatives to all map-only interactions.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/` | New | Features: map, quiz, study, data, store, hooks, types |
| `public/geojson/` | New | Americas GeoJSON assets |
| `index.html` | Modified | Updated title/meta for quiz app |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|-----------|
| Small Caribbean islands clutter the map | Medium | Use 1:110m simplified geometry and marker clustering |
| Manual data entry errors | Low | Validate via unit tests against a second source |
| Leaflet zoom animations feel sluggish | Low | Use `flyTo` with short duration; upgrade map engine later if needed |

## Rollback Plan

Reverting is straightforward: discard the feature branch and remove the `openspec/changes/america-geography-quiz/` change folder. No existing production code is affected.

## Dependencies

- Natural Earth GeoJSON (Americas 1:110m)
- `react-leaflet`, `leaflet`, `zustand`, `framer-motion`, `canvas-confetti`

## Success Criteria

- [ ] All 35 countries and capitals render correctly on the map
- [ ] Study, Practice, and Quiz modes function end-to-end
- [ ] Quiz scores and progress persist after page reload
- [ ] Build passes without errors
