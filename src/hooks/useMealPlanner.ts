import { useState, useCallback } from 'react';
import {
  DailyMealPlan,
  MealPlanTemplate,
  MealPlanGenerationRequest,
  MealPlanGenerationResponse,
  FoodItem,
  MealSection,
  UserSettings,
} from '../types';
import { v4 as uuidv4 } from 'uuid';

const MEAL_PLAN_STORAGE_KEY = 'meal-plans';
const TEMPLATE_STORAGE_KEY = 'meal-plan-templates';

interface UseMealPlannerResult {
  currentPlan: DailyMealPlan | null;
  templates: MealPlanTemplate[];
  isGenerating: boolean;
  error: string | null;
  generateMealPlan: (request: MealPlanGenerationRequest) => Promise<void>;
  updateFoodItem: (mealType: string, itemId: string, newWeight: number) => void;
  addMealToLog: (mealType: string) => void;
  regenerateMealPlan: () => Promise<void>;
  saveTemplate: (name: string, description?: string) => void;
  loadTemplate: (templateId: string) => void;
  deleteTemplate: (templateId: string) => void;
  clearPlan: () => void;
}

export const useMealPlanner = (
  settings: UserSettings,
  onAddMeal: (description: string, category: any) => Promise<void>
): UseMealPlannerResult => {
  const [currentPlan, setCurrentPlan] = useState<DailyMealPlan | null>(null);
  const [templates, setTemplates] = useState<MealPlanTemplate[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load stored data on mount
  useCallback(() => {
    try {
      const storedPlans = localStorage.getItem(MEAL_PLAN_STORAGE_KEY);
      const storedTemplates = localStorage.getItem(TEMPLATE_STORAGE_KEY);
      
      if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (err) {
      console.error('Error loading meal plan data:', err);
    }
  }, []);

  const calculateMacroRatio = (goal: UserSettings['goal']) => {
    switch (goal) {
      case 'weight_loss':
        return { protein: 35, carbs: 40, fat: 25 };
      case 'muscle_gain':
        return { protein: 30, carbs: 50, fat: 20 };
      case 'maintain':
      default:
        return { protein: 25, carbs: 45, fat: 30 };
    }
  };

  const parseAIResponse = (response: MealPlanGenerationResponse): DailyMealPlan => {
    const macroRatio = calculateMacroRatio(settings.goal || 'maintain');
    
    const meals: MealSection[] = response.meals.map(meal => {
      const items: FoodItem[] = meal.items.map(item => ({
        id: uuidv4(),
        name: item.name,
        weightGrams: item.weight,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        micronutrients: { fiber: item.fiber },
        emoji: item.emoji,
      }));

      const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
      const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
      const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
      const totalFat = items.reduce((sum, item) => sum + item.fat, 0);

      return {
        type: meal.type,
        items,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFat,
      };
    });

    const totalProtein = meals.reduce((sum, meal) => sum + meal.totalProtein, 0);
    const totalCarbs = meals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
    const totalFat = meals.reduce((sum, meal) => sum + meal.totalFat, 0);

    return {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      targetCalories: settings.dailyCalorieGoal,
      meals,
      totalMacros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
      macroRatio,
      summary: response.summary,
      createdAt: new Date().toISOString(),
    };
  };

  const generateMealPlan = useCallback(async (request: MealPlanGenerationRequest) => {
    if (!settings.apiKey) {
      setError('Please set your OpenAI API key in settings');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const systemPrompt = `You are an expert nutritionist and chef. Create a personalized daily meal plan based on the user's profile and goals.

Rules:
1. Always return valid JSON with no additional text
2. Use practical, commonly available foods
3. Provide exact gram weights for all food items
4. Calculate precise nutritional values per food item
5. Ensure variety across meals (different proteins, vegetables, grains)
6. Include fiber content when relevant
7. Use appropriate food emojis

Output format:
{
  "summary": "Brief description of the day's nutritional theme",
  "meals": [
    {
      "type": "breakfast",
      "items": [
        { "name": "Food Name", "weight": 100, "unit": "g", "calories": 150, "protein": 5, "carbs": 27, "fat": 3, "fiber": 4, "emoji": "🥣" }
      ]
    }
  ]
}`;

    const userPrompt = `Generate a daily meal plan for:
- Daily calorie goal: ${request.targetCalories} calories
- Goal: ${request.goal}
- Activity level: ${request.activityLevel}
- Dietary preferences: ${request.dietaryPreferences.join(', ') || 'None specified'}

Requirements:
- 3 main meals (breakfast, lunch, dinner) + optional snack
- Each meal should list 3-5 specific food items with exact gram weights
- Include macronutrient breakdown (protein/carbs/fat) for each food item
- Total daily intake should match the calorie goal within ±50 calories
- Use common, practical foods
- No recipes needed, just food items and quantities
- Consider macro ratios for the goal type

Respond with only the JSON object, no markdown formatting.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a moment.');
        } else {
          throw new Error(errorData.error?.message || 'Failed to generate meal plan');
        }
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response from AI');
      }

      // Clean up the response (remove markdown code blocks if present)
      const cleanedContent = content.replace(/```json\s*|\s*```/g, '').trim();
      
      const parsedResponse: MealPlanGenerationResponse = JSON.parse(cleanedContent);
      
      const mealPlan = parseAIResponse(parsedResponse);
      
      setCurrentPlan(mealPlan);
      
      // Save to localStorage
      const existingPlans = JSON.parse(localStorage.getItem(MEAL_PLAN_STORAGE_KEY) || '[]');
      const updatedPlans = existingPlans.filter((plan: DailyMealPlan) => plan.date !== mealPlan.date);
      updatedPlans.push(mealPlan);
      localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(updatedPlans));
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate meal plan';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [settings]);

  const updateFoodItem = useCallback((mealType: string, itemId: string, newWeight: number) => {
    if (!currentPlan) return;

    setCurrentPlan(prev => {
      if (!prev) return null;
      
      const updatedMeals = prev.meals.map(meal => {
        if (meal.type !== mealType) return meal;
        
        const updatedItems = meal.items.map(item => {
          if (item.id !== itemId) return item;
          
          const weightRatio = newWeight / item.weightGrams;
          
          return {
            ...item,
            weightGrams: newWeight,
            calories: Math.round(item.calories * weightRatio),
            protein: Math.round(item.protein * weightRatio * 10) / 10,
            carbs: Math.round(item.carbs * weightRatio * 10) / 10,
            fat: Math.round(item.fat * weightRatio * 10) / 10,
          };
        });

        // Recalculate meal totals
        const totalCalories = updatedItems.reduce((sum, item) => sum + item.calories, 0);
        const totalProtein = updatedItems.reduce((sum, item) => sum + item.protein, 0);
        const totalCarbs = updatedItems.reduce((sum, item) => sum + item.carbs, 0);
        const totalFat = updatedItems.reduce((sum, item) => sum + item.fat, 0);

        return {
          ...meal,
          items: updatedItems,
          totalCalories,
          totalProtein,
          totalCarbs,
          totalFat,
        };
      });

      // Recalculate daily totals
      const totalProtein = updatedMeals.reduce((sum, meal) => sum + meal.totalProtein, 0);
      const totalCarbs = updatedMeals.reduce((sum, meal) => sum + meal.totalCarbs, 0);
      const totalFat = updatedMeals.reduce((sum, meal) => sum + meal.totalFat, 0);

      const updatedPlan = {
        ...prev,
        meals: updatedMeals,
        totalMacros: { protein: totalProtein, carbs: totalCarbs, fat: totalFat },
      };

      // Save to localStorage
      const existingPlans = JSON.parse(localStorage.getItem(MEAL_PLAN_STORAGE_KEY) || '[]');
      const updatedPlans = existingPlans.filter((plan: DailyMealPlan) => plan.date !== updatedPlan.date);
      updatedPlans.push(updatedPlan);
      localStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(updatedPlans));

      return updatedPlan;
    });
  }, [currentPlan]);

  const addMealToLog = useCallback(async (mealType: string) => {
    if (!currentPlan) return;

    const meal = currentPlan.meals.find(m => m.type === mealType);
    if (!meal) return;

    // Add each food item to the log
    for (const item of meal.items) {
      const description = `${item.weightGrams}g ${item.name}`;
      await onAddMeal(description, mealType);
    }

    // Visual feedback could be added here
  }, [currentPlan, onAddMeal]);

  const regenerateMealPlan = useCallback(async () => {
    if (!currentPlan || !settings.apiKey) return;

    const request: MealPlanGenerationRequest = {
      targetCalories: settings.dailyCalorieGoal,
      goal: settings.goal || 'maintain',
      activityLevel: settings.activityLevel || 'moderately_active',
      dietaryPreferences: settings.dietaryPreferences || [],
      existingPlan: currentPlan,
    };

    await generateMealPlan(request);
  }, [currentPlan, settings, generateMealPlan]);

  const saveTemplate = useCallback((name: string, description?: string) => {
    if (!currentPlan) return;

    const template: MealPlanTemplate = {
      id: uuidv4(),
      name,
      description,
      plan: { ...currentPlan },
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));
  }, [currentPlan, templates]);

  const loadTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newPlan = {
      ...template.plan,
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    setCurrentPlan(newPlan);
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem(TEMPLATE_STORAGE_KEY, JSON.stringify(updatedTemplates));
  }, [templates]);

  const clearPlan = useCallback(() => {
    setCurrentPlan(null);
  }, []);

  return {
    currentPlan,
    templates,
    isGenerating,
    error,
    generateMealPlan,
    updateFoodItem,
    addMealToLog,
    regenerateMealPlan,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    clearPlan,
  };
};
