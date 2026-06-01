import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../store';
import { useTranslation, getCountryNames } from '../../../i18n';
import { allCountries } from '../../../data/countries';
import type { Question } from '../../../types';

export default function TextInput({ question }: { question: Question }) {
  const { t, language } = useTranslation();
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [shake, setShake] = useState(false);

  const answerQuestion = useAppStore((s) => s.answerQuestion);
  const nextQuestion = useAppStore((s) => s.nextQuestion);
  const phase = useAppStore((s) => s.phase);

  const targetCountry = useMemo(() => {
    return allCountries.find((c) => c.iso === question.iso);
  }, [question.iso]);

  const targetNames = targetCountry ? getCountryNames(targetCountry, language) : null;
  const correctCapital = targetNames?.capital ?? targetCountry?.capital ?? '';

  const suggestions = useMemo(() => {
    const term = input.trim().toLowerCase();
    if (!term || term.length < 1) return [];
    return allCountries
      .filter((c) => {
        const cap = getCountryNames(c, language).capital;
        return cap.toLowerCase().startsWith(term);
      })
      .map((c) => getCountryNames(c, language).capital)
      .slice(0, 5);
  }, [input, language]);

  const handleSubmit = useCallback(() => {
    if (phase !== 'question') return;
    const normalized = input.trim().toLowerCase();
    if (!normalized) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    const isCorrect = normalized === correctCapital.toLowerCase();
    answerQuestion(isCorrect ? question.iso : '');
    if (!isCorrect) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }, [phase, input, correctCapital, answerQuestion, question.iso]);

  const handleSuggestionClick = useCallback((capital: string) => {
    setInput(capital);
    setShowSuggestions(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-4">
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            disabled={phase !== 'question'}
            placeholder={t('quiz.typeCapital')}
            className="w-full rounded-xl border-2 border-slate-600 bg-slate-800 px-4 py-3 text-lg font-medium text-white shadow-sm outline-none transition focus:border-rose-500"
          />

          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-lg">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(s)}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={phase !== 'question'}
        className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
      >
          {t('quiz.submit')}
      </button>

      {phase === 'correct' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-emerald-500/20 px-4 py-2 text-sm font-bold text-emerald-400"
        >
          {t('quiz.correctAnswer', { answer: correctCapital })}
        </motion.div>
      )}

      {phase === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-rose-500/20 px-4 py-2 text-sm font-bold text-rose-400"
        >
          {t('quiz.wrongAnswer', { answer: correctCapital })}
        </motion.div>
      )}

      {phase !== 'question' && (
        <button
          type="button"
          onClick={() => {
            nextQuestion();
            setInput('');
            setShowSuggestions(false);
          }}
          className="rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-600"
        >
          {t('quiz.next')}
        </button>
      )}
    </div>
  );
}
