import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const OfflineBadge: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center mb-4">
            <span className="inline-block bg-yellow-100 text-yellow-800 text-sm font-semibold mr-2 px-3 py-1 rounded-full dark:bg-yellow-900 dark:text-yellow-300">
                ⚠️ {t('offline_mode')}
            </span>
        </div>
    );
};

export default OfflineBadge;
