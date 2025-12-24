import { useState, useEffect, useCallback } from 'react';
import {
  Header,
  CalorieDashboard,
  DateNavigator,
  MealInput,
  MealList,
  SettingsModal,
  EditMealModal,
  MealPlanGenerator,
} from './components';
import { useNutritionAI } from './hooks/useNutritionAI';
import { useMealPlanner } from './hooks/useMealPlanner';
import useLocalStorage from './hooks/useLocalStorage';
import {
  Meal,
  UserSettings,
  DailyTotals,
  MealCategory,
} from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'nutriai_data';

const defaultSettings: UserSettings = {
  dailyCalorieGoal: 2000,
  apiKey: '',
  proteinGoal_g: 150,
  carbsGoal_g: 250,
  fatGoal_g: 65,
  // New fields for meal planning
  age: 30,
  weight: 70,
  height: 175,
  activityLevel: 'moderately_active',
  goal: 'maintain',
  dietaryPreferences: [],
};

function App() {
  const [meals, setMeals] = useLocalStorage<Meal[]>(STORAGE_KEY, []);
  const [settings, setSettings] = useLocalStorage<UserSettings>('nutriai_settings', defaultSettings);
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const { analyzeFood, isLoading, error: hookError } = useNutritionAI();

  // Sync hook error to state
  useEffect(() => {
    if (hookError) {
      setAiError(hookError);
    }
  }, [hookError]);

  const calculateDailyTotals = useCallback((): DailyTotals => {
    const dayMeals = meals.filter((meal) => {
      const mealDate = new Date(meal.timestamp).toISOString().split('T')[0];
      return mealDate === currentDate;
    });

    return dayMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.nutrition.calories,
        protein_g: totals.protein_g + meal.nutrition.protein_g,
        carbs_g: totals.carbs_g + meal.nutrition.carbs_g,
        fat_g: totals.fat_g + meal.nutrition.fat_g,
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  }, [meals, currentDate]);

  async function handleAddMeal(description: string, category: MealCategory) {
    setAiError(null);

    const result = await analyzeFood(description, settings.apiKey);

    if (result) {
      const newMeal: Meal = {
        id: uuidv4(),
        description,
        foodName: result.foodName,
        servingSize: result.servingSize,
        nutrition: {
          calories: Math.round(result.calories),
          protein_g: Math.round(result.protein_g),
          carbs_g: Math.round(result.carbs_g),
          fat_g: Math.round(result.fat_g),
        },
        timestamp: new Date().toISOString(),
        category,
      };

      setMeals((prev) => [...prev, newMeal]);
    }
  }

  // Meal planner hook - pass the handleAddMeal function
  const {
    currentPlan,
    templates,
    userPantry,
    isGenerating,
    error: mealPlanError,
    generateMealPlan,
    generateMealPlanFromPantry,
    updateFoodItem,
    addMealToLog,
    regenerateMealPlan,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    clearPlan,
    savePantry,
  } = useMealPlanner(settings, handleAddMeal);

  const handleDeleteMeal = useCallback((id: string) => {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  }, [setMeals]);

  const handleEditMeal = useCallback((meal: Meal) => {
    setEditingMeal(meal);
  }, []);

  const handleSaveEditedMeal = useCallback((updatedMeal: Meal) => {
    setMeals((prev) =>
      prev.map((meal) => (meal.id === updatedMeal.id ? updatedMeal : meal))
    );
  }, [setMeals]);

  const handleSettingsSave = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  // Test API connectivity
  const testAPI = async () => {
    console.log('🧪 Testing API connectivity...');
    if (!settings.apiKey) {
      console.error('❌ No API key to test');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'user', content: 'Say "API test successful" and nothing else' }
          ],
          temperature: 0.1,
          max_tokens: 10,
        }),
      });

      console.log('📥 Test API response status:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ API Test successful:', data.choices[0]?.message?.content);
      } else {
        const errorData = await response.json();
        console.error('❌ API Test failed:', errorData);
      }
    } catch (error) {
      console.error('❌ API Test error:', error);
    }
  };

  const dailyTotals = calculateDailyTotals();

  const currentDayMeals = meals
    .filter((meal) => {
      const mealDate = new Date(meal.timestamp).toISOString().split('T')[0];
      return mealDate === currentDate;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <DateNavigator
          currentDate={currentDate}
          onDateChange={setCurrentDate}
        />

        <CalorieDashboard totals={dailyTotals} settings={settings} />

        {/* Debug Section - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">🔧 Debug Tools</h3>
            <div className="flex gap-2">
              <button
                onClick={testAPI}
                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
              >
                Test API
              </button>
              <span className="text-xs text-yellow-600">
                Open browser console (F12) to see debug logs
              </span>
            </div>
          </div>
        )}

        {/* Meal Plan Generator */}
        <MealPlanGenerator
          settings={settings}
          currentPlan={currentPlan}
          templates={templates}
          userPantry={userPantry}
          isGenerating={isGenerating}
          error={mealPlanError}
          onGeneratePlan={generateMealPlan}
          onGeneratePlanFromPantry={generateMealPlanFromPantry}
          onSavePantry={savePantry}
          onRegeneratePlan={regenerateMealPlan}
          onSaveTemplate={saveTemplate}
          onLoadTemplate={loadTemplate}
          onClearPlan={clearPlan}
        />

        {/* Manual Meal Input */}
        <MealInput
          onSubmit={handleAddMeal}
          isLoading={isLoading}
          error={aiError}
        />

        {/* Today's Meals List */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Today's Meals
          </h2>
          <MealList
            meals={currentDayMeals}
            onDelete={handleDeleteMeal}
            onEdit={handleEditMeal}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSettingsSave}
      />

      <EditMealModal
        isOpen={!!editingMeal}
        onClose={() => setEditingMeal(null)}
        meal={editingMeal}
        onSave={handleSaveEditedMeal}
      />

      <footer className="text-center py-6 text-sm text-gray-400">
        <p>NutriAI - AI-Powered Calorie Tracking & Meal Planning</p>
      </footer>
    </div>
  );
}

export default App;
