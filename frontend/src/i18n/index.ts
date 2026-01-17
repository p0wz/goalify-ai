import { tr } from './tr';
import { en } from './en';

export type Language = 'tr' | 'en';
export type Translations = typeof tr;

export const translations: Record<Language, Translations> = {
    tr,
    en,
};

export const languageNames: Record<Language, string> = {
    tr: 'Türkçe',
    en: 'English',
};

export { tr, en };
