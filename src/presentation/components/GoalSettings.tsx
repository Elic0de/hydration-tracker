'use client';

import { useState } from 'react';

interface GoalSettingsProps {
  currentGoal: number;
  onGoalUpdate: (newGoal: number) => void;
  isLoading?: boolean;
}

const PRESET_GOALS = [
  { value: 1500, label: '1.5L', description: '軽い活動', emoji: '🌱' },
  { value: 2000, label: '2.0L', description: '標準', emoji: '💧' },
  { value: 2500, label: '2.5L', description: '活発', emoji: '🏃' },
  { value: 3000, label: '3.0L', description: '高強度', emoji: '💪' },
];

export default function GoalSettings({ currentGoal, onGoalUpdate, isLoading = false }: GoalSettingsProps) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customGoal, setCustomGoal] = useState<string>(currentGoal.toString());
  const [isExpanded, setIsExpanded] = useState(false);

  const handlePresetGoal = (goal: number) => {
    onGoalUpdate(goal);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goal = parseInt(customGoal);
    if (goal > 0 && goal <= 10000) {
      onGoalUpdate(goal);
      setIsCustomMode(false);
    }
  };

  const getCurrentGoalLabel = () => {
    const preset = PRESET_GOALS.find(g => g.value === currentGoal);
    return preset ? `${preset.emoji} ${preset.label}` : `🎯 ${currentGoal}ml`;
  };

  return (
    <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-lg p-6 border border-amber-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">🎯</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">目標設定</h3>
            <p className="text-sm text-gray-500">{getCurrentGoalLabel()}</p>
          </div>
        </div>
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* 詳細設定 */}
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* プリセット目標 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">おすすめ目標</p>
            <div className="grid grid-cols-2 gap-3">
              {PRESET_GOALS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetGoal(preset.value)}
                  disabled={isLoading}
                  className={`p-4 rounded-2xl text-left transition-all duration-200 ${
                    currentGoal === preset.value
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-amber-300'
                  } disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{preset.emoji}</span>
                    <span className="font-bold">{preset.label}</span>
                  </div>
                  <p className="text-xs opacity-90">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* カスタム目標 */}
          <div className="border-t pt-4">
            {!isCustomMode ? (
              <button
                onClick={() => setIsCustomMode(true)}
                className="w-full bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-2xl p-4 border-2 border-dashed border-gray-300 transition-all duration-200"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">⚙️</div>
                  <div className="font-medium text-sm">カスタム目標</div>
                  <div className="text-xs text-gray-500">自由に設定</div>
                </div>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="space-y-3">
                <p className="text-sm font-medium text-gray-700">カスタム目標を設定</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={customGoal}
                      onChange={(e) => setCustomGoal(e.target.value)}
                      min="500"
                      max="10000"
                      step="100"
                      placeholder="例: 2200"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 text-center text-lg font-medium"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1 text-center">500ml - 10,000ml</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      設定
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomMode(false);
                        setCustomGoal(currentGoal.toString());
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl transition-all duration-200"
                    >
                      戻る
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* 目標のヒント */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-xl mr-2">💡</div>
              <div>
                <p className="text-sm font-medium text-amber-800 mb-1">目標設定のコツ</p>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• 一般成人：1日2L（8杯）が目安</li>
                  <li>• 運動時：+500ml〜1L追加</li>
                  <li>• 暑い日：普段より多めに設定</li>
                  <li>• 体重×30mlも一つの目安</li>
                </ul>
              </div>
            </div>
          </div>

          {isLoading && (
            <div className="text-center text-amber-600 font-medium animate-pulse">
              🎯 目標を更新中...
            </div>
          )}
        </div>
      )}
    </div>
  );
}