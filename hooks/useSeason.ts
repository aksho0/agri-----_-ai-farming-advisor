import { useState, useEffect } from 'react';

export type Season = 'Kharif' | 'Rabi' | 'Zaid';

export interface Theme {
  background: string;
  primaryBg: string;
  secondaryBg: string;
  text: string;
  textMuted: string;
  ring: string;
}

const themes: Record<Season, { light: Theme, dark: Theme }> = {
  Kharif: { // Monsoon Season: Jun-Sep
    light: {
      background: 'bg-gradient-to-br from-green-50 to-gray-100',
      primaryBg: 'bg-green-600',
      secondaryBg: 'bg-gray-600',
      text: 'text-green-800',
      textMuted: 'text-gray-500',
      ring: 'ring-green-500',
    },
    dark: {
      background: 'bg-gradient-to-br from-gray-900 to-green-900',
      primaryBg: 'bg-green-500',
      secondaryBg: 'bg-gray-500',
      text: 'text-green-300',
      textMuted: 'text-gray-400',
      ring: 'ring-green-400',
    },
  },
  Rabi: { // Winter Season: Oct-Mar
    light: {
      background: 'bg-gradient-to-br from-blue-50 to-white',
      primaryBg: 'bg-blue-600',
      secondaryBg: 'bg-sky-500',
      text: 'text-blue-800',
      textMuted: 'text-gray-500',
      ring: 'ring-blue-500',
    },
    dark: {
      background: 'bg-gradient-to-br from-gray-900 to-blue-900',
      primaryBg: 'bg-blue-500',
      secondaryBg: 'bg-sky-500',
      text: 'text-blue-300',
      textMuted: 'text-gray-400',
      ring: 'ring-blue-400',
    },
  },
  Zaid: { // Summer Season: Apr-May
    light: {
      background: 'bg-gradient-to-br from-yellow-50 to-orange-100',
      primaryBg: 'bg-orange-500',
      secondaryBg: 'bg-yellow-500',
      text: 'text-orange-800',
      textMuted: 'text-gray-500',
      ring: 'ring-orange-500',
    },
    dark: {
      background: 'bg-gradient-to-br from-gray-900 to-yellow-900',
      primaryBg: 'bg-orange-500',
      secondaryBg: 'bg-yellow-500',
      text: 'text-orange-300',
      textMuted: 'text-gray-400',
      ring: 'ring-orange-400',
    },
  },
};

const getSeason = (date: Date): Season => {
  const month = date.getMonth(); // 0-11
  if (month >= 5 && month <= 8) { // June to September
    return 'Kharif';
  }
  if (month >= 3 && month <= 4) { // April to May
    return 'Zaid';
  }
  return 'Rabi'; // October to March
};

export const useSeason = (theme: 'light' | 'dark') => {
  const [season, setSeason] = useState<Season>(getSeason(new Date()));

  useEffect(() => {
    // This could be enhanced to update if the app is open for a long time
    setSeason(getSeason(new Date()));
  }, []);
  
  const themeClasses = themes[season][theme];

  return { season, themeClasses };
};