import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store';
import { useTranslation } from '../../i18n';
import { allCountries } from '../../data/countries';
import { useTimer } from '../../hooks/useTimer';
import ClickOnMap from './question-types/ClickOnMap';
import TextInput from './question-types/TextInput';
import MultipleChoice from './question-types/MultipleChoice';
import type { QuestionType } from '../../types';

const ALL_TYPES: QuestionType[] = ['click-on-map', 'text-input', 'multiple-choice'];

export default function QuizPage() {
  const navigate = useNavigate();
  const { t, getPrompt, language } = useTranslation();
  const {
    phase,
    currentIndex,
    questions,
    answers,
    startQuiz,
    recordAnswers,
    addHighScore,
    skipQuestion,
    nextQuestion,
    questionTypes,
    setQuestionTypes,
  } = useAppStore();

  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);

  const filteredCountries = allCountries.filter((c) => !c.territory);
  const maxQuestions = filteredCountries.length;

  useEffect(() => {
    if (phase === 'idle') {
      setStarted(false);
    }
  }, [phase]);

  const handleStart = () => {
    if (questionTypes.length === 0) return;
    startQuiz('quiz', filteredCountries, questionCount, questionTypes, language);
    setStarted(true);
  };

  const toggleType = (type: QuestionType) => {
    const has = questionTypes.includes(type);
    const next = has
      ? questionTypes.filter((t) => t !== type)
      : [...questionTypes, type];
    setQuestionTypes(next);
  };

  const currentQuestion = questions[currentIndex];

  const timer = useTimer(
    (currentQuestion?.timeLimit ?? 30) * 1000,
    () => {
      if (phase === 'question') {
        useAppStore.getState().answerQuestion('');
      }
    }
  );

  useEffect(() => {
    if (phase === 'question') {
      timer.reset();
      timer.start();
    } else {
      timer.pause();
    }
  }, [phase, currentIndex, timer]);

  // Auto-advance on correct answers
  useEffect(() => {
    if (phase === 'correct') {
      const t = setTimeout(() => {
        nextQuestion();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [phase, nextQuestion]);

  useEffect(() => {
    if (phase === 'complete') {
      const total = recordAnswers(answers);
      const correctFirstTry = answers.filter((a) => a.correct && a.attempts <= 1).length;
      const bestStreak = useAppStore.getState().bestStreak;
      const avgSpeedMs =
        answers.length > 0
          ? answers.reduce((sum, a) => sum + a.timeMs, 0) / answers.length
          : 0;

      addHighScore({
        date: new Date().toISOString(),
        score: total,
        totalQuestions: questions.length,
        correctFirstTry,
        bestStreak,
        avgSpeedMs,
      });

      navigate('/results');
    }
  }, [phase, answers, questions.length, recordAnswers, addHighScore, navigate]);

  const progress = questions.length > 0 ? ((currentIndex + (phase === 'idle' ? 0 : 1)) / questions.length) * 100 : 0;

  return (
      <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur-md dark:border-white/10 dark:bg-slate-800/90">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {t('nav.quiz')}
          </span>
          <span className="text-xs text-slate-400">
            {Math.min(currentIndex + 1, questions.length)} / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Terminar */}
          {started && phase !== 'idle' && (
            <button
              type="button"
              onClick={() => useAppStore.getState().resetQuiz()}
              className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/30"
            >
              {t('quiz.finish')}
            </button>
          )}

          {/* Timer */}
          <div
            className={`rounded-md px-3 py-1 text-sm font-bold ${
              timer.remainingMs < 5000
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
            }`}
          >
            {Math.ceil(timer.remainingMs / 1000)}s
          </div>

          {/* Skip button */}
          <button
            type="button"
            onClick={() => {
              if (phase === 'question') skipQuestion();
              else useAppStore.getState().nextQuestion();
            }}
            className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-600/50 dark:text-slate-300 dark:hover:bg-slate-500/50 dark:hover:text-white"
          >
            {phase === 'question' ? t('quiz.skip') : t('quiz.next')}
          </button>

          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/50">
            <motion.div
              className="h-full bg-gradient-to-r from-rose-500 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </div>

      {/* Question prompt */}
      <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-4 text-center dark:from-slate-800 dark:to-slate-900">
        <p className="text-base font-semibold text-slate-800 dark:text-white">
          {currentQuestion ? getPrompt(currentQuestion) : t('quiz.loading')}
        </p>
      </div>

      {/* Question area */}
      <div className="flex-1">
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
                            ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg'
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
                    aria-label={t('quiz.questionCount')}
                    className="w-20 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-center text-sm font-semibold text-slate-800 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleStart}
                  disabled={questionTypes.length === 0}
                  className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:opacity-50"
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
                  {(phase === 'correct' || phase === 'wrong') && (
                    <div className="flex justify-center border-t border-white/10 bg-slate-800/90 px-6 py-3">
                      <button
                        type="button"
                        onClick={() => useAppStore.getState().nextQuestion()}
                        className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
                      >
                        {t('quiz.next')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {currentQuestion.type === 'text-input' && (
                <TextInput question={currentQuestion} />
              )}

              {currentQuestion.type === 'multiple-choice' && (
                <MultipleChoice question={currentQuestion} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
