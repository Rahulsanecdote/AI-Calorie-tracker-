import React, { useState } from 'react';
import { Plus, Edit2, Sparkles, Clock } from 'lucide-react';
import { MealSection, FoodItem } from '../types';
import EditableFoodItem from './EditableFoodItem';

interface MealSectionCardProps {
  meal: MealSection;
  onAddToLog: () => void;
  onUpdateFoodItem?: (itemId: string, newWeight: number) => void;
}

const mealColors = {
  breakfast: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-600',
    icon: '🌅'
  },
  lunch: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    accent: 'text-green-600',
    icon: '☀️'
  },
  dinner: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    accent: 'text-indigo-600',
    icon: '🌙'
  },
  snack: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    accent: 'text-pink-600',
    icon: '🍿'
  }
};

export default function MealSectionCard({ meal, onAddToLog, onUpdateFoodItem }: MealSectionCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const colors = mealColors[meal.type];

  const handleUpdateFoodItem = (itemId: string, newWeight: number) => {
    if (onUpdateFoodItem) {
      onUpdateFoodItem(itemId, newWeight);
    }
  };

  const getTimeEstimate = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '7:00 AM';
      case 'lunch': return '12:00 PM';
      case 'dinner': return '6:00 PM';
      case 'snack': return '3:00 PM';
      default: return '';
    }
  };

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-2xl p-4 transition-all hover:shadow-sm`}>
      {/* Meal Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{colors.icon}</span>
          <div>
            <h3 className={`font-semibold ${colors.accent} capitalize`}>
              {meal.type}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{getTimeEstimate(meal.type)}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{meal.totalCalories}</div>
            <div className="text-xs text-gray-500">calories</div>
          </div>
          <button
            onClick={onAddToLog}
            className={`${colors.accent} hover:bg-white/50 p-2 rounded-lg transition-colors`}
            title="Add all to log"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Food Items */}
      <div className="space-y-3">
        {meal.items.map((item) => (
          <EditableFoodItem
            key={item.id}
            item={item}
            onUpdateWeight={(newWeight) => handleUpdateFoodItem(item.id, newWeight)}
            accentColor={colors.accent}
          />
        ))}
      </div>

      {/* Meal Macros Summary */}
      <div className="mt-4 pt-3 border-t border-white/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm font-semibold text-gray-900">{Math.round(meal.totalProtein)}g</div>
            <div className="text-xs text-gray-500">Protein</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{Math.round(meal.totalCarbs)}g</div>
            <div className="text-xs text-gray-500">Carbs</div>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{Math.round(meal.totalFat)}g</div>
            <div className="text-xs text-gray-500">Fat</div>
          </div>
        </div>
      </div>
    </div>
  );
}
