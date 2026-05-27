import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizSlice } from './quizSlice';
import { createQuizSlice } from './quizSlice';
import type { ScoresSlice } from './scoresSlice';
import { createScoresSlice } from './scoresSlice';
import type { UISlice } from './uiSlice';
import { createUISlice } from './uiSlice';

export type AppStore = QuizSlice & ScoresSlice & UISlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createQuizSlice(...args),
      ...createScoresSlice(...args),
      ...createUISlice(...args),
    }),
    {
      name: 'america-quiz-storage',
      partialize: (state) => ({
        quizzesCompleted: state.quizzesCompleted,
        highScores: state.highScores,
        currentStreak: state.currentStreak,
        bestStreak: state.bestStreak,
        answersHistory: state.answersHistory,
        language: state.language,
      }),
    }
  )
);
