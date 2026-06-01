import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CountryList from './CountryList';

const mockOnCountryClick = vi.fn();
const mockIncludeTerritories = false;
const mockSelectedRegions = [
  'north-america',
  'central-america',
  'caribbean',
  'south-america',
] as const;

vi.mock('../i18n', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: 'en',
    setLanguage: vi.fn(),
    getPrompt: vi.fn(),
  }),
  LanguageProvider: ({ children }: any) => children,
  getCountryNames: (country: any, lang: string) => ({
    name: lang === 'es' && country.nameEs ? country.nameEs : country.name,
    capital: lang === 'es' && country.capitalEs ? country.capitalEs : country.capital,
  }),
}));

vi.mock('../store', () => ({
  useAppStore: (selector: any) =>
    selector({
      includeTerritories: mockIncludeTerritories,
      selectedRegions: mockSelectedRegions,
      onCountryClick: mockOnCountryClick,
      language: 'en',
      setLanguage: vi.fn(),
    }),
}));

vi.mock('../data/countries', () => ({
  allCountries: [
    { iso: 'AR', name: 'Argentina', nameEs: 'Argentina', capital: 'Buenos Aires', capitalEs: 'Buenos Aires', coordinates: [-34.6, -58.38], region: 'south-america', funFact: 'Aconcagua' },
    { iso: 'BR', name: 'Brazil', nameEs: 'Brasil', capital: 'Brasília', capitalEs: 'Brasilia', coordinates: [-15.79, -47.88], region: 'south-america', funFact: 'World Cup' },
    { iso: 'CA', name: 'Canada', nameEs: 'Canadá', capital: 'Ottawa', capitalEs: 'Ottawa', coordinates: [45.42, -75.69], region: 'north-america', funFact: 'Coastline' },
  ],
}));

describe('CountryList', () => {
  it('renders all countries sorted A-Z', () => {
    render(<CountryList />);
    const buttons = screen.getAllByRole('button');
    // Filter out the sort buttons (A-Z, Region)
    const countryButtons = buttons.filter((b) => {
      const text = b.textContent ?? '';
      return text.includes('Argentina') || text.includes('Brazil') || text.includes('Canada');
    });
    expect(countryButtons.length).toBe(3);
    // A-Z order: Argentina, Brazil, Canada
    expect(countryButtons[0]).toHaveTextContent('Argentina');
    expect(countryButtons[1]).toHaveTextContent('Brazil');
    expect(countryButtons[2]).toHaveTextContent('Canada');
  });

  it('clicking a country dispatches onCountryClick', () => {
    render(<CountryList />);
    const brazilButton = screen.getByText('Brazil').closest('button');
    expect(brazilButton).toBeTruthy();
    fireEvent.click(brazilButton!);
    expect(mockOnCountryClick).toHaveBeenCalledWith('BR');
  });
});
