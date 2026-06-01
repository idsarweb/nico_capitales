import type { Language } from './types';

export function getCountryNames(
  country: { name: string; nameEs?: string; capital: string; capitalEs?: string },
  lang: Language
) {
  return {
    name: lang === 'es' && country.nameEs ? country.nameEs : country.name,
    capital: lang === 'es' && country.capitalEs ? country.capitalEs : country.capital,
  };
}
