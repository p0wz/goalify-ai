import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { translations, Language, Translations } from '@/i18n';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
    defaultLanguage?: Language;
    storageKey?: string;
}

export function LanguageProvider({
    children,
    defaultLanguage = 'tr',
    storageKey = 'sentio-picks-language',
}: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(storageKey);
            if (stored === 'tr' || stored === 'en') return stored;

            // Auto-detect browser language
            const browserLang = navigator.language.split('-')[0];
            if (browserLang === 'tr') return 'tr';
            if (browserLang === 'en') return 'en';
        }
        return defaultLanguage;
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, lang);
        }
    };

    useEffect(() => {
        // Update HTML lang attribute
        document.documentElement.lang = language;
    }, [language]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
