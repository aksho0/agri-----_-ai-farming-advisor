import React, { useMemo } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { SunIcon, RainIcon, CloudIcon, SproutIcon } from './Icons';
import { WeatherData } from '../types';
import LastUpdatedLabel from './LastUpdatedLabel';

interface WeatherDetailPageProps {
  seasonTheme: Theme;
  weatherData: WeatherData | null;
  lastUpdated: number | null;
}

const WeatherIcon: React.FC<{condition: string}> = ({ condition }) => {
    switch(condition) {
        case 'Rainy': return <RainIcon />;
        case 'Cloudy': return <CloudIcon />;
        case 'Clear':
        default: return <SunIcon />;
    }
};

const WeatherDetailPage: React.FC<WeatherDetailPageProps> = ({ seasonTheme, weatherData, lastUpdated }) => {
  const { t } = useTranslation();

  const mockForecast = useMemo(() => [
    { day: t('day_today'), temp: 28, condition: 'Clear', conditionText: t('weather_condition_clear') },
    { day: t('day_mon'), temp: 29, condition: 'Clear', conditionText: t('weather_condition_clear') },
    { day: t('day_tue'), temp: 30, condition: 'Cloudy', conditionText: t('weather_condition_cloudy') },
    { day: t('day_wed'), temp: 27, condition: 'Rainy', conditionText: t('weather_condition_rainy') },
    { day: t('day_thu'), temp: 31, condition: 'Clear', conditionText: t('weather_condition_clear') },
  ], [t]);


  return (
    <div className="pb-20 md:pb-4 space-y-6">
        <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('weather_details_title')}</h2>
            <p className={`${seasonTheme.textMuted}`}>{t('weather_location')}</p>
        </div>
        
        {!weatherData ? (
             <div className="text-center p-8 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                 <p className="text-gray-500 dark:text-gray-400">{t('loading')}</p>
            </div>
        ) : (
          <>
            <div className="relative bg-white/60 dark:bg-gray-800/60 p-4 md:p-6 rounded-2xl shadow-md">
                <h3 className={`text-xl font-bold mb-4 ${seasonTheme.text}`}>{t('5_day_forecast')}</h3>
                <div className="flex flex-col md:flex-row justify-between text-center space-y-4 md:space-y-0 md:space-x-4">
                    {mockForecast.map((day, index) => (
                        <div key={index} className="flex-1 p-3 bg-black/5 dark:bg-white/5 rounded-lg">
                            <p className="font-bold text-gray-800 dark:text-gray-100">{day.day}</p>
                            <div className={`my-2 mx-auto w-10 h-10 flex items-center justify-center ${seasonTheme.text}`}>
                               <WeatherIcon condition={day.condition} />
                            </div>
                            <p className="font-semibold text-lg text-gray-700 dark:text-gray-200">{day.temp}°C</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{day.conditionText}</p>
                        </div>
                    ))}
                </div>
                 <LastUpdatedLabel timestamp={lastUpdated} />
            </div>

            <div className="bg-white/60 dark:bg-gray-800/60 p-4 md:p-6 rounded-2xl shadow-md">
                <div className="flex items-center space-x-3 mb-3">
                    <div className={seasonTheme.text}><SproutIcon /></div>
                    <h3 className={`text-xl font-bold ${seasonTheme.text}`}>{t('ai_weather_advice_title')}</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {t('ai_weather_advice_content')}
                </p>
            </div>
          </>
        )}
    </div>
  );
};

export default WeatherDetailPage;
