import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../../store';
import { useTranslation, getCountryNames } from '../../../i18n';
import { allCountries } from '../../../data/countries';
import type { Question } from '../../../types';

export default function MultipleChoice({ question }: { question: Question }) {
  const { t, language } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);
  const [shakeId, setShakeId] = useState<string | null>(null);

  const answerQuestion = useAppStore((s) => s.answerQuestion);
  const nextQuestion = useAppStore((s) => s.nextQuestion);
  const phase = useAppStore((s) => s.phase);

  const options = question.options ?? [];

  const correctName = useMemo(() => {
    const c = allCountries.find((x) => x.iso === question.iso);
    return c ? getCountryNames(c, language).name : '';
  }, [question.iso, language]);

  const handleClick = (option: string) => {
    if (phase !== 'question') return;
    setSelected(option);
    const isCorrect = option === correctName;
    const iso = isCorrect ? question.iso : '';
    answerQuestion(iso);
    if (!isCorrect) {
      setShakeId(option);
      setTimeout(() => setShakeId(null), 400);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
      <div className="grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, i) => {
          const isCorrect = option === correctName;
          const isSelected = selected === option;
          const isWrong = phase === 'wrong' && isSelected;
          const isRevealedCorrect = phase !== 'question' && isCorrect;
          const shake = shakeId === option;

          return (
            <motion.button
              key={option}
              initial={{ opacity: 0, y: 16 }}
              animate={
                shake
                  ? { x: [-8, 8, -6, 6, 0] }
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.3, delay: i * 0.05 }}
              type="button"
              onClick={() => handleClick(option)}
              disabled={phase !== 'question'}
              className={`rounded-xl border-2 px-6 py-4 text-sm font-bold shadow transition ${
                isRevealedCorrect
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-300'
                  : isWrong
                    ? 'border-rose-400 bg-rose-500/10 text-rose-300'
                    : isSelected
                      ? 'border-orange-400 bg-orange-500/10 text-orange-300'
                      : 'border-slate-600 bg-slate-800/80 text-slate-200 hover:border-rose-400'
              } disabled:opacity-60`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {phase !== 'question' && (
        <button
          type="button"
          onClick={() => {
            nextQuestion();
            setSelected(null);
          }}
          className="rounded-xl bg-slate-700 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-600"
        >
          {t('quiz.next')}
        </button>
      )}
    </div>
  );
}
