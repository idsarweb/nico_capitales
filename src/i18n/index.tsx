import { createContext, useContext, useMemo, useCallback, type ReactNode } from 'react';
import { useAppStore } from '../store';
import type { Language, TranslationSection } from './types';
import { allCountries } from '../data/countries';
import type { Question } from '../types';
import es from './es.json';
import en from './en.json';

export type { Language } from './types';

const translations: Record<Language, TranslationSection> = { es: es as TranslationSection, en: en as TranslationSection };

interface TranslationContextValue {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
  getPrompt: (question: Question) => string;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let result: unknown = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object') {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    if (typeof result !== 'string') return key;

    if (params) {
      return Object.entries(params).reduce(
        (acc, [param, value]) => acc.replace(`{${param}}`, String(value)),
        result
      );
    }

    return result;
  }, [language]);

  const getPrompt = useCallback((question: Question) => {
    const country = allCountries.find((c) => c.iso === question.iso);
    const name = country?.name ?? question.iso;
    const capital = country?.capital ?? '';

    switch (question.type) {
      case 'click-on-map':
        return t('quiz.clickOn', { country: name });
      case 'text-input':
        return t('quiz.whatCapital', { country: name });
      case 'multiple-choice':
        return t('quiz.whichCountryCapital', { capital });
      default:
        return question.prompt;
    }
  }, [t]);

  const value = useMemo<TranslationContextValue>(() => ({
    language,
    setLanguage,
    t,
    getPrompt,
  }), [language, setLanguage, t, getPrompt]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(TranslationContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}
