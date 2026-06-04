import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { allCountries } from './data/countries';
import { useAppStore } from './store';
import { useTranslation } from './i18n';
import ModeTabs from './components/ModeTabs';
import ScoreBadge from './components/ScoreBadge';
import { ErrorBoundary } from './components/ErrorBoundary';

import StudyPage from './features/study/StudyPage';
import PracticePage from './features/practice/PracticePage';
import QuizPage from './features/quiz/QuizPage';
import ResultsPage from './pages/ResultsPage';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function Layout() {
  const location = useLocation();
  const { t, language, setLanguage } = useTranslation();
  const mapView = useAppStore((s) => s.mapView);
  const setMapView = useAppStore((s) => s.setMapView);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const showViewToggle = location.pathname === '/study';

  return (
    <div className="flex h-screen flex-col"
    >
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-slate-900/90"
      >
        <div className="flex items-center gap-3"
        >
          <h1 className="text-lg font-black tracking-tight text-transparent bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text"
          >
            Americas Quiz
          </h1>
          <ScoreBadge />
        </div>

        <div className="flex items-center gap-3"
        >
          {showViewToggle && (
            <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => setMapView('map')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  mapView === 'map'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t('study.map')}
              </button>
              <button
                type="button"
                onClick={() => setMapView('list')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition ${
                  mapView === 'list'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t('study.list')}
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <span className={language === 'es' ? 'opacity-100' : 'opacity-40'}>ES</span>
            <span className="text-slate-500">|</span>
            <span className={language === 'en' ? 'opacity-100' : 'opacity-40'}>EN</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-200 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title={theme === 'dark' ? t('general.lightMode') : t('general.darkMode')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <ModeTabs />
        </div>
      </header>

      <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"
      >
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Navigate to="/study" replace />} />
            <Route
              path="/study"
              element={
                <PageTransition>
                  <ErrorBoundary>
                    <StudyPage />
                  </ErrorBoundary>
                </PageTransition>
              }
            />
            <Route
              path="/practice"
              element={
                <PageTransition>
                  <ErrorBoundary>
                    <PracticePage />
                  </ErrorBoundary>
                </PageTransition>
              }
            />
            <Route
              path="/quiz"
              element={
                <PageTransition>
                  <ErrorBoundary>
                    <QuizPage />
                  </ErrorBoundary>
                </PageTransition>
              }
            />
            <Route
              path="/results"
              element={
                <PageTransition>
                  <ErrorBoundary>
                    <ResultsPage />
                  </ErrorBoundary>
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

    </div>
  );
}

  function EmptyState() {
    const { t } = useTranslation();
    return (
      <div
        className="flex h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        role="alert"
        aria-live="assertive"
      >
        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100"
        >
          {t('quiz.noCountries')}
        </h2>
        <p className="text-slate-500 dark:text-slate-400"
        >
          {t('quiz.noResultsDesc')}
        </p>
      </div>
    );
  }

export default function App() {
  if (allCountries.length === 0) {
    return <EmptyState />;
  }

  return (
    <HashRouter>
      <Layout />
    </HashRouter>
  );
}
