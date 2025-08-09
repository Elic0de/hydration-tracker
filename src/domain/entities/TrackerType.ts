export interface TrackerConfig {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  color: string;
  defaultGoal: number;
  quickOptions: QuickOption[];
}

export interface QuickOption {
  emoji: string;
  label: string;
  amount: number;
  color: string;
}

export const TRACKER_TYPES: Record<string, TrackerConfig> = {
  hydration: {
    id: 'hydration',
    name: '水分補給',
    emoji: '💧',
    unit: 'ml',
    color: 'blue',
    defaultGoal: 2000,
    quickOptions: [
      { emoji: '🥤', label: 'ひと口', amount: 30, color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
      { emoji: '🥛', label: 'コップ半分', amount: 120, color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
      { emoji: '☕', label: 'コップ一杯', amount: 250, color: 'bg-gradient-to-br from-amber-400 to-amber-500' },
      { emoji: '🧊', label: 'マグカップ', amount: 350, color: 'bg-gradient-to-br from-cyan-400 to-cyan-500' },
      { emoji: '💧', label: 'ペットボトル小', amount: 500, color: 'bg-gradient-to-br from-teal-400 to-teal-500' },
      { emoji: '🍶', label: 'ペットボトル大', amount: 750, color: 'bg-gradient-to-br from-indigo-400 to-indigo-500' },
    ]
  },
  calories: {
    id: 'calories',
    name: 'カロリー',
    emoji: '🍎',
    unit: 'kcal',
    color: 'red',
    defaultGoal: 2000,
    quickOptions: [
      { emoji: '🥕', label: '野菜', amount: 50, color: 'bg-gradient-to-br from-green-400 to-green-500' },
      { emoji: '🍎', label: '果物', amount: 80, color: 'bg-gradient-to-br from-red-400 to-red-500' },
      { emoji: '🍞', label: 'パン', amount: 150, color: 'bg-gradient-to-br from-yellow-400 to-yellow-500' },
      { emoji: '🍚', label: 'ご飯', amount: 200, color: 'bg-gradient-to-br from-orange-400 to-orange-500' },
      { emoji: '🥩', label: 'お肉', amount: 300, color: 'bg-gradient-to-br from-red-500 to-red-600' },
      { emoji: '🍕', label: 'ファストフード', amount: 500, color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
    ]
  },
  sleep: {
    id: 'sleep',
    name: '睡眠時間',
    emoji: '😴',
    unit: '時間',
    color: 'purple',
    defaultGoal: 8,
    quickOptions: [
      { emoji: '😪', label: '仮眠', amount: 0.5, color: 'bg-gradient-to-br from-gray-400 to-gray-500' },
      { emoji: '😴', label: '昼寝', amount: 1, color: 'bg-gradient-to-br from-blue-300 to-blue-400' },
      { emoji: '🌙', label: '短時間', amount: 4, color: 'bg-gradient-to-br from-indigo-400 to-indigo-500' },
      { emoji: '😊', label: '標準', amount: 6, color: 'bg-gradient-to-br from-green-400 to-green-500' },
      { emoji: '😎', label: '十分', amount: 8, color: 'bg-gradient-to-br from-emerald-400 to-emerald-500' },
      { emoji: '😌', label: 'たっぷり', amount: 10, color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
    ]
  }
};