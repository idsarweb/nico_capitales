import type { StateCreator } from 'zustand';
import type { AnswerRecord, ScoreEntry } from '../types';

export interface ScoresSlice {
  quizzesCompleted: number;
  highScores: ScoreEntry[];
  currentStreak: number;
  bestStreak: number;
  answersHistory: AnswerRecord[];

  // Actions
  recordAnswers: (answers: AnswerRecord[]) => number; // returns total score
  addHighScore: (entry: ScoreEntry) => void;
  resetStreak: () => void;
  resetProgress: () => void;
}

const POINTS_FIRST_TRY = 10;
const BONUS_STREAK = 2;
const BONUS_SPEED = 5;
const SPEED_THRESHOLD_MS = 5000;

export function computeScore(answer: AnswerRecord, currentStreak: number): number {
  if (!answer.correct) return 0;
  let score = POINTS_FIRST_TRY;
  score += currentStreak * BONUS_STREAK;
  if (answer.timeMs < SPEED_THRESHOLD_MS) {
    score += BONUS_SPEED;
  }
  return score;
}

export const createScoresSlice: StateCreator<ScoresSlice, [], [], ScoresSlice> = (set, get) => ({
  quizzesCompleted: 0,
  highScores: [],
  currentStreak: 0,
  bestStreak: 0,
  answersHistory: [],

  recordAnswers: (answers) => {
    let total = 0;
    let streak = get().currentStreak;

    const scored = answers.map((a) => {
      if (a.correct) {
        streak += 1;
      } else {
        streak = 0;
      }
      const score = computeScore(a, streak);
      total += score;
      return { ...a, score };
    });

    const bestStreak = Math.max(get().bestStreak, streak);

    set({
      currentStreak: streak,
      bestStreak,
      answersHistory: [...get().answersHistory, ...scored],
    });

    return total;
  },

  addHighScore: (entry) => {
    set((state) => ({
      quizzesCompleted: state.quizzesCompleted + 1,
      highScores: [...state.highScores, entry].sort((a, b) => a.score - b.score).slice(-20),
    }));
  },

  resetStreak: () => {
    set({ currentStreak: 0 });
  },

  resetProgress: () => {
    set({
      quizzesCompleted: 0,
      highScores: [],
      currentStreak: 0,
      bestStreak: 0,
      answersHistory: [],
    });
  },
});
