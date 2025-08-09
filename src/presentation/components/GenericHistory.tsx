'use client';

import { GenericRecord } from '@/domain/entities/GenericRecord';
import { TrackerConfig } from '@/domain/entities/TrackerType';

interface GenericHistoryProps {
  records: GenericRecord[];
  config: TrackerConfig;
}

export default function GenericHistory({ records, config }: GenericHistoryProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const recordDate = new Date(date);
    
    if (recordDate.toDateString() === today.toDateString()) {
      return '今日';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (recordDate.toDateString() === yesterday.toDateString()) {
      return '昨日';
    }
    
    return recordDate.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      case 'green':
        return 'from-green-500 to-green-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
        <div className="text-center py-8">
          <div className="text-6xl mb-4 opacity-30">{config.emoji}</div>
          <p className="text-gray-500">まだ記録がありません</p>
          <p className="text-sm text-gray-400">上のボタンで記録してみましょう</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border border-gray-100">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">記録履歴</h3>
          <div className="text-sm text-gray-500">
            {records.length}件の記録
          </div>
        </div>
        
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {records.slice(0, 20).map((record) => (
            <div
              key={record.id.value}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`bg-gradient-to-r ${getColorClasses(config.color)} text-white rounded-full px-3 py-1 text-sm font-medium`}>
                    {record.amount}{config.unit}
                  </div>
                  {record.note && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {record.note}
                    </span>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{formatDate(record.recordedAt)}</div>
                  <div className="font-mono">{formatTime(record.recordedAt)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {records.length > 20 && (
          <div className="text-center mt-4 text-sm text-gray-500">
            他 {records.length - 20} 件の記録
          </div>
        )}
      </div>
    </div>
  );
}