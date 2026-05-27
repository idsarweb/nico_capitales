import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store';
import { useTranslation } from '../../i18n';
import { allCountries } from '../../data/countries';
import ClickOnMap from '../quiz/question-types/ClickOnMap';
import TextInput from '../quiz/question-types/TextInput';
import MultipleChoice from '../quiz/question-types/MultipleChoice';
import type { QuestionType } from '../../types';

const ALL_TYPES: QuestionType[] = ['click-on-map', 'text-input', 'multiple-choice'];

export default function PracticePage() {
  const { t, getPrompt } = useTranslation();
  const { startQuiz, phase, currentIndex, questions, nextQuestion, skipQuestion, questionTypes, setQuestionTypes } =
    useAppStore();

  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [started, setStarted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const filteredCountries = useMemo(() => {
    return allCountries.filter((c) => !c.territory);
  }, []);

  const toggleType = (type: QuestionType) => {
    const has = questionTypes.includes(type);
    const next = has
      ? questionTypes.filter((t) => t !== type)
      : [...questionTypes, type];
    setQuestionTypes(next);
  };

  const handleStart = () => {
    if (questionTypes.length === 0) return;
    startQuiz('practice', filteredCountries, 5, questionTypes);
    setStarted(true);
  };

  useEffect(() => {
    if (phase === 'idle') {
      setStarted(false);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'correct') {
      setFeedback('correct');
      const t = setTimeout(() => {
        nextQuestion();
        setFeedback(null);
        setShowHint(false);
      }, 1200);
      return () => clearTimeout(t);
    }
    if (phase === 'wrong') {
      setFeedback('wrong');
    }
    if (phase === 'question') {
      setFeedback(null);
    }
  }, [phase, nextQuestion]);


  const hint = useMemo(() => {
    if (!currentQuestion) return null;
    const country = allCountries.find((c) => c.iso === currentQuestion.iso);
    if (!country) return null;
    return `Region: ${country.region.replace(/-/g, ' ')}`;
  }, [currentQuestion]);

  const progress = questions.length > 0 ? Math.round(((currentIndex + (phase === 'idle' ? 0 : 1)) / questions.length) * 100) : 0;

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/90">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t('quiz.practice')}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {Math.min(currentIndex + 1, questions.length)} / {questions.length}
          </span>
        </div>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-700/50">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Question prompt */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 text-center dark:from-slate-800 dark:to-slate-900">
        <p className="text-base font-semibold text-slate-800 dark:text-white">
          {currentQuestion ? getPrompt(currentQuestion) : t('quiz.loading')}
        </p>
        <div className="mt-2 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900 shadow transition hover:shadow-lg"
          >
            {showHint ? t('quiz.hideHint') : t('quiz.hint')}
          </button>
          {phase === 'question' && (
            <button
              type="button"
              onClick={skipQuestion}
              className="rounded-full bg-slate-600/50 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-500/50 hover:text-white"
            >
              {t('quiz.skip')}
            </button>
          )}
        </div>

        <AnimatePresence>
          {showHint && hint && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 text-sm text-teal-300"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Content area */}
      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          {phase === 'idle' && !started && (
            <motion.div
              key="selector"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex h-full items-center justify-center"
            >
              <div className="flex flex-col items-center gap-6 px-4">
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {t('quiz.selectTypes')}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {ALL_TYPES.map((type) => {
                    const active = questionTypes.includes(type);
                    const labels: Record<QuestionType, string> = {
                      'click-on-map': t('quiz.typeMap'),
                      'text-input': t('quiz.typeText'),
                      'multiple-choice': t('quiz.typeChoice'),
                    };
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleType(type)}
                        className={`rounded-full px-5 py-2 text-sm font-bold transition ${
                          active
                            ? 'bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900 shadow-lg'
                            : 'border border-slate-300 bg-transparent text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {labels[type]}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={questionTypes.length === 0}
                  className="rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-8 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:shadow-xl disabled:opacity-50"
                >
                  {t('quiz.start')}
                </button>
              </div>
            </motion.div>
          )}

          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              {currentQuestion.type === 'click-on-map' && (
                <div className="flex h-full flex-col">
                  <div className="flex-1">
                    <ClickOnMap question={currentQuestion} />
                  </div>
                </div>
              )}

              {currentQuestion.type === 'text-input' && (
                <div className="flex h-full flex-col items-center justify-center">
                  <TextInput question={currentQuestion} />
                </div>
              )}

              {currentQuestion.type === 'multiple-choice' && (
                <div className="flex h-full flex-col items-center justify-center">
                  <MultipleChoice question={currentQuestion} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next button when answered wrong */}
        {phase === 'wrong' && (
          <div className="flex justify-center border-t border-white/10 bg-slate-800/90 px-6 py-3">
            <button
              type="button"
              onClick={() => {
                nextQuestion();
                setFeedback(null);
                setShowHint(false);
              }}
              className="rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 px-8 py-2.5 text-sm font-bold text-slate-900 shadow-lg transition hover:shadow-xl"
            >
              {t('quiz.next')}
            </button>
          </div>
        )}
      </div>

      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`pointer-events-none absolute left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-xl px-6 py-3 text-lg font-bold shadow-xl ${
              feedback === 'correct'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
            }`}
          >
            {feedback === 'correct' ? t('quiz.correct') : t('quiz.tryAgain')}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
