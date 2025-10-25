import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LastUpdatedLabelProps {
    timestamp: number | null;
    isCompact?: boolean;
    isCardLabel?: boolean;
}

const LastUpdatedLabel: React.FC<LastUpdatedLabelProps> = ({ timestamp, isCompact = false, isCardLabel = false }) => {
    const { t } = useTranslation();

    if (!timestamp) return null;

    const timeString = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const labelText = t('last_updated_at').replace('{time}', timeString);

    const baseClasses = isCompact ? 'text-xs' : 'text-sm';
    const positionClasses = isCardLabel ? 'mt-2' : 'absolute bottom-2 right-4';
    const colorClasses = isCardLabel ? 'text-inherit opacity-70' : 'text-gray-500 dark:text-gray-400';

    return (
        <div className={`${baseClasses} ${positionClasses} ${colorClasses}`}>
            {labelText}
        </div>
    );
};

export default LastUpdatedLabel;
