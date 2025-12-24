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
  // Additional user profile fields for meal planning
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  goal?: 'weight_loss' | 'maintain' | 'muscle_gain';
  dietaryPreferences?: string[]; // e.g., ['vegetarian', 'high_protein', 'low_carb']
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

// New interfaces for meal planning feature
export interface Micronutrients {
  fiber?: number;
  vitaminC?: number;
  iron?: number;
  calcium?: number;
  potassium?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  weightGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  micronutrients?: Micronutrients;
  emoji: string;
}

export interface MealSection {
  type: MealCategory;
  items: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DailyMealPlan {
  id: string;
  date: string; // YYYY-MM-DD
  targetCalories: number;
  meals: MealSection[];
  totalMacros: { protein: number; carbs: number; fat: number };
  macroRatio: { protein: number; carbs: number; fat: number }; // percentages
  summary?: string;
  createdAt: string;
}

export interface MealPlanTemplate {
  id: string;
  name: string;
  description?: string;
  plan: DailyMealPlan;
  isFavorite: boolean;
  createdAt: string;
}

export interface MealPlanGenerationRequest {
  targetCalories: number;
  goal: UserSettings['goal'];
  activityLevel: UserSettings['activityLevel'];
  dietaryPreferences: string[];
  existingPlan?: DailyMealPlan; // for regeneration
}

export interface MealPlanGenerationResponse {
  summary: string;
  meals: {
    type: MealCategory;
    items: Array<{
      name: string;
      weight: number;
      unit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number;
      emoji: string;
    }>;
  }[];
}
