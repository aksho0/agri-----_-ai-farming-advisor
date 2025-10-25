// Fix: Remove speech recognition functionality as the required hook was not provided.
import React, { useRef, useEffect } from 'react';
import { SendIcon, ImageIcon, MicIcon } from './Icons';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';

interface InputPanelProps {
  query: string;
  setQuery: (query: string) => void;
  image: File | null;
  setImage: (file: File | null) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  seasonTheme: Theme;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  query, setQuery, image, setImage,
  handleSubmit, isLoading, seasonTheme,
  isListening, startListening, stopListening
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const wasLoading = useRef(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (isLoading) {
      wasLoading.current = true;
    } else if (wasLoading.current) {
      // Submission finished, re-focus the input
      textAreaRef.current?.focus();
      wasLoading.current = false;
    }
  }, [isLoading]);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImageRemove = () => {
    setImage(null);
  };
  
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="space-y-3 pb-20 md:pb-4">
       {image && (
        <div className="p-2 bg-white/50 dark:bg-gray-700/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={URL.createObjectURL(image)} alt="Crop preview" className="h-12 w-12 rounded-lg object-cover" />
              <p className="text-xs text-gray-600 dark:text-gray-300">{image.name}</p>
            </div>
            <button onClick={handleImageRemove} className="text-red-500 hover:text-red-700 font-semibold text-xs pr-2">
                {t('remove')}
            </button>
        </div>
      )}
      
      {isListening && (
        <div className="text-center text-sm font-semibold text-gray-600 dark:text-gray-300 animate-pulse">{t('listening')}</div>
      )}

      <div className="relative">
        <textarea
          ref={textAreaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isListening ? '' : t('input_placeholder')}
          className={`w-full p-4 pr-40 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-50 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 ${seasonTheme.ring} focus:border-transparent transition-all duration-300 resize-none shadow-sm dark:placeholder-gray-400`}
          rows={3}
          disabled={isLoading}
           onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if(!isLoading && (query || image)) handleSubmit();
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1 md:space-x-2">
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            <button
                onClick={handleImageUploadClick}
                disabled={isLoading}
                className={`p-3 rounded-full ${seasonTheme.secondaryBg} text-white hover:opacity-90 transition-all duration-300 transform active:scale-95`}
                aria-label={t('upload_image')}
            >
                <ImageIcon />
            </button>
             <button
                onClick={handleMicClick}
                disabled={isLoading}
                className={`p-3 rounded-full ${isListening ? 'bg-red-500' : seasonTheme.secondaryBg} text-white hover:opacity-90 transition-all duration-300 transform active:scale-95`}
                aria-label={isListening ? t('stop_listening') : t('start_listening')}
            >
                <MicIcon />
            </button>
            <button
                onClick={handleSubmit}
                disabled={isLoading || (!query && !image)}
                className={`p-3 rounded-full ${seasonTheme.primaryBg} text-white hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-95`}
                aria-label={t('submit_query')}
            >
                <SendIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;