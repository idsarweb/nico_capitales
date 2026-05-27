import { describe, it, expect, vi } from 'vitest';
import { computeScore, createScoresSlice } from './scoresSlice';
import type { AnswerRecord } from '../types';

const mockSet = vi.fn();
const mockGet = vi.fn((): any => ({
  currentStreak: 0,
  bestStreak: 0,
  quizzesCompleted: 0,
  highScores: [],
  answersHistory: [],
}));
const mockStoreApi = {
  setState: vi.fn(),
  getState: mockGet,
  getInitialState: vi.fn(),
  subscribe: vi.fn(),
};

function makeAnswer(overrides: Partial<AnswerRecord> = {}): AnswerRecord {
  return {
    questionId: 1,
    iso: 'BR',
    correct: true,
    attempts: 1,
    timeMs: 1000,
    score: 0,
    ...overrides,
  };
}

describe('computeScore', () => {
  it('gives 10 points for first-try correct answer with no streak and slow time', () => {
    const answer = makeAnswer({ correct: true, timeMs: 6000 });
    expect(computeScore(answer, 0)).toBe(10);
  });

  it('adds streak bonus of +2 per current streak', () => {
    const answer = makeAnswer({ correct: true, timeMs: 6000 });
    expect(computeScore(answer, 1)).toBe(12);
    expect(computeScore(answer, 2)).toBe(14);
    expect(computeScore(answer, 5)).toBe(20);
  });

  it('adds speed bonus of +5 when answered in under 5 seconds', () => {
    const answer = makeAnswer({ correct: true, timeMs: 4999 });
    expect(computeScore(answer, 0)).toBe(15);
  });

  it('does NOT add speed bonus at exactly 5 seconds (edge case)', () => {
    const answer = makeAnswer({ correct: true, timeMs: 5000 });
    expect(computeScore(answer, 0)).toBe(10);
  });

  it('returns 0 for wrong answers regardless of streak or speed', () => {
    const answer = makeAnswer({ correct: false, timeMs: 1000 });
    expect(computeScore(answer, 5)).toBe(0);
  });

  it('gives max points for correct + high streak + fast', () => {
    const answer = makeAnswer({ correct: true, timeMs: 200 });
    expect(computeScore(answer, 10)).toBe(10 + 20 + 5); // 35
  });
});

describe('ScoresSlice recordAnswers', () => {
  it('computes total score for a sequence of answers', () => {
    const slice = createScoresSlice(mockSet, mockGet, mockStoreApi as any);
    const answers: AnswerRecord[] = [
      makeAnswer({ correct: true, timeMs: 3000 }),
      makeAnswer({ correct: true, timeMs: 4000 }),
      makeAnswer({ correct: false, timeMs: 2000 }),
    ];
    const total = slice.recordAnswers(answers);
    // Q1: streak 0→1, then 10 + 1*2 + 5 speed = 17
    // Q2: streak 1→2, then 10 + 2*2 + 5 speed = 19
    // Q3: wrong = 0
    expect(total).toBe(36);
  });

  it('all-wrong answers result in total 0', () => {
    const slice = createScoresSlice(mockSet, mockGet, mockStoreApi as any);
    const answers: AnswerRecord[] = [
      makeAnswer({ correct: false, timeMs: 3000 }),
      makeAnswer({ correct: false, timeMs: 4000 }),
      makeAnswer({ correct: false, timeMs: 2000 }),
    ];
    const total = slice.recordAnswers(answers);
    expect(total).toBe(0);
  });
});
