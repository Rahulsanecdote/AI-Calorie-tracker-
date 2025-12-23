export interface NutritionInfo {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface Meal {
  id: string;
  description: string;
  foodName: string;
  servingSize: string;
  nutrition: NutritionInfo;
  timestamp: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface UserSettings {
  dailyCalorieGoal: number;
  apiKey: string;
  proteinGoal_g: number;
  carbsGoal_g: number;
  fatGoal_g: number;
}

export interface DailyTotals {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export interface AIResponse {
  foodName: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  servingSize: string;
}

export interface AppState {
  meals: Meal[];
  settings: UserSettings;
  currentDate: string;
  isLoading: boolean;
  error: string | null;
}

export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
