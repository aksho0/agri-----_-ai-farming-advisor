import React from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';

interface FooterProps {
  seasonTheme: Theme;
}

const Footer: React.FC<FooterProps> = ({ seasonTheme }) => {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className={`text-center py-4 px-4 bg-white/50 dark:bg-gray-900/50 border-t border-black/10 dark:border-white/10 transition-colors duration-300`}>
      <p className={`text-sm ${seasonTheme.textMuted}`}>
        {t('footer_text').replace('{year}', year.toString())}
      </p>
    </footer>
  );
};

export default Footer;