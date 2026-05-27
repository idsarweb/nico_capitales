import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Legend } from './Legend';

vi.mock('../../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'map.regions': 'Regions',
        'map.northAmerica': 'North America',
        'map.centralAmerica': 'Central America',
        'map.caribbean': 'Caribbean',
        'map.southAmerica': 'South America',
      };
      return map[key] || key;
    },
    language: 'en' as const,
    setLanguage: () => {},
    getPrompt: () => '',
  }),
}));

describe('Legend', () => {
  it('renders 4 regions with correct labels', () => {
    render(<Legend />);
    expect(screen.getByText('North America')).toBeInTheDocument();
    expect(screen.getByText('Central America')).toBeInTheDocument();
    expect(screen.getByText('Caribbean')).toBeInTheDocument();
    expect(screen.getByText('South America')).toBeInTheDocument();
  });

  it('renders a color swatch for each region', () => {
    const { container } = render(<Legend />);
    const swatches = container.querySelectorAll('span[aria-hidden="true"]');
    expect(swatches.length).toBe(4);
  });

  it('has correct heading', () => {
    render(<Legend />);
    expect(screen.getByText('Regions')).toBeInTheDocument();
  });
});
