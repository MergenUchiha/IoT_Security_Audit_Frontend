import { en } from './locales/en';
import { ru } from './locales/ru';
import { tk } from './locales/tk';

export type Locale = 'en' | 'ru' | 'tk';

export const locales = {
  en,
  ru,
  tk,
};

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  tk: 'Türkmençe',
};

export type TranslationKeys = typeof en;