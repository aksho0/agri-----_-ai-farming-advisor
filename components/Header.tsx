import React from 'react';
import { SunIcon, MoonIcon, BellIcon, BackIcon } from './Icons';
import { Season, Theme } from '../hooks/useSeason';
import { View, User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { defaultProfileImage } from '../assets/images';

interface HeaderProps {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    season: Season;
    seasonTheme: Theme;
    currentView: View;
    user: User | null;
    onNavigateHome: () => void;
    onOpenSidePanel: () => void;
    onOpenNotificationPanel: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, season, seasonTheme, currentView, user, onNavigateHome, onOpenSidePanel, onOpenNotificationPanel }) => {
  const { t } = useTranslation();
  
  return (
    <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg shadow-sm dark:border-b dark:border-gray-700 transition-colors duration-300 sticky top-0 z-20">
      <div className="container mx-auto px-4 py-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center justify-center space-x-3">
            {currentView !== 'home' && (
              <button
                onClick={onNavigateHome}
                className={`p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                aria-label={t('back_to_home')}
              >
                <BackIcon />
              </button>
            )}
            <button onClick={onOpenSidePanel} className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full" aria-label={t('open_user_panel')}>
              <img src={user?.profilePicture || defaultProfileImage} alt="User Profile" className="rounded-full h-10 w-10 object-cover" />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
             {t('header_title')} <span className={`${seasonTheme.text} transition-colors duration-500`}>{t('header_subtitle')}</span>
            </h1>
        </div>
        <div className="flex items-center space-x-2">
            <button
                onClick={onOpenNotificationPanel}
                className={`relative p-2 rounded-full ${seasonTheme.text} hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                aria-label={t('notifications')}
            >
              <BellIcon />
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse"></span>
            </button>
            <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${seasonTheme.text} hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
                aria-label={t('toggle_theme')}
            >
                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;