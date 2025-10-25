import React from 'react';
import { HelpIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';

const EmergencyButton: React.FC = () => {
    const { t } = useTranslation();
    
    return (
        <a 
            href="tel:18001801551"
            className="fixed bottom-44 right-4 md:bottom-24 md:right-6 z-20 w-14 h-14 flex items-center justify-center rounded-full shadow-lg bg-red-600 text-white transition-transform transform hover:scale-110 active:scale-100 focus:outline-none focus:ring-2 ring-offset-2 ring-red-500"
            aria-label={t('emergency_help_label')}
            title={t('emergency_help_label')}
        >
            <HelpIcon />
        </a>
    );
};

export default EmergencyButton;