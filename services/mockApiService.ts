import { WeatherData, MarketPrice, DiseaseAlert, GovScheme } from '../types';

const networkDelay = (ms = 500) => new Promise(res => setTimeout(res, ms));

export const fetchWeather = async (t: (key: string) => string): Promise<WeatherData> => {
    await networkDelay();
    return {
        temperature: 28,
        condition: 'Clear',
        feelsLike: 32,
        humidity: 75,
        wind: 12,
    };
};

export const fetchAlerts = async (t: (key: string) => string): Promise<DiseaseAlert[]> => {
    await networkDelay();
    return [
        { nameKey: 'disease_mildew_name', risk: 'yellow', levelKey: 'alert_level_medium', cropsKey: 'disease_mildew_crops', descriptionKey: 'disease_mildew_desc', measuresKey: 'disease_mildew_measures' },
        { nameKey: 'disease_blast_name', risk: 'red', levelKey: 'alert_level_high', cropsKey: 'disease_blast_crops', descriptionKey: 'disease_blast_desc', measuresKey: 'disease_blast_measures' },
        { nameKey: 'disease_aphids_name', risk: 'green', levelKey: 'alert_level_low', cropsKey: 'disease_aphids_crops', descriptionKey: 'disease_aphids_desc', measuresKey: 'disease_aphids_measures' },
    ];
};

export const fetchMarketPrices = async (t: (key: string) => string): Promise<MarketPrice[]> => {
    await networkDelay();
    return [
      { cropKey: 'market_crop_wheat', price: '₹2,250/qtl' },
      { cropKey: 'market_crop_paddy', price: '₹1,980/qtl' },
      { cropKey: 'market_crop_tomato', price: '₹3,500/qtl' },
      { cropKey: 'market_crop_potato', price: '₹2,500/qtl' },
      { cropKey: 'market_crop_onion', price: '₹2,800/qtl' },
      { cropKey: 'market_crop_soybean', price: '₹4,500/qtl' },
      { cropKey: 'market_crop_cotton', price: '₹7,500/qtl' },
      { cropKey: 'market_crop_maize', price: '₹2,100/qtl' },
      { cropKey: 'market_crop_sugarcane', price: '₹350/qtl' },
      { cropKey: 'market_crop_mustard', price: '₹5,400/qtl' },
      { cropKey: 'market_crop_gram', price: '₹4,800/qtl' },
    ];
};

export const fetchSchemes = async (t: (key: string) => string): Promise<GovScheme[]> => {
    await networkDelay();
    return [
        { name: t('agri_dept_name'), description: t('agri_dept_desc'), url: 'https://agriwelfare.gov.in/' },
        { name: t('farmers_portal_name'), description: t('farmers_portal_desc'), url: 'https://www.india.gov.in/farmers-portal' },
        { name: t('mkisan_portal_name'), description: t('mkisan_portal_desc'), url: 'https://mkisan.gov.in/' },
        { name: t('enam_portal_name'), description: t('enam_portal_desc'), url: 'https://www.enam.gov.in/web/' },
        { name: t('epashu_portal_name'), description: t('epashu_portal_desc'), url: 'https://epashuhaat.gov.in/' },
        { name: t('pmfby_portal_name'), description: t('pmfby_portal_desc'), url: 'https://pmfby.gov.in/' },
    ];
};
