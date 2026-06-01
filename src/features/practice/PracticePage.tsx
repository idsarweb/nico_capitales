import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store';
import { useTranslation, getCountryNames } from '../../i18n';
import { allCountries } from '../../data/countries';
import ClickOnMap from '../quiz/question-types/ClickOnMap';
import TextInput from '../quiz/question-types/TextInput';
import MultipleChoice from '../quiz/question-types/MultipleChoice';
import type { QuestionType } from '../../types';

const ALL_TYPES: QuestionType[] = ['click-on-map', 'text-input', 'multiple-choice'];

function maskText(text: string, maskWords: string[]): string {
  const allTerms = new Set<string>();

  for (const word of maskWords) {
    if (!word) continue;
    allTerms.add(word);

    // Variantes sin artículo y con artículos en ambos idiomas
    const withoutArticle = word.replace(/^(The|Las|Los|La|El)\s+/i, '');
    if (withoutArticle !== word) {
      ['', 'The ', 'Las ', 'Los ', 'La ', 'El '].forEach((prefix) => allTerms.add(prefix + withoutArticle));
    }

    // Primera palabra (para "Mexico City", buscar solo "Mexico")
    if (word.includes(' ')) {
      const first = word.split(' ')[0];
      if (first.length > 3) allTerms.add(first);
    }

    // Parte antes de coma (para "Washington, D.C.")
    if (word.includes(',')) {
      allTerms.add(word.split(',')[0]);
    }
  }

  // Ordenar de más largo a más corto para evitar reemplazos parciales
  const sorted = Array.from(allTerms)
    .filter((t) => t.length >= 2)
    .sort((a, b) => b.length - a.length);

  let result = text;
  for (const term of sorted) {
    const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    result = result.replace(new RegExp(escaped, 'gi'), '*****');
  }

  return result;
}

export default function PracticePage() {
  const { t, getPrompt, language } = useTranslation();
  const { startQuiz, phase, currentIndex, questions, answers, nextQuestion, skipQuestion, questionTypes, setQuestionTypes, resetQuiz } = useAppStore();

  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);

  const currentQuestion = questions[currentIndex];

  const filteredCountries = useMemo(() => {
    return allCountries.filter((c) => !c.territory);
  }, []);
  const maxQuestions = filteredCountries.length;

  const toggleType = (type: QuestionType) => {
    const has = questionTypes.includes(type);
    const next = has
      ? questionTypes.filter((t) => t !== type)
      : [...questionTypes, type];
    setQuestionTypes(next);
  };

  const handleStart = () => {
    if (questionTypes.length === 0) return;
    startQuiz('practice', filteredCountries, questionCount, questionTypes, language);
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


  const stats = useMemo(() => {
    if (answers.length === 0) return null;
    const total = questions.length;
    const correct = answers.filter((a) => a.correct).length;
    const firstTry = answers.filter((a) => a.correct && a.attempts <= 1).length;
    const avgSpeedMs = answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length;
    return { correct, total, firstTry, avgSpeedMs };
  }, [answers, questions.length]);

  const hint = useMemo(() => {
    if (!currentQuestion) return null;
    return allCountries.find((c) => c.iso === currentQuestion.iso) ?? null;
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
        {started && phase !== 'idle' && (
          <button
            type="button"
            onClick={() => resetQuiz()}
            className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/30"
          >
            {t('quiz.finish')}
          </button>
        )}
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
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="mt-3 overflow-hidden rounded-xl border border-slate-200/50 bg-white/90 p-4 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/90"
          >
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('study.region')}: <span className="font-medium text-slate-700 dark:text-slate-200">
                {hint.region.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {(() => {
                const hintNames = getCountryNames(hint, language);
                const raw = (language === 'es' && hint.funFactEs) ? hint.funFactEs : hint.funFact;
                return maskText(raw, [hintNames.name, hintNames.capital]);
              })()}
            </p>
          </motion.div>
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
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600 dark:text-slate-300">
                    {t('quiz.questionCount')}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={maxQuestions}
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Math.min(maxQuestions, Math.max(1, Number(e.target.value))))}
                    className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
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

          {currentQuestion && phase !== 'complete' && (
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

        {/* Completion screen */}
        {phase === 'complete' && stats && (
          <div className="flex h-full items-center justify-center px-4 py-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/80"
            >
              <div className="mb-4 text-center">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-400 text-3xl shadow-lg"
                >
                  📊
                </motion.div>
                <h2 className="text-center text-2xl font-extrabold text-slate-900 dark:text-white">
                  {t('results.quizComplete')}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t('quiz.practice')}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border border-white/5 bg-slate-100 p-4 text-center dark:bg-slate-700/50"
                >
                  <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.correct} / {stats.total}</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('general.questions')}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-xl border border-white/5 bg-slate-100 p-4 text-center dark:bg-slate-700/50"
                >
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.firstTry}</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('general.firstTryLabel')}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border border-white/5 bg-slate-100 p-4 text-center dark:bg-slate-700/50"
                >
                  <div className="text-xl font-bold text-slate-800 dark:text-white">{Math.round(stats.avgSpeedMs / 1000)}s</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('general.avgSpeedLabel')}</div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="rounded-xl border border-white/5 bg-slate-100 p-4 text-center dark:bg-slate-700/50"
                >
                  <div className="text-xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('general.questions')}</div>
                </motion.div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => resetQuiz()}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-400 to-emerald-400 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:shadow-xl"
                >
                  {t('quiz.finish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
