import { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useTranslation } from '../i18n';
import { useConfetti } from '../hooks/useConfetti';

export default function ResultsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { highScores, resetQuiz, quizzesCompleted } = useAppStore();

  const latest = useMemo(
    () =>
      highScores.reduce(
        (a, b) => (a.date > b.date ? a : b),
        highScores[0]
      ),
    [highScores]
  );

  const { fire } = useConfetti();
  const stopConfetti = useRef<(() => void) | null>(null);

  const [animatedScore, setAnimatedScore] = useState(0);

  // Determine if this is a celebration-worthy result
  const isCelebration = useMemo(() => {
    if (!latest) return false;
    const isNewHighScore =
      highScores.length > 0 &&
      latest.score === Math.max(...highScores.map((h) => h.score));
    const isPerfect = latest.correctFirstTry === latest.totalQuestions;
    return isNewHighScore || isPerfect;
  }, [latest, highScores]);

  useEffect(() => {
    if (latest && isCelebration) {
      stopConfetti.current = fire();
    }
    return () => {
      stopConfetti.current?.();
    };
  }, [latest, isCelebration, fire]);

  useEffect(() => {
    if (!latest) return;
    const target = latest.score;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setAnimatedScore(current);
    }, 30);
    return () => clearInterval(interval);
  }, [latest]);

  if (!latest) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center"
      >
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100"
        >
          {t('results.noResults')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400"
        >
          {t('results.noResultsDesc')}
        </p>
        <button
          type="button"
          onClick={() => {
            resetQuiz();
            navigate('/quiz');
          }}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
        >
          {t('results.startQuiz')}
        </button>
      </div>
    );
  }

  const { totalQuestions, correctFirstTry, bestStreak: quizStreak, avgSpeedMs } = latest;

  return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
    >
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
            className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 text-3xl shadow-lg"
          >
            {isCelebration ? '🎉' : '📊'}
          </motion.div>
          <h2 className="text-center text-2xl font-extrabold text-slate-900 dark:text-white"
          >
            {t('results.quizComplete')}
          </h2>
          {isCelebration && (
            <p className="mt-1 text-sm font-medium text-amber-400">
              {quizzesCompleted > 1 ? t('results.newHighScore') : t('results.greatStart')}
            </p>
          )}
        </div>

        <div className="mt-6 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="bg-gradient-to-r from-rose-400 via-orange-400 to-amber-400 bg-clip-text text-6xl font-black text-transparent"
          >
            {animatedScore}
          </motion.div>
          <div className="mt-1 text-sm font-medium text-slate-400"
          >
            {t('general.pointsLabel')}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Stat label={t('general.questions')} value={`${totalQuestions}`} delay={0.3} />
          <Stat label={t('general.firstTryLabel')} value={`${correctFirstTry}`} delay={0.35} />
          <Stat label={t('general.bestStreakLabel')} value={`${quizStreak}`} delay={0.4} />
          <Stat label={t('general.avgSpeedLabel')} value={`${Math.round(avgSpeedMs / 1000)}s`} delay={0.45} />
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => {
              resetQuiz();
              navigate('/quiz');
            }}
            className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl"
          >
            {t('results.tryAgain')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/study')}
            className="w-full rounded-xl border border-white/10 bg-slate-700/50 py-3 text-sm font-bold text-slate-200 transition hover:bg-slate-700"
          >
            {t('results.backToStudy')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Stat({ label, value, delay }: { label: string; value: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-white/5 bg-slate-700/50 p-4 text-center"
    >
      <div className="text-xl font-bold text-white"
      >{value}</div>
      <div className="text-xs font-medium text-slate-400"
      >{label}</div>
    </motion.div>
  );
}
