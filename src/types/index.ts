export type Region =
  | 'north-america'
  | 'central-america'
  | 'caribbean'
  | 'south-america';

export interface Country {
  iso: string;           // ISO 3166-1 alpha-2
  name: string;
  nameEs?: string;
  capital: string;
  capitalEs?: string;
  coordinates: [number, number]; // [lat, lng]
  region: Region;
  funFact: string;
  funFactEs?: string;
  territory?: boolean;   // optional territories excluded by default
}

export type QuestionType = 'click-on-map' | 'text-input' | 'multiple-choice';

export interface Question {
  id: number;
  type: QuestionType;
  iso: string;           // target country
  prompt: string;        // e.g. "Where is Brazil?"
  options?: string[];    // for multiple-choice
  timeLimit?: number;    // seconds (quiz mode)
}

export type QuizPhase = 'idle' | 'question' | 'correct' | 'wrong' | 'complete';

export type QuizMode = 'study' | 'practice' | 'quiz';

export interface AnswerRecord {
  questionId: number;
  iso: string;
  correct: boolean;
  attempts: number;
  timeMs: number;
  score: number;
}

export interface QuizState {
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  phase: QuizPhase;
  targetCountry: string | null;
  selectedCountry: string | null;
  answers: AnswerRecord[];
  startTime: number | null;
}

export interface ScoreEntry {
  date: string;          // ISO date string
  score: number;
  totalQuestions: number;
  correctFirstTry: number;
  bestStreak: number;
  avgSpeedMs: number;
}

export interface ScoresState {
  quizzesCompleted: number;
  highScores: ScoreEntry[];
  currentStreak: number;
  bestStreak: number;
  answersHistory: AnswerRecord[];
}

export interface UIState {
  includeTerritories: boolean;
  selectedRegions: Region[];
  theme: 'light' | 'dark';
}
