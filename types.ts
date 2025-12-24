
export type Severity = 'Danger' | 'Warning' | 'Safe' | 'Info';
export type AppTab = 'home' | 'safety' | 'assistant' | 'health' | 'analysis';
export type AccentColor = 'blue' | 'emerald' | 'purple' | 'orange' | 'rose';
export type Mood = 'Reflective' | 'Energetic' | 'Stressed' | 'Calm';

export interface ChatPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: ChatPart[];
  groundingLinks?: { title: string; uri: string }[];
}

export interface SafetyPin {
  id: string;
  name: string;
  description: string;
  coordinates: { x: number; y: number };
  severity: Severity;
  riskType: string;
  measures: string[];
  contact: string;
}

export interface CampusPath {
  id: string;
  name: string;
  type: 'Pedestrian' | 'Cycle' | 'Vehicle';
  status: 'Well-lit' | 'Dimly-lit' | 'Busy' | 'Quiet';
  riskLevel: 'Low' | 'Moderate' | 'High';
  points: [number, number][]; // [lat, lng]
}

export interface WeatherData {
  condition: string;
  temp: number;
  humidity: number;
  windSpeed: number;
  isNight: boolean;
  lastUpdated?: number;
}

export interface MessItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  junkScore: number; // Scale 0-10
  timestamp?: number;
}

export interface UserStats {
  dailyCalories: number;
  calorieLimit: number;
  activeSafetyRisks: number;
}
