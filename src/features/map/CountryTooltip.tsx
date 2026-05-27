import { memo } from 'react';

interface CountryTooltipProps {
  name: string;
}

export const CountryTooltip = memo(function CountryTooltip({
  name,
}: CountryTooltipProps) {
  return (
    <div className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
      {name}
    </div>
  );
});
