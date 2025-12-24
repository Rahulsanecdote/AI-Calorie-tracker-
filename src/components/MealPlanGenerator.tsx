import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Save, Loader2, ChefHat, Plus, Package, Target } from 'lucide-react';
import { DailyMealPlan, MealPlanGenerationRequest, UserSettings, PantryInputData } from '../types';
import MealSectionCard from './MealSectionCard';
import TemplateModal from './TemplateModal';
import PantryInput from './PantryInput';

interface MealPlanGeneratorProps {
  settings: UserSettings;
  currentPlan: DailyMealPlan | null;
  templates: any[];
  userPantry?: any;
  isGenerating: boolean;
  error: string | null;
  onGeneratePlan: (request: MealPlanGenerationRequest) => Promise<void>;
  onGeneratePlanFromPantry: (pantryData: PantryInputData) => Promise<void>;
  onSavePantry: (pantryData: PantryInputData, saveAsDefault: boolean) => void;
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
  userPantry,
  isGenerating,
  error,
  onGeneratePlan,
  onGeneratePlanFromPantry,
  onSavePantry,
  onRegeneratePlan,
  onSaveTemplate,
  onLoadTemplate,
  onClearPlan,
  onUpdateFoodItem,
  onAddMealToLog,
}: MealPlanGeneratorProps) {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showPantryInput, setShowPantryInput] = useState(false);

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
    console.log('🚀🚀 handleGeneratePlan called (AI Suggestions)');
    console.log('📊 Settings:', {
      apiKey: settings.apiKey ? 'Present' : 'Missing',
      dailyCalorieGoal: settings.dailyCalorieGoal,
      goal: settings.goal
    });
    
    const request: MealPlanGenerationRequest = {
      targetCalories: settings.dailyCalorieGoal,
      goal: settings.goal || 'maintain',
      activityLevel: settings.activityLevel || 'moderately_active',
      dietaryPreferences: settings.dietaryPreferences || [],
    };
    
    console.log('📝 Request object:', request);
    console.log('📡 Calling onGeneratePlan (AI Suggestions)...');
    await onGeneratePlan(request);
  };

  const handleGeneratePlanFromPantry = async (pantryData: PantryInputData) => {
    console.log('🍳 handleGeneratePlanFromPantry called with:', pantryData);
    await onGeneratePlanFromPantry(pantryData);
    setShowPantryInput(false);
  };

  const handleSavePantry = (pantryData: PantryInputData, saveAsDefault: boolean) => {
    onSavePantry(pantryData, saveAsDefault);
  };

  const calculateAccuracy = () => {
    if (!currentPlan || !currentPlan.accuracyVariance) return null;
    
    const variance = currentPlan.accuracyVariance;
    const accuracy = Math.max(0, 100 - (variance / settings.dailyCalorieGoal) * 100);
    const isAccurate = variance <= 20;
    
    return {
      variance,
      accuracy: Math.round(accuracy),
      isAccurate,
      status: isAccurate ? 'excellent' : variance <= 50 ? 'good' : 'poor'
    };
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
            Get personalized daily meal recommendations. Choose between AI-generated suggestions 
            or plans using only foods you have available.
          </p>

          {settings.apiKey ? (
            <div className="space-y-4">
              {/* Pantry-Based Planning */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-semibold text-emerald-800">Plan from My Pantry</h3>
                </div>
                <p className="text-sm text-emerald-700 mb-3">
                  Enter foods you have available and get a precise plan using only those ingredients
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🥘🥘🥘 Pantry button clicked! Opening modal...');
                    setShowPantryInput(true);
                  }}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all font-medium disabled:opacity-50"
                >
                  <Package className="w-4 h-4" />
                  Plan from Available Foods
                </button>
              </div>

              {/* Generic Planning */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-800">AI-Generated Suggestions</h3>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Get meal suggestions based on your goals and preferences
                </p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('✨✨✨ AI Suggestions button clicked! Generating plan...');
                    handleGeneratePlan();
                  }}
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all font-medium disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Suggestions
                </button>
              </div>
            </div>
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
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-amber-500" />
            Today's Smart Plan
            {currentPlan.sourceType === 'pantry_based' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                <Package className="w-3 h-3" />
                From Pantry
              </span>
            )}
          </h2>
          {currentPlan.summary && (
            <p className="text-sm text-gray-600 mt-1">{currentPlan.summary}</p>
          )}
          
          {/* Accuracy Indicator */}
          {(() => {
            const accuracy = calculateAccuracy();
            if (!accuracy) return null;
            
            return (
              <div className="flex items-center gap-2 mt-2">
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  accuracy.status === 'excellent' ? 'bg-green-100 text-green-700' :
                  accuracy.status === 'good' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Target className="w-3 h-3" />
                  {accuracy.isAccurate ? (
                    <>
                      ✓ {accuracy.accuracy}% accurate ({dailyTotals.calories} / {settings.dailyCalorieGoal} cal)
                    </>
                  ) : (
                    <>
                      ⚠ {accuracy.variance} cal variance ({dailyTotals.calories} / {settings.dailyCalorieGoal} cal)
                    </>
                  )}
                </div>
                {currentPlan.regenerationCount && currentPlan.regenerationCount > 1 && (
                  <span className="text-xs text-gray-500">
                    (Generated in {currentPlan.regenerationCount} attempts)
                  </span>
                )}
              </div>
            );
          })()}
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

      {/* Pantry Input Modal */}
      <PantryInput
        isOpen={showPantryInput}
        onClose={() => setShowPantryInput(false)}
        initialData={userPantry ? {
          breakfast: userPantry.breakfast,
          lunch: userPantry.lunch,
          dinner: userPantry.dinner,
          snacks: userPantry.snacks,
        } : undefined}
        onSave={handleSavePantry}
        onGeneratePlan={handleGeneratePlanFromPantry}
      />
    </div>
  );
}
