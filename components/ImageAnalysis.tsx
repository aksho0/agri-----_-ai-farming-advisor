import React, { useState, useRef } from 'react';
import { Theme } from '../hooks/useSeason';
import { CameraIcon, SproutIcon, BackIcon } from './Icons';
import { analyzeCropImageStream } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from '../hooks/useTranslation';

interface ImageAnalysisProps {
  seasonTheme: Theme;
  onBack: () => void;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ seasonTheme, onBack }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useTranslation();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setAnalysisResult(null); // Clear previous result
      setError(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult('');

    try {
        await analyzeCropImageStream(image, language, (chunk) => {
            setAnalysisResult(prev => (prev || '') + chunk);
        });
    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      setAnalysisResult(null); // Clear any partial results on error
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveImage = () => {
      setImage(null);
      setImagePreview(null);
      setAnalysisResult(null);
      setError(null);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  return (
    <div className="pb-20 md:pb-4 space-y-6">
       <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={onBack}
          className={`p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 ${seasonTheme.ring}`}
          aria-label={t('back')}
        >
          <BackIcon />
        </button>
        <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
            {t('crop_analysis_page_title')}
            </h2>
            <p className={seasonTheme.textMuted}>
            {t('crop_analysis_page_subtitle')}
            </p>
        </div>
      </div>


      <div className="p-4 md:p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-md">
        {!imagePreview ? (
          <div
            onClick={handleUploadClick}
            onDrop={(e) => { e.preventDefault(); handleImageChange({ target: e.dataTransfer } as any); }}
            onDragOver={(e) => e.preventDefault()}
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer ${seasonTheme.ring} border-opacity-50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors`}
            role="button"
            aria-label={t('upload_aria')}
          >
            <CameraIcon />
            <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">{t('upload_prompt')}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('upload_formats')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative group">
                <img src={imagePreview} alt="Crop preview" className="w-full max-w-sm mx-auto rounded-lg shadow-lg" />
                 <button 
                    onClick={handleRemoveImage} 
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                    aria-label={t('remove_image')}
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${seasonTheme.primaryBg} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 ${seasonTheme.ring} disabled:bg-gray-400 transition-all duration-300 transform active:scale-95`}
            >
              {isLoading ? t('analyzing') : t('analyze_crop')}
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
          accept="image/*"
        />
      </div>

      {isLoading && !analysisResult && (
        <div className="flex justify-center items-center space-x-3 p-4">
           <SproutIcon />
           <span className="text-lg font-medium animate-pulse text-gray-700 dark:text-gray-300">{t('analyzing_crop_loader')}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
          <p><strong>{t('analysis_error')}</strong> {error}</p>
        </div>
      )}

      {analysisResult && !isLoading && (
        <div className="p-4 md:p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-md">
           <h3 className={`text-xl font-bold mb-3 ${seasonTheme.text}`}>{t('analysis_report')}</h3>
           <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{analysisResult}</ReactMarkdown>
           </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalysis;
