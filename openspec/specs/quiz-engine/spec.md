# quiz-engine Specification

## Requirements

### Requirement: Study Mode
MUST provide Study mode: browse countries, capitals, fun facts freely with no scoring.

**Scenario: Browse country info**
- GIVEN Study mode active
- WHEN user clicks a country
- THEN capital and fun fact SHALL display with no score or timer

### Requirement: Practice Mode
SHALL present questions with hints, no scoring.

**Scenario: Hint on request**
- GIVEN "Where is Brazil?" practice question
- WHEN user requests hint
- THEN region or neighbor highlight SHALL appear

### Requirement: Quiz Mode
MUST support 3 types: click-on-map, text input, multiple choice. MAY be timed.

**Scenario: Timed scoring**
- GIVEN timed 10-question quiz
- WHEN all answered
- THEN score SHALL include first-try + streak + speed bonuses, with confetti

**Scenario: Empty bank**
- GIVEN dataset has 0 countries
- WHEN quiz initializes
- THEN "No countries available" SHALL display

### Requirement: Scoring
Correct first try MUST earn points. Streaks SHALL add bonus. Speed SHALL earn bonus.

**Scenario: All wrong = zero**
- GIVEN user misses all questions
- WHEN quiz ends
- THEN score SHALL display 0 with no crash

### Requirement: Persistence
Zustand persist SHALL save progress across page reloads.

**Scenario: Survive reload**
- GIVEN 3 completed quizzes + 5-streak
- WHEN browser reloads
- THEN scores and progress SHALL restore

**Scenario: Timer expiry**
- GIVEN 30s per-question limit
- WHEN timer reaches 0
- THEN question SHALL mark incorrect and quiz SHALL advance

**Scenario: Interrupted session**
- GIVEN tab closed mid-quiz
- WHEN user returns
- THEN resume or restart SHALL be offered
