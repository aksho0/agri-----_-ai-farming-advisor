// Fix: Populate the types file with necessary type definitions.
export enum Language {
  EN = 'en',
  HI = 'hi',
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  imagePreview?: string;
  originalQuery?: string;
}

export enum InputMode {
  TEXT = 'text',
  VOICE = 'voice',
}

export type View =
  | 'home'
  | 'chat'
  | 'schemes'
  | 'farm'
  | 'settings'
  | 'weather'
  | 'disease'
  | 'market'
  | 'smart-advisor'
  | 'crop-analysis';
  
export interface FarmTask {
  id: string;
  type: 'irrigation' | 'fertilizer' | 'soil_preparation' | 'sowing' | 'weeding' | 'harvesting';
  name: string;
  dueDate: string; // ISO string date
  isCompleted: boolean;
}

export type SoilType = 'Clay' | 'Sandy' | 'Loamy' | 'Other';

export interface Crop {
  id: string;
  name: string;
  nameKey?: string; // Key for translation, for predefined crops
  plantingDate: string;
  harvestDate?: string;
  area: number;
  soilType: SoilType;
  tasks: FarmTask[];
}

export interface Notification {
  id: string;
  type: 'disease' | 'weather' | 'task';
  titleKey: string;
  messageKey: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  feelsLike: number;
  humidity: number;
  wind: number;
}

export interface MarketPrice {
  cropKey: string;
  price: string;
}

export interface DiseaseAlert {
  nameKey: string;
  risk: 'red' | 'yellow' | 'green';
  levelKey: string;
  cropsKey: string;
  descriptionKey: string;
  measuresKey: string;
}

export interface GovScheme {
  name: string;
  description: string;
  url: string;
}

export interface User {
  name: string;
  email: string;
  profilePicture?: string;
}