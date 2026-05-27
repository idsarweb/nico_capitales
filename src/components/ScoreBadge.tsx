import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store';

export default function ScoreBadge() {
  const currentStreak = useAppStore((s) => s.currentStreak);
  const answers = useAppStore((s) => s.answers);
  const phase = useAppStore((s) => s.phase);

  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (currentStreak > 0) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
  }, [currentStreak]);

  const isActive = phase !== 'idle' && phase !== 'complete';
  const correctCount = answers.filter((a) => a.correct).length;
  const totalCount = answers.length;
  const showStreak = !isActive && currentStreak > 0;

  if (!isActive && !showStreak) return null;

  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 shadow-lg shadow-orange-500/30"
    >
      {isActive ? (
        <>
          <span className="text-sm font-bold text-white">
            {correctCount}/{totalCount}
          </span>
          <span className="text-xs font-semibold text-white/90">✓</span>
        </>
      ) : (
        <>
          <span className="text-sm font-bold text-white">{currentStreak}</span>
          <span className="text-xs font-semibold text-white/90">streak</span>
        </>
      )}
    </motion.div>
  );
}
