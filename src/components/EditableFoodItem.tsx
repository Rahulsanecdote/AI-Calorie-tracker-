import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Shuffle } from 'lucide-react';
import { FoodItem } from '../types';

interface EditableFoodItemProps {
  item: FoodItem;
  onUpdateWeight: (newWeight: number) => void;
  accentColor: string;
  onSwapFood?: (itemId: string) => void;
}

export default function EditableFoodItem({ 
  item, 
  onUpdateWeight, 
  accentColor,
  onSwapFood 
}: EditableFoodItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [weightInput, setWeightInput] = useState(item.weightGrams.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleWeightSubmit = () => {
    const newWeight = parseInt(weightInput);
    if (!isNaN(newWeight) && newWeight > 0 && newWeight !== item.weightGrams) {
      onUpdateWeight(newWeight);
    } else {
      setWeightInput(item.weightGrams.toString());
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleWeightSubmit();
    } else if (e.key === 'Escape') {
      setWeightInput(item.weightGrams.toString());
      setIsEditing(false);
    }
  };

  const handleWeightClick = () => {
    setIsEditing(true);
  };

  const formatNumber = (num: number) => {
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  return (
    <div className="bg-white/80 rounded-xl p-3 border border-white/50 hover:border-white/70 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Food Emoji */}
          <span className="text-xl">{item.emoji}</span>
          
          {/* Food Name */}
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{item.name}</h4>
          </div>
          
          {/* Weight */}
          <div className="flex items-center gap-1">
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                onBlur={handleWeightSubmit}
                onKeyDown={handleKeyPress}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="1000"
              />
            ) : (
              <button
                onClick={handleWeightClick}
                className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Click to edit weight"
              >
                <span className="text-sm font-medium text-gray-700">
                  {formatNumber(item.weightGrams)}g
                </span>
                <Edit2 className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nutrition Info */}
      <div className="mt-2 flex items-center justify-between">
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{formatNumber(item.calories)}</div>
            <div className="text-gray-500">cal</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">{formatNumber(item.protein)}g</div>
            <div className="text-gray-500">protein</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-amber-600">{formatNumber(item.carbs)}g</div>
            <div className="text-gray-500">carbs</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{formatNumber(item.fat)}g</div>
            <div className="text-gray-500">fat</div>
          </div>
        </div>

        {/* Swap Food Button */}
        {onSwapFood && (
          <button
            onClick={() => onSwapFood(item.id)}
            className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
            title="Swap food"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Micronutrients */}
      {item.micronutrients && item.micronutrients.fiber && (
        <div className="mt-2 text-xs text-gray-500">
          Fiber: {formatNumber(item.micronutrients.fiber)}g
        </div>
      )}
    </div>
  );
}
