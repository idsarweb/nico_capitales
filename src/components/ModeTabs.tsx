import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n';

export default function ModeTabs() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const TABS = [
    { path: '/study', label: t('nav.study') },
    { path: '/practice', label: t('nav.practice') },
    { path: '/quiz', label: t('nav.quiz') },
  ];

  return (
    <nav className="flex items-center gap-1 rounded-xl border border-white/10 bg-slate-800/80 p-1 backdrop-blur-sm"
      aria-label="Quiz modes"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.path);
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {active && (
              <motion.div
                layoutId="mode-tab-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500 shadow-md"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10"
            >{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
