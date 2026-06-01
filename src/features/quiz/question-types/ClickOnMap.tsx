import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../store';
import { useTranslation, getCountryNames } from '../../../i18n';
import { allCountries } from '../../../data/countries';
import type { Question } from '../../../types';
import MapView from '../../map/MapView';

export default function ClickOnMap({ question }: { question: Question }) {
  const { t, language } = useTranslation();
  const phase = useAppStore((s) => s.phase);

  const targetCountry = useMemo(() => {
    return allCountries.find((c) => c.iso === question.iso);
  }, [question.iso]);

  const targetNames = targetCountry ? getCountryNames(targetCountry, language) : null;

  return (
    <div className="relative h-full w-full">
      <MapView mode="quiz" />

      {phase === 'correct' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-emerald-500 px-6 py-3 text-lg font-bold text-white shadow-xl"
        >
          {t('quiz.correct')}
        </motion.div>
      )}

      {phase === 'wrong' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pointer-events-none absolute left-1/2 top-1/2 z-[1001] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-rose-500 px-6 py-3 text-lg font-bold text-white shadow-xl"
        >
          {t('quiz.wrongAnswer', { answer: targetNames?.name ?? targetCountry?.name ?? '' })}
        </motion.div>
      )}
    </div>
  );
}
