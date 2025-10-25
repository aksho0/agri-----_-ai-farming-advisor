import { useContext, useCallback } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const useTranslation = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const t = useCallback((key: string): string => {
    if (!key) return '';
    return translations[key]?.[language] || key;
  }, [language]);

  return { t, language, setLanguage };
};
