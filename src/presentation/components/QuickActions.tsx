'use client';

import { useState } from 'react';

interface QuickAction {
  id: string;
  amount: number;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

interface QuickActionsProps {
  onQuickRecord: (amount: number, note?: string) => void;
  isLoading?: boolean;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  { id: 'glass', amount: 200, label: 'コップ1杯', emoji: '🥤', color: 'from-blue-500 to-blue-600', description: '200ml' },
  { id: 'bottle', amount: 500, label: 'ペットボトル', emoji: '💧', color: 'from-cyan-500 to-cyan-600', description: '500ml' },
  { id: 'mug', amount: 300, label: 'マグカップ', emoji: '☕', color: 'from-amber-500 to-amber-600', description: '300ml' },
  { id: 'sports', amount: 600, label: 'スポーツドリンク', emoji: '🥤', color: 'from-green-500 to-green-600', description: '600ml' },
  { id: 'water', amount: 1000, label: '大きなボトル', emoji: '🍼', color: 'from-indigo-500 to-indigo-600', description: '1000ml' },
  { id: 'tea', amount: 250, label: 'お茶', emoji: '🍵', color: 'from-emerald-500 to-emerald-600', description: '250ml' },
];

export default function QuickActions({ onQuickRecord, isLoading = false }: QuickActionsProps) {
  const [actions, setActions] = useState<QuickAction[]>(DEFAULT_ACTIONS);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);
  const [recentActions, setRecentActions] = useState<{amount: number, timestamp: number}[]>([]);

  // Load custom actions and recent actions from localStorage
  useState(() => {
    if (typeof window !== 'undefined') {
      const savedActions = localStorage.getItem('hydration-quick-actions');
      if (savedActions) {
        try {
          setActions(JSON.parse(savedActions));
        } catch (error) {
          console.error('Failed to load quick actions:', error);
        }
      }

      const savedRecentActions = localStorage.getItem('hydration-recent-quick-actions');
      if (savedRecentActions) {
        try {
          setRecentActions(JSON.parse(savedRecentActions));
        } catch (error) {
          console.error('Failed to load recent quick actions:', error);
        }
      }
    }
  });

