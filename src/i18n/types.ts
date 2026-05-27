export type Language = 'es' | 'en';

export interface TranslationSection {
  nav: {
    study: string;
    practice: string;
    quiz: string;
    results: string;
  };
  quiz: {
    whatCapital: string;
    clickOn: string;
    whichCountryCapital: string;
    hint: string;
    hideHint: string;
    correct: string;
    incorrect: string;
    tryAgain: string;
    next: string;
    skip: string;
    submit: string;
    score: string;
    streak: string;
    time: string;
    questionOf: string;
    wrongAnswer: string;
    correctAnswer: string;
    typeCapital: string;
    noCountries: string;
    incompleteQuiz: string;
    resume: string;
    restart: string;
    unfinishedQuiz: string;
    loading: string;
    points: string;
    timeRemaining: string;
    region: string;
    practice: string;
  };
  study: {
    capital: string;
    region: string;
    funFact: string;
    map: string;
    list: string;
    deselect: string;
    countries: string;
    aToZ: string;
    byRegion: string;
  };
  results: {
    complete: string;
    quizComplete: string;
    score: string;
    firstTry: string;
    bestStreak: string;
    avgSpeed: string;
    tryAgain: string;
    backToStudy: string;
    noResults: string;
    noResultsDesc: string;
    startQuiz: string;
    newHighScore: string;
    greatStart: string;
  };
  map: {
    northAmerica: string;
    centralAmerica: string;
    caribbean: string;
    southAmerica: string;
    regions: string;
  };
  general: {
    error: string;
    retry: string;
    reload: string;
    somethingWrong: string;
    toggleTerritories: string;
    questions: string;
    firstTryLabel: string;
    bestStreakLabel: string;
    avgSpeedLabel: string;
    pointsLabel: string;
  };
}

export type TranslationKey =
  `nav.${keyof TranslationSection['nav']}` |
  `quiz.${keyof TranslationSection['quiz']}` |
  `study.${keyof TranslationSection['study']}` |
  `results.${keyof TranslationSection['results']}` |
  `map.${keyof TranslationSection['map']}` |
  `general.${keyof TranslationSection['general']}`;
