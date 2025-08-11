'use client';

import { useState, useEffect } from 'react';

interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high';
  climate: 'cool' | 'moderate' | 'warm' | 'hot';
  healthConditions: string[];
}

interface UserProfileSettingsProps {
  onProfileUpdate: (profile: UserProfile) => void;
}

const ACTIVITY_LEVELS = [
  { value: 'low', label: '軽度', description: 'デスクワーク中心', emoji: '💺', multiplier: 1.0 },
  { value: 'moderate', label: '普通', description: '日常的な活動', emoji: '🚶', multiplier: 1.2 },
  { value: 'high', label: '活発', description: '定期的な運動', emoji: '🏃', multiplier: 1.4 },
  { value: 'very_high', label: '非常に活発', description: 'アスリート・肉体労働', emoji: '💪', multiplier: 1.6 },
] as const;

const CLIMATE_LEVELS = [
  { value: 'cool', label: '涼しい', description: '15°C以下', emoji: '❄️', adjustment: -200 },
  { value: 'moderate', label: '普通', description: '15-25°C', emoji: '🌤️', adjustment: 0 },
  { value: 'warm', label: '暖かい', description: '25-30°C', emoji: '☀️', adjustment: 300 },
  { value: 'hot', label: '暑い', description: '30°C以上', emoji: '🔥', adjustment: 500 },
] as const;

const HEALTH_CONDITIONS = [
  { id: 'diabetes', label: '糖尿病', emoji: '🩺' },
  { id: 'hypertension', label: '高血圧', emoji: '💓' },
  { id: 'kidney', label: '腎臓疾患', emoji: '🫘' },
  { id: 'heart', label: '心疾患', emoji: '❤️' },
  { id: 'pregnancy', label: '妊娠中', emoji: '🤱' },
  { id: 'breastfeeding', label: '授乳中', emoji: '🍼' },
];

