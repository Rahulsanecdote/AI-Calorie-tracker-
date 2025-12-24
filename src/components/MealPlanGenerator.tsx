import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Save, Loader2, ChefHat, Plus } from 'lucide-react';
import { DailyMealPlan, MealPlanGenerationRequest, UserSettings } from '../types';
import MealSectionCard from './MealSectionCard';
import TemplateModal from './TemplateModal';

interface MealPlanGeneratorProps {
  settings: UserSettings;
  currentPlan: DailyMealPlan | null;
  templates: any[];
  isGenerating: boolean;
  error: string | null;
  onGeneratePlan: (request: MealPlanGenerationRequest) => Promise<void>;
  onRegeneratePlan: () => Promise<void>;
  onSaveTemplate: (name: string, description?: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onClearPlan: () => void;
  onUpdateFoodItem?: (mealType: string, itemId: string, newWeight: number) => void;
  onAddMealToLog?: (mealType: string) => void;
}

export default function MealPlanGenerator({
  settings,
  currentPlan,
  templates,
  isGenerating,
  error,
  onGeneratePlan,
  onRegeneratePlan,
  onSaveTemplate,
  onLoadTemplate,
  onClearPlan,
  onUpdateFoodItem,
  onAddMealToLog,
}: MealPlanGeneratorProps) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  useEffect(() => {
    // Load today's plan from localStorage if exists
    const today = new Date().toISOString().split('T')[0];
    const savedPlans = localStorage.getItem('meal-plans');
    if (savedPlans) {
      const plans = JSON.parse(savedPlans);
      const todayPlan = plans.find((plan: any) => plan.date === today);
      // Note: We can't directly set the plan here as it's handled by the hook
      // This is just to show the existing plan when component mounts
    }
  }, []);

  const handleGeneratePlan = async () => {
    const request: MealPlanGenerationRequest = {
      targetCalories: settings.dailyCalorieGoal,
      goal: settings.goal || 'maintain',
      activityLevel: settings.activityLevel || 'moderately_active',
      dietaryPreferences: settings.dietaryPreferences || [],
    };
    await onGeneratePlan(request);
  };

  const calculateDailyTotals = () => {
    if (!currentPlan) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    
    return currentPlan.meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.totalCalories,
        protein: totals.protein + meal.totalProtein,
        carbs: totals.carbs + meal.totalCarbs,
        fat: totals.fat + meal.totalFat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const dailyTotals = calculateDailyTotals();
  const calorieProgress = Math.min((dailyTotals.calories / settings.dailyCalorieGoal) * 100, 100);
  const isOverGoal = dailyTotals.calories > settings.dailyCalorieGoal;

  if (!currentPlan && !isGenerating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
            <ChefHat className="w-8 h-8 text-amber-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Smart Meal Planning
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get personalized daily meal recommendations based on your goals and preferences. 
            AI will create a complete plan with exact portions and nutritional breakdowns.
          </p>

          {settings.apiKey ? (
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5" />
              Generate My Daily Meal Plan
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-amber-800 text-sm">
                Please set your OpenAI API key in settings to use meal planning features.
              </p>
            </div>
          )}

          {templates.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">Or use a saved template:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {templates.slice(0, 3).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onLoadTemplate(template.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl mb-4">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Creating Your Meal Plan
          </h2>
          
          <p className="text-gray-600 mb-4">
            Our AI chef is designing a personalized plan based on your goals...
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-700">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-medium">
                Analyzing your nutritional needs and crafting the perfect day of meals
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <ChefHat className="w-8 h-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Oops! Chef's Having Trouble
          </h2>
          
          <p className="text-gray-600 mb-4">{error}</p>

          <div className="flex justify-center gap-3">
            <button
              onClick={handleGeneratePlan}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-500" />
            Today's Smart Plan
          </h2>
          {currentPlan.summary && (
            <p className="text-sm text-gray-600 mt-1">{currentPlan.summary}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTemplateModal(true)}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Save as template"
          >
            <Save className="w-5 h-5" />
          </button>
          <button
            onClick={onRegeneratePlan}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
            title="Regenerate plan"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={onClearPlan}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Clear plan"
          >
            <Plus className="w-5 h-5 rotate-45" />
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Daily Progress</span>
          <span className={`text-sm font-bold ${isOverGoal ? 'text-red-600' : 'text-amber-600'}`}>
            {Math.round(calorieProgress)}%
          </span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOverGoal ? 'bg-red-500' : 'bg-gradient-to-r from-amber-400 to-orange-400'
            }`}
            style={{ width: `${calorieProgress}%` }}
          />
        </div>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{dailyTotals.calories}</div>
            <div className="text-xs text-gray-600">Goal: {settings.dailyCalorieGoal}</div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-500">{Math.round(dailyTotals.protein)}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-500">{Math.round(dailyTotals.carbs)}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-500">{Math.round(dailyTotals.fat)}g</div>
            <div className="text-xs text-gray-600">Fat</div>
          </div>
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {currentPlan.meals.map((meal) => (
          <MealSectionCard
            key={meal.type}
            meal={meal}
            onAddToLog={() => onAddMealToLog?.(meal.type)}
            onUpdateFoodItem={(itemId, newWeight) => onUpdateFoodItem?.(meal.type, itemId, newWeight)}
          />
        ))}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <TemplateModal
          isOpen={showTemplateModal}
          onClose={() => setShowTemplateModal(false)}
          onSave={onSaveTemplate}
        />
      )}
    </div>
  );
}
