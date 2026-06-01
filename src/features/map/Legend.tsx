import { useMemo } from 'react';
import { useTranslation } from '../../i18n';
import type { Region } from '../../types';

const REGION_META: { region: Region; labelKey: string; color: string }[] = [
  { region: 'north-america', labelKey: 'map.northAmerica', color: '#FF6B6B' },
  { region: 'central-america', labelKey: 'map.centralAmerica', color: '#4ECDC4' },
  { region: 'caribbean', labelKey: 'map.caribbean', color: '#FFD93D' },
  { region: 'south-america', labelKey: 'map.southAmerica', color: '#6C5CE7' },
];

export function Legend() {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      REGION_META.map((item) => ({
        ...item,
        label: t(item.labelKey),
      })),
    [t]
  );

  return (
    <div className="absolute bottom-8 left-4 z-[999] rounded-xl border border-white/10 bg-slate-800/80 px-4 py-3 shadow-lg backdrop-blur-sm">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-300">
        {t('map.regions')}
      </h3>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.region} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm shadow"
              style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium text-slate-200">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