  const handleQuickRecord = async (action: QuickAction) => {
    await onQuickRecord(action.amount, `${action.label}で記録`);
    
    // Add to recent actions
    const newRecentAction = { amount: action.amount, timestamp: Date.now() };
    const updatedRecent = [newRecentAction, ...recentActions.slice(0, 4)]; // Keep last 5
    setRecentActions(updatedRecent);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-recent-quick-actions', JSON.stringify(updatedRecent));
    }
  };

  const saveActions = (newActions: QuickAction[]) => {
    setActions(newActions);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-quick-actions', JSON.stringify(newActions));
    }
  };

  const handleEditAction = (action: QuickAction) => {
    setEditingAction(action);
    setShowCustomizer(true);
  };

  const handleSaveAction = (updatedAction: QuickAction) => {
    const newActions = actions.map(a => a.id === updatedAction.id ? updatedAction : a);
    saveActions(newActions);
    setEditingAction(null);
    setShowCustomizer(false);
  };

  const handleAddAction = (newAction: Omit<QuickAction, 'id'>) => {
    const actionWithId = { ...newAction, id: Date.now().toString() };
    saveActions([...actions, actionWithId]);
    setShowCustomizer(false);
  };

  const handleDeleteAction = (actionId: string) => {
    const newActions = actions.filter(a => a.id !== actionId);
    saveActions(newActions);
  };

  const resetToDefaults = () => {
    saveActions(DEFAULT_ACTIONS);
    setShowCustomizer(false);
  };

  const getRecentActionsDisplay = () => {
    return recentActions
      .filter((action, index, arr) => index === arr.findIndex(a => a.amount === action.amount))
      .slice(0, 3);
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-6 border border-blue-100">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="text-2xl mr-3">⚡</div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">クイックアクション</h3>
            <p className="text-sm text-gray-500">ワンクリックで素早く記録</p>
          </div>
        </div>
        <button
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      </div>

      {/* 最近の記録からのクイックアクション */}
      {getRecentActionsDisplay().length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <span className="mr-2">🕒</span>最近の記録から
          </h4>
          <div className="grid grid-cols-3 gap-3">
            {getRecentActionsDisplay().map((recent, index) => (
              <button
                key={index}
                onClick={() => onQuickRecord(recent.amount, '最近の記録から')}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl p-3 text-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <div className="text-lg mb-1">🔄</div>
                <div className="text-sm font-medium">{recent.amount}ml</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* メインのクイックアクション */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <div key={action.id} className="relative group">
            <button
              onClick={() => handleQuickRecord(action)}
              disabled={isLoading}
              className={`w-full bg-gradient-to-r ${action.color} hover:scale-105 text-white rounded-2xl p-4 text-center transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50`}
            >
              <div className="text-2xl mb-2">{action.emoji}</div>
              <div className="font-medium text-sm mb-1">{action.label}</div>
              <div className="text-xs opacity-90">{action.description}</div>
            </button>
            
            {/* Edit button (appears on hover) */}
            {showCustomizer && (
              <button
                onClick={() => handleEditAction(action)}
                className="absolute top-1 right-1 bg-white hover:bg-gray-100 text-gray-600 rounded-lg p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* カスタマイザー */}
      {showCustomizer && (
        <div className="mt-6 p-4 bg-gray-50 rounded-2xl border border-gray-200 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-700">クイックアクションの編集</h4>
            <div className="flex gap-2">
              <button
                onClick={resetToDefaults}
                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-all duration-200"
              >
                初期値に戻す
              </button>
              <button
                onClick={() => setShowCustomizer(false)}
                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-all duration-200"
              >
                完了
              </button>
            </div>
          </div>

          {/* Add new action button */}
          <button
            onClick={() => {
              setEditingAction({
                id: 'new',
                amount: 200,
                label: '新しいアクション',
                emoji: '💧',
                color: 'from-blue-500 to-blue-600',
                description: '200ml'
              });
            }}
            className="w-full bg-white hover:bg-gray-50 border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-2xl p-4 text-center transition-all duration-200 mb-4"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="text-sm font-medium text-gray-600">新しいアクションを追加</div>
          </button>

          {/* Action list for editing */}
          <div className="grid grid-cols-1 gap-3">
            {actions.map((action) => (
              <div key={action.id} className="bg-white rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-lg mr-3">{action.emoji}</div>
                  <div>
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-gray-500">{action.amount}ml</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditAction(action)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteAction(action.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-all duration-200"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {editingAction && (
        <ActionEditorModal
          action={editingAction}
          onSave={(action) => {
            if ('id' in action && action.id !== 'new') {
              handleSaveAction(action as QuickAction);
            } else {
              const { id, ...actionWithoutId } = action as QuickAction;
              void id; // Acknowledge the destructured id is intentionally not used
              handleAddAction(actionWithoutId);
            }
          }}
          onCancel={() => {
            setEditingAction(null);
          }}
        />
      )}
    </div>
  );
}

// Action Editor Modal Component
interface ActionEditorModalProps {
  action: QuickAction;
  onSave: (action: QuickAction | Omit<QuickAction, 'id'>) => void;
  onCancel: () => void;
}

function ActionEditorModal({ action, onSave, onCancel }: ActionEditorModalProps) {
  const [formData, setFormData] = useState({
    amount: action.amount,
    label: action.label,
    emoji: action.emoji,
    color: action.color,
    description: action.description
  });

  const colorOptions = [
    { value: 'from-blue-500 to-blue-600', label: 'ブルー' },
    { value: 'from-green-500 to-green-600', label: 'グリーン' },
    { value: 'from-purple-500 to-purple-600', label: 'パープル' },
    { value: 'from-red-500 to-red-600', label: 'レッド' },
    { value: 'from-yellow-500 to-yellow-600', label: 'イエロー' },
    { value: 'from-indigo-500 to-indigo-600', label: 'インディゴ' },
    { value: 'from-pink-500 to-pink-600', label: 'ピンク' },
    { value: 'from-teal-500 to-teal-600', label: 'ティール' },
  ];

  const emojiOptions = ['💧', '🥤', '☕', '🍵', '🥛', '🍼', '🧊', '🌊', '💦', '🚰'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (action.id === 'new') {
      onSave(formData);
    } else {
      onSave({ ...action, ...formData });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          {action.id === 'new' ? 'アクションを追加' : 'アクションを編集'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ラベル</label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">量 (ml)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                amount: parseInt(e.target.value) || 0,
                description: `${parseInt(e.target.value) || 0}ml`
              }))}
              min="50"
              max="2000"
              className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">絵文字</label>
            <div className="grid grid-cols-5 gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                  className={`p-2 rounded-lg text-center transition-all duration-200 ${
                    formData.emoji === emoji
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カラー</label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`h-10 rounded-lg bg-gradient-to-r ${color.value} transition-all duration-200 ${
                    formData.color === color.value
                      ? 'ring-2 ring-offset-2 ring-blue-500'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {/* プレビュー */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">プレビュー</label>
            <div className={`bg-gradient-to-r ${formData.color} text-white rounded-2xl p-4 text-center`}>
              <div className="text-2xl mb-2">{formData.emoji}</div>
              <div className="font-medium text-sm mb-1">{formData.label}</div>
              <div className="text-xs opacity-90">{formData.description}</div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl py-3 transition-all duration-200"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl py-3 transition-all duration-200"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}