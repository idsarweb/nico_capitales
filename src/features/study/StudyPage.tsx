import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store';
import { useTranslation, getCountryNames } from '../../i18n';
import { allCountries } from '../../data/countries';
import MapView from '../map/MapView';
import CountryList from '../../components/CountryList';
import { REGION_LABEL_KEY } from '../../utils/regionLabels';

export default function StudyPage() {
  const { t, language } = useTranslation();
  const selectedCountry = useAppStore((s) => s.selectedCountry);
  const mapView = useAppStore((s) => s.mapView);
  const onCountryClick = useAppStore((s) => s.onCountryClick);

  const country = useMemo(() => {
    if (!selectedCountry) return null;
    return allCountries.find((c) => c.iso === selectedCountry) ?? null;
  }, [selectedCountry]);

  const countryNames = country ? getCountryNames(country, language) : null;

  return (
    <div className="relative flex h-screen flex-col">
      <div className="flex-1 overflow-auto">
        {mapView === 'map' ? (
          <MapView mode="study" />
        ) : (
          <CountryList />
        )}
      </div>

      <AnimatePresence>
        {country && (
          <motion.div
            key={country.iso}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="absolute bottom-14 left-1/2 z-[1000] w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-slate-200/50 bg-white/90 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-800/90"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-orange-500 text-xl shadow">
                🇺🇳
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {countryNames?.name ?? country.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t('study.capital')}: <span className="font-medium text-slate-700 dark:text-slate-200">{countryNames?.capital ?? country.capital}</span>
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {t('study.region')}: <span className="font-medium text-slate-700 dark:text-slate-200">
                    {t(REGION_LABEL_KEY[country.region])}
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {(language === 'es' && country.funFactEs) ? country.funFactEs : country.funFact}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onCountryClick(country.iso)}
              className="mt-4 w-full rounded-lg bg-slate-200 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              {t('study.deselect')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
