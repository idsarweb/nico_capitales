import { describe, it, expect } from 'vitest';
import { create } from 'zustand';
import { createQuizSlice } from './quizSlice';
import { allCountries } from '../data/countries';
import type { QuizSlice } from './quizSlice';

function makeStore() {
  return create<QuizSlice>()((...args) => createQuizSlice(...args));
}

const pool = allCountries.filter((c) => !c.territory).slice(0, 5);

describe('QuizSlice state machine', () => {
  it('idle → question when quiz starts', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    const s = store.getState();
    expect(s.phase).toBe('question');
    expect(s.questions.length).toBe(3);
    expect(s.currentIndex).toBe(0);
    expect(s.targetCountry).toBe(s.questions[0].iso);
  });

  it('question → correct on right answer', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    const q = store.getState().questions[0];
    store.getState().answerQuestion(q.iso);
    const s = store.getState();
    expect(s.phase).toBe('correct');
    expect(s.answers.length).toBe(1);
    expect(s.answers[0].correct).toBe(true);
  });

  it('question → wrong on incorrect answer', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    store.getState().answerQuestion('WRONG');
    const s = store.getState();
    expect(s.phase).toBe('wrong');
    expect(s.answers[0].correct).toBe(false);
  });

  it('correct/wrong → question (next) until complete', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);

    // Q1
    store.getState().answerQuestion(store.getState().questions[0].iso);
    expect(store.getState().phase).toBe('correct');
    store.getState().nextQuestion();
    expect(store.getState().phase).toBe('question');
    expect(store.getState().currentIndex).toBe(1);

    // Q2
    store.getState().answerQuestion(store.getState().questions[1].iso);
    store.getState().nextQuestion();
    expect(store.getState().phase).toBe('question');
    expect(store.getState().currentIndex).toBe(2);

    // Q3 (last)
    store.getState().answerQuestion(store.getState().questions[2].iso);
    store.getState().nextQuestion();
    expect(store.getState().phase).toBe('complete');
    expect(store.getState().targetCountry).toBeNull();
  });

  it('does not allow answering when not in question phase', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    store.getState().answerQuestion(store.getState().questions[0].iso);
    const answersLen = store.getState().answers.length;
    store.getState().answerQuestion(store.getState().questions[0].iso);
    expect(store.getState().answers.length).toBe(answersLen);
  });

  it('does not allow nextQuestion when not in correct/wrong phase', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    const idx = store.getState().currentIndex;
    store.getState().nextQuestion();
    expect(store.getState().currentIndex).toBe(idx);
  });

  it('resetQuiz returns to idle', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    store.getState().resetQuiz();
    const s = store.getState();
    expect(s.phase).toBe('idle');
    expect(s.questions).toEqual([]);
    expect(s.answers).toEqual([]);
    expect(s.currentIndex).toBe(0);
  });

  it('onCountryClick dispatches to answerQuestion in quiz phase', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 3);
    const q = store.getState().questions[0];
    store.getState().onCountryClick(q.iso);
    expect(store.getState().phase).toBe('correct');
  });

  it('onCountryClick selects country in study mode', () => {
    const store = makeStore();
    store.getState().onCountryClick('BR');
    const s = store.getState();
    expect(s.selectedCountry).toBe('BR');
    expect(s.phase).toBe('idle');
  });

  it('interrupted session preserves phase and currentIndex', () => {
    const store = makeStore();
    store.getState().startQuiz('quiz', pool, 5);
    // Answer Q1 correctly
    store.getState().answerQuestion(store.getState().questions[0].iso);
    store.getState().nextQuestion();
    // Now we're on Q2 (index 1)
    const s = store.getState();
    expect(s.phase).toBe('question');
    expect(s.currentIndex).toBe(1);
    expect(s.questions.length).toBe(5);
    // This state is what a resume modal would use
    expect(s.phase).not.toBe('idle');
    expect(s.phase).not.toBe('complete');
  });
});
