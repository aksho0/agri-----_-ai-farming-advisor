import React, { useState, useMemo } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { MarketPrice } from '../types';
import LastUpdatedLabel from './LastUpdatedLabel';

interface MarketPricesPageProps {
  seasonTheme: Theme;
  prices: MarketPrice[];
  lastUpdated: number | null;
}

const MarketPricesPage: React.FC<MarketPricesPageProps> = ({ seasonTheme, prices, lastUpdated }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  const formattedPrices = useMemo(() => {
    return prices.map(item => {
        // Assuming price is like '₹2,250/qtl', we need to parse the number
        const numericPrice = parseFloat(item.price.replace(/[₹,A-Za-z/]/g, ''));
        return {
            ...item, 
            crop: t(item.cropKey),
            numericPrice: isNaN(numericPrice) ? 0 : numericPrice,
        }
    });
  }, [prices, t]);


  const filteredPrices = useMemo(() => {
    if (!searchTerm) return formattedPrices;
    return formattedPrices.filter(item => 
        item.crop.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, formattedPrices]);

  return (
    <div className="pb-20 md:pb-4 space-y-6">
        <div className="flex justify-between items-center text-center md:text-left">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('market_prices_page_title')}</h2>
                <p className={`${seasonTheme.textMuted}`}>{t('weather_location')}</p>
            </div>
            <LastUpdatedLabel timestamp={lastUpdated} isCompact={true} />
        </div>

        <div className="relative">
            <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_crop_placeholder')}
                className={`w-full p-4 pl-10 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-50 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 ${seasonTheme.ring} focus:border-transparent transition-all duration-300 shadow-sm dark:placeholder-gray-400`}
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
            </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-800/60 rounded-2xl shadow-md overflow-hidden">
            {prices.length === 0 ? (
                <p className="p-6 text-center text-gray-500 dark:text-gray-400">{t('loading')}</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-black/5 dark:bg-white/5">
                            <tr>
                                <th className="p-4 font-bold text-gray-700 dark:text-gray-200">{t('crop')}</th>
                                <th className="p-4 font-bold text-gray-700 dark:text-gray-200 text-right">{t('price_per_quintal')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPrices.map((item) => (
                                 <tr key={item.cropKey} className="border-t border-black/10 dark:border-white/10">
                                    <td className="p-4 font-medium text-gray-800 dark:text-gray-100">{item.crop}</td>
                                    <td className={`p-4 font-bold text-right ${seasonTheme.text}`}>{item.price}</td>
                                 </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredPrices.length === 0 && (
                    <p className="p-6 text-center text-gray-500 dark:text-gray-400">No crops found matching your search.</p>
                 )}
              </>
            )}
        </div>
    </div>
  );
};

export default MarketPricesPage;
