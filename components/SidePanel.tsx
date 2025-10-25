import React from 'react';
import { Theme, Season } from '../hooks/useSeason';
import { View, User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { CloseIcon, LogoutIcon, FarmIcon, SettingsIcon, MoonIcon, SunIcon } from './Icons';
import { defaultProfileImage } from '../assets/images';

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    seasonTheme: Theme;
    season: Season;
    user: User | null;
}

const SidePanel: React.FC<SidePanelProps> = ({
    isOpen, onClose, onNavigate, onLogout, theme, toggleTheme, seasonTheme, season, user
}) => {
    const { t } = useTranslation();

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Side Panel */}
            <div
                className={`fixed top-0 left-0 h-full w-full max-w-xs bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="side-panel-title"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h2 id="side-panel-title" className={`text-lg font-bold ${seasonTheme.text}`}>{t('side_panel_title')}</h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close panel">
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="flex items-center space-x-3 mt-4">
                            <img src={user?.profilePicture || defaultProfileImage} alt="User Profile" className="rounded-full h-14 w-14 object-cover" />
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-100">{user?.name || t('mock_user_name')}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || t('mock_user_email')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow p-4 space-y-2">
                        <a onClick={() => onNavigate('farm')} className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <FarmIcon />
                            <span>{t('side_panel_my_farm')}</span>
                        </a>
                        <a onClick={() => onNavigate('settings')} className="flex items-center space-x-3 p-3 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                            <SettingsIcon />
                            <span>{t('side_panel_settings')}</span>
                        </a>
                    </nav>
                    
                    {/* App Settings */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('side_panel_app_settings')}</h3>
                         <div className="flex items-center justify-between p-3 rounded-lg">
                            <span className="text-gray-700 dark:text-gray-200">{t('side_panel_theme')}</span>
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-full ${seasonTheme.text} bg-gray-100 dark:bg-gray-700`}
                                aria-label={t('toggle_theme')}
                            >
                                {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                            </button>
                        </div>
                    </div>


                    {/* Footer / Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 font-semibold"
                        >
                            <LogoutIcon />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SidePanel;