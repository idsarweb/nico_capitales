import type { StateCreator } from 'zustand';
import type { Country, Question, QuizPhase, QuizMode, AnswerRecord } from '../types';

export interface QuizSlice {
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  phase: QuizPhase;
  targetCountry: string | null;
  selectedCountry: string | null;
  answers: AnswerRecord[];
  startTime: number | null;
  questionStartTime: number | null;

  // Optional injected actions
  resetStreak?: () => void;

  // Actions
  startQuiz: (mode: QuizMode, pool: Country[], questionCount?: number) => void;
  answerQuestion: (iso: string) => void;
  nextQuestion: () => void;
  skipQuestion: () => void;
  resetQuiz: () => void;
  onCountryClick: (iso: string) => void;
}

function buildQuestions(pool: Country[], count: number): Question[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  const types: Question['type'][] = ['click-on-map', 'text-input', 'multiple-choice'];

  return selected.map((c, i) => {
    const type = types[i % 3];
    const promptMap: Record<string, string> = {
      'click-on-map': `Click ${c.name} on the map`,
      'text-input': `What is the capital of ${c.name}?`,
      'multiple-choice': `Which country is ${c.capital} the capital of?`,
    };

    let options: string[] | undefined;
    if (type === 'multiple-choice') {
      const distractors = shuffled
        .filter((x) => x.iso !== c.iso)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      options = [c.name, ...distractors.map((d) => d.name)].sort(() => Math.random() - 0.5);
    }

    return {
      id: i + 1,
      type,
      iso: c.iso,
      prompt: promptMap[type],
      options,
      timeLimit: 30,
    };
  });
}

export const createQuizSlice: StateCreator<QuizSlice, [], [], QuizSlice> = (set, get) => ({
  mode: 'study',
  questions: [],
  currentIndex: 0,
  phase: 'idle',
  targetCountry: null,
  selectedCountry: null,
  answers: [],
  startTime: null,
  questionStartTime: null,

  startQuiz: (mode, pool, questionCount = 10) => {
    const questions = buildQuestions(pool, questionCount);
    set({
      mode,
      questions,
      currentIndex: 0,
      phase: 'question',
      targetCountry: questions[0]?.iso ?? null,
      selectedCountry: null,
      answers: [],
      startTime: Date.now(),
      questionStartTime: Date.now(),
    });
    (get() as unknown as { resetStreak?: () => void }).resetStreak?.();
  },

  answerQuestion: (iso: string) => {
    const { questions, currentIndex, phase, answers, questionStartTime, mode } = get();
    const isPracticeRetry = phase === 'wrong' && mode === 'practice';
    if (phase !== 'question' && !isPracticeRetry) return;

    const q = questions[currentIndex];
    if (!q) return;

    const correct = iso === q.iso;
    const timeMs = questionStartTime ? Date.now() - questionStartTime : 0;

    let nextAnswers: AnswerRecord[];
    const existingIndex = answers.findIndex((a) => a.questionId === q.id);

    if (isPracticeRetry && existingIndex !== -1) {
      nextAnswers = answers.map((a, i) =>
        i === existingIndex
          ? { ...a, correct, attempts: a.attempts + 1, timeMs }
          : a
      );
    } else {
      nextAnswers = [
        ...answers,
        {
          questionId: q.id,
          iso: q.iso,
          correct,
          attempts: 1,
          timeMs,
          score: 0, // computed by scoresSlice later
        },
      ];
    }

    set({
      phase: correct ? 'correct' : 'wrong',
      selectedCountry: iso,
      answers: nextAnswers,
    });
  },

  nextQuestion: () => {
    const { questions, currentIndex, phase } = get();
    if (phase !== 'correct' && phase !== 'wrong') return;

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      set({ phase: 'complete', targetCountry: null });
    } else {
      set({
        currentIndex: nextIndex,
        phase: 'question',
        targetCountry: questions[nextIndex].iso,
        selectedCountry: null,
        questionStartTime: Date.now(),
      });
    }
  },

  skipQuestion: () => {
    const { questions, currentIndex, phase, answers } = get();
    if (phase !== 'question' && phase !== 'correct' && phase !== 'wrong') return;

    // Record as skipped if we haven't answered yet
    if (phase === 'question') {
      const q = questions[currentIndex];
      if (!q) return;
      const record: AnswerRecord = {
        questionId: q.id,
        iso: q.iso,
        correct: false,
        attempts: 0,
        timeMs: 0,
        score: 0,
      };
      set({
        phase: 'wrong',
        answers: [...answers, record],
      });
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      set({ phase: 'complete', targetCountry: null });
    } else {
      set({
        currentIndex: nextIndex,
        phase: 'question',
        targetCountry: questions[nextIndex].iso,
        selectedCountry: null,
        questionStartTime: Date.now(),
      });
    }
  },

  resetQuiz: () => {
    set({
      mode: 'study',
      questions: [],
      currentIndex: 0,
      phase: 'idle',
      targetCountry: null,
      selectedCountry: null,
      answers: [],
      startTime: null,
      questionStartTime: null,
    });
  },

  onCountryClick: (iso: string) => {
    const { phase, mode } = get();
    if (phase === 'question' || (mode === 'practice' && phase === 'wrong')) {
      get().answerQuestion(iso);
    } else if (phase !== 'wrong') {
      set({ selectedCountry: iso });
    }
  },
});
