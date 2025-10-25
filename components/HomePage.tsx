import React, { useState, useEffect } from 'react';
import { Season, Theme } from '../hooks/useSeason';
import FeatureCard from './FeatureCard';
import OfflineBadge from './OfflineBadge';
import LastUpdatedLabel from './LastUpdatedLabel';
import { SchemeIcon, MarketIcon, AlertIcon, BotIcon, SunIcon, RainIcon, CloudIcon, TargetIcon } from './Icons';
import { useTranslation } from '../hooks/useTranslation';
import { WeatherData, MarketPrice, DiseaseAlert } from '../types';

interface HomePageProps {
  season: Season;
  seasonTheme: Theme;
  isOnline: boolean;
  hasCache: boolean;
  weatherData: WeatherData | null;
  weatherTimestamp: number | null;
  diseaseAlertsData: DiseaseAlert[];
  diseaseAlertsTimestamp: number | null;
  marketPricesData: MarketPrice[];
  marketPricesTimestamp: number | null;
  onNavigateToChat: () => void;
  onNavigateToSchemes: () => void;
  onNavigateToSmartAdvisor: () => void;
  onNavigateToWeather: () => void;
  onNavigateToDisease: () => void;
  onNavigateToMarket: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
    season, seasonTheme, isOnline, hasCache,
    weatherData, weatherTimestamp,
    diseaseAlertsData, diseaseAlertsTimestamp,
    marketPricesData, marketPricesTimestamp,
    onNavigateToChat, onNavigateToSchemes, onNavigateToSmartAdvisor, 
    onNavigateToWeather, onNavigateToDisease, onNavigateToMarket 
}) => {
    const { t } = useTranslation();
    const [marketPriceIndex, setMarketPriceIndex] = useState(0);

    // Effect for Market Price Carousel
    useEffect(() => {
        if (marketPricesData.length === 0) return;
        const interval = setInterval(() => {
            setMarketPriceIndex(prevIndex => (prevIndex + 1) % marketPricesData.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [marketPricesData]);
    
    const getWeatherIcon = (condition: string | undefined) => {
        switch (condition) {
            case 'Rainy': return <RainIcon />;
            case 'Cloudy': return <CloudIcon />;
            case 'Clear':
            default: return <SunIcon />;
        }
    };
    
    if (!isOnline && !hasCache) {
        return (
            <div className="pb-20 md:pb-4 text-center">
                 <OfflineBadge />
                 <div className="mt-8 p-6 bg-white/60 dark:bg-gray-800/60 rounded-2xl">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{t('welcome_back')}</h2>
                    <p className={`${seasonTheme.textMuted}`}>{t('no_cached_data_prompt')}</p>
                 </div>
            </div>
        );
    }

    const currentMarketPrice = marketPricesData[marketPriceIndex];
    const mediumRiskAlert = diseaseAlertsData.find(a => a.risk === 'yellow') || diseaseAlertsData[0];

    return (
        <div className="pb-20 md:pb-4">
            {!isOnline && <OfflineBadge />}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4">
                <div 
                    className="relative col-span-1 md:col-span-2 p-4 rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg bg-white/60 dark:bg-gray-800/60 flex flex-col justify-between"
                    onClick={onNavigateToWeather}
                >
                    {weatherData ? (
                        <>
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{t('weather_report_title')}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('weather_location')}</p>
                                </div>
                                <div className={seasonTheme.text}>
                                    {getWeatherIcon(weatherData.condition)}
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">{weatherData.temperature}°C</p>
                                <p className="font-semibold text-gray-600 dark:text-gray-300">{t(`weather_condition_${weatherData.condition.toLowerCase()}`)}</p>
                            </div>
                            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 grid grid-cols-3 gap-2">
                                <span>{t('weather_feels_like')}: {weatherData.feelsLike}°C</span>
                                <span>{t('weather_humidity')}: {weatherData.humidity}%</span>
                                <span>{t('weather_wind')}: {weatherData.wind} km/h</span>
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-8">{t('loading')}</div>
                    )}
                    <LastUpdatedLabel timestamp={weatherTimestamp} />
                </div>

                <FeatureCard
                    icon={<BotIcon />}
                    title={t('ai_advisor_title')}
                    preview={t('ai_advisor_preview')}
                    onClick={onNavigateToChat}
                    isHighlighted={true}
                    seasonTheme={seasonTheme}
                />
                <FeatureCard
                    icon={<TargetIcon />}
                    title={t('smart_advisor_quiz_title')}
                    preview={t('smart_advisor_quiz_preview')}
                    onClick={onNavigateToSmartAdvisor}
                    isHighlighted={true}
                    seasonTheme={seasonTheme}
                />
                
                <FeatureCard
                    icon={<AlertIcon />}
                    title={t('disease_alerts_title')}
                    preview={mediumRiskAlert ? t(mediumRiskAlert.nameKey) : t('loading')}
                    seasonTheme={seasonTheme}
                    alertLevel={mediumRiskAlert?.risk}
                    onClick={onNavigateToDisease}
                    timestamp={diseaseAlertsTimestamp}
                />
                
                <FeatureCard
                    icon={<MarketIcon />}
                    title={t('market_prices_title')}
                    preview={currentMarketPrice ? `${t(currentMarketPrice.cropKey)}: ${currentMarketPrice.price}` : t('loading')}
                    seasonTheme={seasonTheme}
                    onClick={onNavigateToMarket}
                    timestamp={marketPricesTimestamp}
                />

                <div className="col-span-1 md:col-span-2">
                    <FeatureCard
                        icon={<SchemeIcon />}
                        title={t('govt_schemes_title')}
                        preview={t('govt_schemes_preview_long')}
                        seasonTheme={seasonTheme}
                        onClick={onNavigateToSchemes}
                    />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
