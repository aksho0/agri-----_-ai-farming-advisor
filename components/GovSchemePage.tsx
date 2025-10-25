import React from 'react';
import { Theme } from '../hooks/useSeason';
import { ExternalLinkIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { GovScheme } from '../types';
import LastUpdatedLabel from './LastUpdatedLabel';

interface GovSchemePageProps {
  seasonTheme: Theme;
  schemes: GovScheme[];
  lastUpdated: number | null;
}

const GovSchemePage: React.FC<GovSchemePageProps> = ({ seasonTheme, schemes, lastUpdated }) => {
  const { t } = useTranslation();

  return (
    <div className="pb-20 md:pb-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                {t('govt_portals_title')}
            </h2>
            <LastUpdatedLabel timestamp={lastUpdated} isCompact={true} />
        </div>
        
        {schemes.length === 0 ? (
            <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                 <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {schemes.map((scheme) => (
                    <a 
                        key={scheme.name} 
                        href={scheme.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`block p-6 rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-white/60 dark:bg-gray-800/60`}
                    >
                        <div className="flex justify-between items-start space-x-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 flex-1">{scheme.name}</h3>
                            <div className={`flex-shrink-0 ${seasonTheme.text}`}>
                               <ExternalLinkIcon />
                            </div>
                        </div>
                        <p className={`text-sm ${seasonTheme.textMuted}`}>{scheme.description}</p>
                    </a>
                ))}
            </div>
        )}
    </div>
  );
};

export default GovSchemePage;
