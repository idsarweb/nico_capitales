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

export default function QuizPage() {
  const navigate = useNavigate();
  const { t, getPrompt } = useTranslation();
  const {
    phase,
    currentIndex,
    questions,
    answers,
    startQuiz,
    recordAnswers,
    addHighScore,
    skipQuestion,
  } = useAppStore();

  const [started, setStarted] = useState(false);

  const filteredCountries = allCountries.filter((c) => !c.territory);

  useEffect(() => {
    if (phase === 'idle') {
      setStarted(false);
    }
  }, [phase]);

  useEffect(() => {
    if (!started && phase === 'idle') {
      startQuiz('quiz', filteredCountries, 10);
      setStarted(true);
    }
  }, [started, phase, startQuiz, filteredCountries]);

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

  useEffect(() => {
    if (phase === 'complete') {
      const total = recordAnswers(answers);
      const correctFirstTry = answers.filter((a) => a.correct).length;
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
