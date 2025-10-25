import React from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { AlertIcon } from './Icons';
import { DiseaseAlert } from '../types';
import LastUpdatedLabel from './LastUpdatedLabel';

interface DiseaseAlertsPageProps {
  seasonTheme: Theme;
  alerts: DiseaseAlert[];
  lastUpdated: number | null;
}

const DiseaseAlertsPage: React.FC<DiseaseAlertsPageProps> = ({ seasonTheme, alerts, lastUpdated }) => {
    const { t } = useTranslation();

    const riskClasses = {
        red: 'border-red-500 bg-red-50 dark:bg-red-900/40',
        yellow: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-800/40',
        green: 'border-green-500 bg-green-50 dark:bg-green-900/40'
    };
    const riskTextClasses = {
        red: 'text-red-600 dark:text-red-300',
        yellow: 'text-yellow-600 dark:text-yellow-300',
        green: 'text-green-600 dark:text-green-300'
    };

  return (
    <div className="pb-20 md:pb-4 space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('disease_alerts_page_title')}</h2>
            <LastUpdatedLabel timestamp={lastUpdated} isCompact={true} />
        </div>

        {alerts.length === 0 ? (
            <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                 <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
            </div>
        ) : (
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.nameKey} className={`p-4 md:p-6 rounded-2xl shadow-md border-l-4 ${riskClasses[alert.risk]}`}>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t(alert.nameKey)}</h3>
                            <span className={`px-3 py-1 text-sm font-bold rounded-full ${riskClasses[alert.risk]} ${riskTextClasses[alert.risk]}`}>
                                {t(alert.levelKey)}
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1 mb-3">{t('affected_crops')}: {t(alert.cropsKey)}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">{t(alert.descriptionKey)}</p>
                        
                        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                            <h4 className={`font-bold ${seasonTheme.text}`}>{t('preventative_measures')}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t(alert.measuresKey)}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default DiseaseAlertsPage;
