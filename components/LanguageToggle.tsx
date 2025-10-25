import React from 'react';
import { Language } from '../types';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageToggleProps {
    seasonTheme: Theme;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ seasonTheme }) => {
    const { language, setLanguage } = useTranslation();

    const toggleLanguage = () => {
        setLanguage(language === Language.EN ? Language.HI : Language.EN);
    };

    return (
        <button 
            onClick={toggleLanguage}
            className={`fixed bottom-24 right-4 md:bottom-6 md:right-6 z-20 w-14 h-14 flex items-center justify-center rounded-full shadow-lg ${seasonTheme.primaryBg} text-white font-bold text-lg transition-transform transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 ring-offset-2 ${seasonTheme.ring}`}
            aria-label="Toggle Language"
        >
            {language === Language.EN ? 'हि' : 'En'}
        </button>
    );
};

export default LanguageToggle;