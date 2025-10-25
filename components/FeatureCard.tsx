import React from 'react';
import { Theme } from '../hooks/useSeason';
import LastUpdatedLabel from './LastUpdatedLabel';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  preview: string;
  onClick?: () => void;
  isHighlighted?: boolean;
  seasonTheme: Theme;
  alertLevel?: 'green' | 'yellow' | 'red';
  timestamp?: number | null;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, preview, onClick, isHighlighted = false, seasonTheme, alertLevel, timestamp }) => {
  const baseClasses = "relative flex flex-col items-start justify-between p-4 rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg h-full";
  
  const alertClasses = {
      green: 'bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700',
      yellow: 'bg-yellow-50 dark:bg-yellow-800/40 border border-yellow-300 dark:border-yellow-700',
      red: 'bg-red-50 dark:bg-red-800/40 border border-red-300 dark:border-red-700',
  };

  const cardClasses = isHighlighted 
    ? `${baseClasses} ${seasonTheme.primaryBg} text-white` 
    : alertLevel
    ? `${baseClasses} ${alertClasses[alertLevel]}`
    : `${baseClasses} bg-white/60 dark:bg-gray-800/60`;

  const titleClasses = isHighlighted ? 'text-white' : `text-gray-800 dark:text-gray-100`;
  const previewClasses = isHighlighted ? 'text-white/80' : `text-gray-500 dark:text-gray-400`;
  const iconClasses = isHighlighted ? 'text-white' : seasonTheme.text;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div>
        <div className={`mb-3 ${iconClasses}`}>
          {icon}
        </div>
        <h3 className={`text-lg font-bold ${titleClasses}`}>{title}</h3>
      </div>
      <div>
        <p className={`text-sm mt-1 ${previewClasses}`}>{preview}</p>
        {timestamp && <LastUpdatedLabel timestamp={timestamp} isCompact={true} isCardLabel={true} />}
      </div>
    </div>
  );
};

export default FeatureCard;
