# Design: America Geography Quiz

## Technical Approach

Single-page Vite + React 18 + TypeScript app. React Router v6 drives 4 routes (`/study`, `/practice`, `/quiz`, `/results`). Leaflet renders a static GeoJSON layer; Zustand (w/ `persist`) owns quiz state, scores, and UI preferences. Framer Motion `AnimatePresence` wraps route transitions; `canvas-confetti` fires on quiz completion. Data arrives via static imports at build time — no runtime fetching.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|----------|--------|----------|-----------|
| Routing | React Router v6, 4 routes | Single-page mode toggle | Deep-linkable results, browser back button, cleaner code splitting |
| Store topology | 3 Zustand slices (quiz, scores, ui) | Monolithic store | Separation of concerns; `persist` middleware only on scores slice |
| GeoJSON loading | Static `import` at build time | Lazy fetch, dynamic `import()` | Dataset is 35 countries, ~200KB — network fetch adds latency for no benefit |
| Quiz engine model | Explicit state machine (reducer-pattern) | `useReducer` per component | Multiple consumers (timer, UI, scoring) need same state transitions |
| Map ↔ Quiz contract | Store bridge: quiz writes `targetCountry`, map reads it for highlighting | Prop drilling, EventEmitter | Decouples map from quiz; both features import the same Zustand slice |
| Animation strategy | Framer Motion `AnimatePresence` on route outlet; `canvas-confetti` as imperative call from scoring hook | CSS transitions only | Declarative route transitions; confetti needs imperative canvas access |

## Data Flow

```
                    ┌──────────────────────────────┐
                    │        Zustand Store          │
                    │  quizSlice  │ scoresSlice │ ui │
                    └──┬───────┬───────┬─────────┬──┘
                       │       │       │         │
        ┌──────────────┘       │       │         └──────────────┐
        ▼                      ▼       ▼                        ▼
  QuizEngine          MapView reads   ResultsPage       SettingsPanel
  (dispatches)        targetCountry   reads scores      reads prefs
        │                    ▲
        │  onCountryClick()  │
        └────────────────────┘
         quizSlice updates
         selectedCountry
```

Quiz flow state machine:

```
IDLE ──▶ QUESTION ──▶ ANSWER ──▶ CORRECT/WRONG ──▶ NEXT ──▶ QUESTION
                                                    │
                                                    └──(last Q)──▶ COMPLETE ──▶ RESULTS
```

## Route Design

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | Redirect → `/study` | Default entry |
| `/study` | `StudyPage` | Browse map freely, click for facts |
| `/practice` | `PracticePage` | Questions with hints, no scoring |
| `/quiz` | `QuizPage` | Timed 3-type questions, full scoring |
| `/results` | `ResultsPage` | Score breakdown, confetti, retry |

## File Structure

```
src/
├── main.tsx, App.tsx               # React root, layout shell, AnimatePresence outlet
├── features/
│   ├── map/                        # MapView, CountryTooltip, Legend
│   ├── quiz/                       # QuizEngine, QuizPage, question-types/ (ClickOnMap, TextInput, MultipleChoice), timer.ts
│   ├── study/StudyPage.tsx         # Free exploration with facts
│   └── practice/PracticePage.tsx   # Practice mode with hints
├── pages/                          # ResultsPage, SettingsPage
├── store/                          # quizSlice, scoresSlice (persist'd), uiSlice
├── data/                           # countries.ts, geojson-regions.ts, validate.ts (build-time)
├── hooks/                          # useTimer, useConfetti, useFlyTo
├── components/                     # CountryList, ScoreBadge, ModeTabs, ConfettiOverlay
├── types/index.ts                  # Country, QuizState, Question, Route types
└── styles/index.css                # Tailwind directives + Leaflet overrides
```

## Interfaces / Contracts

```ts
// store/quizSlice.ts — contract between map and quiz
interface QuizSlice {
  mode: 'study' | 'practice' | 'quiz';
  questions: Question[];
  currentIndex: number;
  phase: 'idle' | 'question' | 'answered' | 'complete';
  targetCountry: string | null;  // map reads this to highlight
  onCountryClick: (iso: string) => void;  // map calls this on click
}

// types/index.ts
interface Country {
  iso: string;           // alpha-2
  name: string;
  capital: string;
  coordinates: [number, number];
  region: 'north-america' | 'central-america' | 'caribbean' | 'south-america';
  funFact: string;
  territory?: boolean;
}
```

## Testing Strategy

| Layer | What | Tool |
|-------|------|------|
| Unit | Scorer math (first-try + streak + speed), data validation, timer hook, question-type rendering | Vitest + RTL |
| Integration | Map click → quiz dispatch → score update, mode transitions, persistence round-trip | Vitest + RTL (mock Leaflet) |
| E2E | Full quiz flow (10 questions, confetti), reload persistence, territories toggle, keyboard nav | Playwright |
