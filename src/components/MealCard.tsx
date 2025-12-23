import { Trash2, Edit2, Clock, Utensils } from 'lucide-react';
import { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
  onDelete: (id: string) => void;
  onEdit: (meal: Meal) => void;
}

const categoryIcons = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍿',
};

const categoryColors = {
  breakfast: 'bg-amber-50 text-amber-600 border-amber-200',
  lunch: 'bg-sky-50 text-sky-600 border-sky-200',
  dinner: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  snack: 'bg-pink-50 text-pink-600 border-pink-200',
};

export default function MealCard({ meal, onDelete, onEdit }: MealCardProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <div className="text-2xl">{categoryIcons[meal.category]}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{meal.foodName}</h3>
            <p className="text-sm text-gray-500 mt-1">"{meal.description}"</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(meal)}
            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit meal"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(meal.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete meal"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{formatTime(meal.timestamp)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Utensils className="w-4 h-4" />
          <span>{meal.servingSize}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
          categoryColors[meal.category]
        }`}>
          {meal.category.charAt(0).toUpperCase() + meal.category.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">{meal.nutrition.calories}</div>
          <div className="text-xs text-gray-500">calories</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-500">{meal.nutrition.protein_g}g</div>
          <div className="text-xs text-gray-500">protein</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-500">{meal.nutrition.carbs_g}g</div>
          <div className="text-xs text-gray-500">carbs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-500">{meal.nutrition.fat_g}g</div>
          <div className="text-xs text-gray-500">fat</div>
        </div>
      </div>
    </div>
  );
}