export default function UserProfileSettings({ onProfileUpdate }: UserProfileSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'ユーザー',
    age: 30,
    weight: 60,
    height: 165,
    activityLevel: 'moderate',
    climate: 'moderate',
    healthConditions: []
  });
  
  const [recommendedIntake, setRecommendedIntake] = useState(2000);

  // Load profile from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('hydration-user-profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfile(parsedProfile);
        } catch (error) {
          console.error('Failed to parse user profile:', error);
        }
      }
    }
  }, []);

  // Calculate recommended water intake based on profile
  useEffect(() => {
    const baseIntake = profile.weight * 30; // Base: 30ml per kg
    const activityMultiplier = ACTIVITY_LEVELS.find(a => a.value === profile.activityLevel)?.multiplier || 1.0;
    const climateAdjustment = CLIMATE_LEVELS.find(c => c.value === profile.climate)?.adjustment || 0;
    
    let ageAdjustment = 0;
    if (profile.age > 65) ageAdjustment = -200;
    else if (profile.age < 18) ageAdjustment = 200;

    const calculated = Math.round((baseIntake * activityMultiplier) + climateAdjustment + ageAdjustment);
    setRecommendedIntake(Math.max(1500, Math.min(4000, calculated))); // Clamp between 1.5L and 4L
  }, [profile]);

  const handleProfileChange = (updates: Partial<UserProfile>) => {
    const newProfile = { ...profile, ...updates };
    setProfile(newProfile);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('hydration-user-profile', JSON.stringify(newProfile));
    }
    
    onProfileUpdate(newProfile);
  };

  const toggleHealthCondition = (conditionId: string) => {
    const newConditions = profile.healthConditions.includes(conditionId)
      ? profile.healthConditions.filter(id => id !== conditionId)
      : [...profile.healthConditions, conditionId];
    
    handleProfileChange({ healthConditions: newConditions });
  };

  const getBMI = () => {
    const heightInM = profile.height / 100;
    return (profile.weight / (heightInM * heightInM)).toFixed(1);
  };

  const getBMICategory = () => {
    const bmi = parseFloat(getBMI());
    if (bmi < 18.5) return { category: '低体重', emoji: '⚠️', color: 'text-blue-600' };
    if (bmi < 25) return { category: '普通体重', emoji: '✅', color: 'text-green-600' };
    if (bmi < 30) return { category: '肥満(1度)', emoji: '⚠️', color: 'text-orange-600' };
    return { category: '肥満(2度以上)', emoji: '🚨', color: 'text-red-600' };
  };

  const bmiInfo = getBMI();
  const bmiCategory = getBMICategory();

  return (
    <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl shadow-lg p-6 border border-green-100">
      {/* ヘッダー */}
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <div className="text-2xl mr-3">👤</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">プロフィール設定</h3>
            <p className="text-sm text-gray-500">{profile.name} • 推奨: {recommendedIntake}ml/日</p>
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
          {/* 基本情報 */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-gray-700 border-b pb-2">基本情報</h4>
            
            {/* 名前 */}
            <div>
              <label className="text-sm font-medium text-gray-700">名前</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => handleProfileChange({ name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400"
                placeholder="お名前を入力"
              />
            </div>

            {/* 年齢、体重、身長 */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">年齢</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => handleProfileChange({ age: parseInt(e.target.value) || 0 })}
                  min="10"
                  max="120"
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 text-center"
                />
                <p className="text-xs text-gray-500 text-center mt-1">歳</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">体重</label>
                <input
                  type="number"
                  value={profile.weight}
                  onChange={(e) => handleProfileChange({ weight: parseInt(e.target.value) || 0 })}
                  min="30"
                  max="200"
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 text-center"
                />
                <p className="text-xs text-gray-500 text-center mt-1">kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">身長</label>
                <input
                  type="number"
                  value={profile.height}
                  onChange={(e) => handleProfileChange({ height: parseInt(e.target.value) || 0 })}
                  min="120"
                  max="220"
                  className="w-full mt-1 px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-400 text-center"
                />
                <p className="text-xs text-gray-500 text-center mt-1">cm</p>
              </div>
            </div>

            {/* BMI表示 */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">BMI (Body Mass Index)</p>
                  <p className="text-lg font-bold text-gray-800">{bmiInfo}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${bmiCategory.color}`}>
                    {bmiCategory.emoji} {bmiCategory.category}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 活動レベル */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">活動レベル</h4>
            <div className="grid grid-cols-2 gap-3">
              {ACTIVITY_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleProfileChange({ activityLevel: level.value })}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 ${
                    profile.activityLevel === level.value
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{level.emoji}</span>
                    <span className="font-bold text-sm">{level.label}</span>
                  </div>
                  <p className="text-xs opacity-90">{level.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 気候 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">現在の気候</h4>
            <div className="grid grid-cols-2 gap-3">
              {CLIMATE_LEVELS.map((climate) => (
                <button
                  key={climate.value}
                  onClick={() => handleProfileChange({ climate: climate.value })}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 ${
                    profile.climate === climate.value
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-lg">{climate.emoji}</span>
                    <span className="font-bold text-sm">{climate.label}</span>
                  </div>
                  <p className="text-xs opacity-90">{climate.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 健康状態 */}
          <div>
            <h4 className="text-md font-semibold text-gray-700 mb-3">健康状態 (該当するものを選択)</h4>
            <div className="grid grid-cols-2 gap-2">
              {HEALTH_CONDITIONS.map((condition) => (
                <button
                  key={condition.id}
                  onClick={() => toggleHealthCondition(condition.id)}
                  className={`p-3 rounded-xl text-center transition-all duration-200 ${
                    profile.healthConditions.includes(condition.id)
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                      : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-lg mb-1">{condition.emoji}</div>
                  <div className="text-xs font-medium">{condition.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 推奨水分量の表示 */}
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl mb-2">💧</div>
              <p className="text-sm text-green-700 font-medium mb-1">あなたの推奨水分摂取量</p>
              <p className="text-3xl font-bold text-green-800">{recommendedIntake}ml</p>
              <p className="text-sm text-green-600 mt-1">1日あたり</p>
            </div>
          </div>

          {/* 計算式の説明 */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <div className="flex items-start">
              <div className="text-xl mr-2">🧮</div>
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">計算方法</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• 基本量: 体重 × 30ml</li>
                  <li>• 活動レベル: × {ACTIVITY_LEVELS.find(a => a.value === profile.activityLevel)?.multiplier}</li>
                  <li>• 気候調整: {(CLIMATE_LEVELS.find(c => c.value === profile.climate)?.adjustment ?? 0) >= 0 ? '+' : ''}{CLIMATE_LEVELS.find(c => c.value === profile.climate)?.adjustment ?? 0}ml</li>
                  <li>• 年齢調整: {profile.age > 65 ? '-200ml (高齢者)' : profile.age < 18 ? '+200ml (成長期)' : 'なし'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}