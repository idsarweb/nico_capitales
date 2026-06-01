import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import { useTranslation, getCountryNames } from '../i18n';
import { allCountries } from '../data/countries';
import type { Region } from '../types';
import type { Language } from '../i18n';

const REGION_LABELS: Record<Language, Record<Region, string>> = {
  es: {
    'north-america': 'Norteamérica',
    'central-america': 'Centroamérica',
    caribbean: 'Caribe',
    'south-america': 'Sudamérica',
  },
  en: {
    'north-america': 'North America',
    'central-america': 'Central America',
    caribbean: 'Caribbean',
    'south-america': 'South America',
  },
};

const REGION_COLORS: Record<Region, string> = {
  'north-america': '#FF6B6B',
  'central-america': '#4ECDC4',
  caribbean: '#FFD93D',
  'south-america': '#6C5CE7',
};

type SortKey = 'name' | 'region';

export default function CountryList() {
  const { t, language } = useTranslation();
  const includeTerritories = useAppStore((s) => s.includeTerritories);
  const selectedRegions = useAppStore((s) => s.selectedRegions);
  const onCountryClick = useAppStore((s) => s.onCountryClick);

  const [sort, setSort] = useState<SortKey>('name');

  const items = useMemo(() => {
    const pool = includeTerritories ? allCountries : allCountries.filter((c) => !c.territory);
    const filtered = pool.filter((c) => selectedRegions.includes(c.region));
    const sorted = [...filtered].sort((a, b) => {
      const aName = getCountryNames(a, language).name;
      const bName = getCountryNames(b, language).name;
      if (sort === 'name') return aName.localeCompare(bName);
      if (sort === 'region') {
        const rc = a.region.localeCompare(b.region);
        if (rc !== 0) return rc;
        return aName.localeCompare(bName);
      }
      return 0;
    });
    return sorted;
  }, [includeTerritories, selectedRegions, sort, language]);

  const getNames = (c: typeof allCountries[number]) => getCountryNames(c, language);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          {t('study.countries')} ({items.length})
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSort('name')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              sort === 'name'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {t('study.aToZ')}
          </button>
          <button
            type="button"
            onClick={() => setSort('region')}
            className={`rounded-md px-3 py-1 text-sm font-medium transition ${
              sort === 'region'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            {t('study.byRegion')}
          </button>
        </div>
      </div>

      <ul className="flex flex-col gap-2" role="list">
        <AnimatePresence initial={false}>
          {items.map((c) => {
            const names = getNames(c);
            return (
              <motion.li
                key={c.iso}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <button
                  type="button"
                  onClick={() => onCountryClick(c.iso)}
                  className="flex w-full items-center gap-3 rounded-lg bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md dark:bg-slate-800"
                >
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: REGION_COLORS[c.region] }}
                    aria-hidden="true"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-slate-800 dark:text-slate-100">
                      {names.name}
                    </span>
                    <span className="ml-2 text-sm text-slate-400">
                      {names.capital}
                    </span>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: REGION_COLORS[c.region] + '22',
                      color: REGION_COLORS[c.region],
                    }}
                  >
                    {REGION_LABELS[language][c.region]}
                  </span>
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
