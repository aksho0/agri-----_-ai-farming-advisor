import React, { useState } from 'react';
import { Theme } from '../hooks/useSeason';
import { CameraIcon, QueriesIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import FeatureCard from './FeatureCard';
import ImageAnalysis from './ImageAnalysis';

interface CropAnalysisPageProps {
  seasonTheme: Theme;
  onNavigateToChat: () => void;
}

type AnalysisMode = 'selection' | 'image';

const CropAnalysisPage: React.FC<CropAnalysisPageProps> = ({ seasonTheme, onNavigateToChat }) => {
  const [mode, setMode] = useState<AnalysisMode>('selection');
  const { t } = useTranslation();

  const handleSelectImageAnalysis = () => setMode('image');
  const handleSelectDescriptionAnalysis = () => onNavigateToChat();
  const handleBackToSelection = () => setMode('selection');

  if (mode === 'image') {
    return <ImageAnalysis seasonTheme={seasonTheme} onBack={handleBackToSelection} />;
  }

  return (
    <div className="pb-20 md:pb-4 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          {t('crop_analysis_selection_title')}
        </h2>
        <p className={seasonTheme.textMuted}>
          {t('crop_analysis_selection_subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <FeatureCard
          icon={<CameraIcon />}
          title={t('analyze_by_image_title')}
          preview={t('analyze_by_image_preview')}
          onClick={handleSelectImageAnalysis}
          seasonTheme={seasonTheme}
          isHighlighted
        />
        <FeatureCard
          icon={<QueriesIcon />}
          title={t('analyze_by_description_title')}
          preview={t('analyze_by_description_preview')}
          onClick={handleSelectDescriptionAnalysis}
          seasonTheme={seasonTheme}
          isHighlighted
        />
      </div>
    </div>
  );
};

export default CropAnalysisPage;
