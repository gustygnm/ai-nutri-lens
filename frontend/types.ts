export enum NutriGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D'
}

export interface NutritionFacts {
  calories: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
  protein: number;
  fiber: number;
}

export interface BilingualText {
  en: string;
  id: string;
}

export enum ScanMode {
  NORMAL = 'normal',
  DIET = 'diet',
  DIABETES = 'diabetes',
  PREGNANCY = 'pregnancy',
  BREASTFEEDING = 'breastfeeding',
  KIDS = 'kids',
  HYPERTENSION = 'hypertension',
  FITNESS = 'fitness'
}

export interface ScanResult {
  id: string;
  timestamp: number;
  productName: BilingualText | string; // string for backward compatibility
  grade: NutriGrade;
  facts: NutritionFacts;
  reasoning: BilingualText | string; // string for backward compatibility
  whyThisGrade?: BilingualText; // Detailed reason based on mode
  recommendation?: BilingualText; // Actionable advice based on mode
  mode?: ScanMode; // The mode used during scan
  imageUrl: string;
}

export enum PosterTheme {
  Midnight = 'Midnight',
  Cyber = 'Cyber',
  Cream = 'Cream',
  Lavender = 'Lavender'
}

export enum SortOption {
  Newest = 'Newest',
  Oldest = 'Oldest',
  BestGrade = 'Best Grade',
  WorstGrade = 'Worst Grade'
}

export enum AppTheme {
  System = 'system',
  Light = 'light',
  Dark = 'dark'
}

export enum AppLanguage {
  ID = 'id',
  EN = 'en'
}
