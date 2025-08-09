'use client';

import { HydrationRecord } from '@/domain/entities/HydrationRecord';

interface HydrationHistoryProps {
  records: HydrationRecord[];
}

export default function HydrationHistory({ records }: HydrationHistoryProps) {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 最新の10件のみ表示
  const recentRecords = records
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 10);

  const getRecordEmoji = (note: string | undefined, amount: number) => {
    if (note?.includes('ひと口')) return '🥤';
    if (note?.includes('コップ半分')) return '🥛';
    if (note?.includes('コップ一杯')) return '☕';
    if (note?.includes('マグカップ')) return '🧊';
    if (note?.includes('ペットボトル小')) return '💧';
    if (note?.includes('ペットボトル大')) return '🍶';
    return '💧';
  };

  if (records.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">記録履歴</h3>
          <p className="text-gray-500">まだ記録がありません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-center mb-6">
        <div className="text-2xl mr-2">📋</div>
        <h3 className="text-lg font-semibold text-gray-800">最近の記録</h3>
      </div>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {recentRecords.map((record, index) => {
          const isToday = record.timestamp.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={record.id.value}
              className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-200 ${
                isToday 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' 
                  : 'bg-white border border-gray-200'
              } ${index === 0 ? 'shadow-md' : 'shadow-sm'}`}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getRecordEmoji(record.note, record.amount)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">
                      {record.amount}ml
                    </span>
                    {record.note && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {record.note}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isToday ? '今日' : record.timestamp.toLocaleDateString('ja-JP', { 
                      month: 'short', 
                      day: 'numeric' 
                    })} • {formatTime(record.timestamp)}
                  </div>
                </div>
              </div>
              
              {index === 0 && (
                <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                  最新
                </div>
              )}
            </div>
          );
        })}
      </div>

      {records.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            最新10件を表示中（全{records.length}件）
          </p>
        </div>
      )}
    </div>
  );
}