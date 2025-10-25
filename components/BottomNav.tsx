import React from 'react';
import { Theme } from '../hooks/useSeason';
import { HomeIcon, SchemeIcon, QueriesIcon, SettingsIcon, FarmIcon } from './Icons';
import { View } from '../types';
import { useTranslation } from '../hooks/useTranslation';

interface BottomNavProps {
    seasonTheme: Theme;
    activeView: View;
    onNavigate: (view: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ seasonTheme, activeView, onNavigate }) => {
    const { t } = useTranslation();

    const NavItem = ({ icon, label, viewName }: { icon: React.ReactElement, label: string, viewName: string }) => {
        const isActive = activeView === viewName || (viewName === 'home' && activeView === 'chat');
        return (
            <button onClick={() => onNavigate(viewName)} className={`flex flex-col items-center justify-center space-y-1 w-full transition-colors duration-300 ${isActive ? seasonTheme.text : 'text-gray-500 dark:text-gray-400 hover:opacity-80'}`}>
                {icon}
                <span className="text-xs font-medium">{label}</span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-black/10 dark:border-white/10 z-10">
            <div className="container mx-auto px-4 py-2 flex items-center justify-around">
                <NavItem icon={<HomeIcon />} label={t('nav_home')} viewName="home" />
                <NavItem icon={<FarmIcon />} label={t('nav_farm')} viewName="farm" />
                <NavItem icon={<SchemeIcon />} label={t('nav_schemes')} viewName="schemes" />
                <NavItem icon={<SettingsIcon />} label={t('nav_settings')} viewName="settings" />
            </div>
        </div>
    );
};

export default BottomNav;