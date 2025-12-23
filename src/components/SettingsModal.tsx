import { useState, useEffect } from 'react';
import { X, Save, Settings, Key, Target } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<UserSettings>(settings);
  const [activeTab, setActiveTab] = useState<'goals' | 'api'>('goals');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'goals'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Target className="w-4 h-4 inline mr-2" />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'api'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            API Key
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'goals' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Calorie Goal
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={localSettings.dailyCalorieGoal}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        dailyCalorieGoal: parseInt(e.target.value) || 2000,
                      })
                    }
                    className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="2000"
                    min="500"
                    max="10000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    cal
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Macronutrient Goals
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Protein Goal
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={localSettings.proteinGoal_g}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            proteinGoal_g: parseInt(e.target.value) || 150,
                          })
                        }
                        className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="150"
                        min="0"
                        max="500"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        g
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Carbs Goal
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={localSettings.carbsGoal_g}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            carbsGoal_g: parseInt(e.target.value) || 250,
                          })
                        }
                        className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="250"
                        min="0"
                        max="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        g
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Fat Goal
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={localSettings.fatGoal_g}
                        onChange={(e) =>
                          setLocalSettings({
                            ...localSettings,
                            fatGoal_g: parseInt(e.target.value) || 65,
                          })
                        }
                        className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="65"
                        min="0"
                        max="300"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        g
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  OpenAI API Key Required
                </h3>
                <p className="text-sm text-blue-600">
                  To use the AI food analysis feature, you need an OpenAI API key.
                  Your key is stored locally and never sent to our servers.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={localSettings.apiKey}
                  onChange={(e) =>
                    setLocalSettings({
                      ...localSettings,
                      apiKey: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="sk-..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-yellow-800 mb-1">
                  Cost Notice
                </h3>
                <p className="text-sm text-yellow-600">
                  API usage may incur costs. Monitor your usage at{' '}
                  <a
                    href="https://platform.openai.com/usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-700 hover:text-yellow-800"
                  >
                    platform.openai.com/usage
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
