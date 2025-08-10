'use client';

import { useState } from 'react';
import { HydrationRecord } from '@/domain/entities/HydrationRecord';

interface HydrationHistoryProps {
  records: HydrationRecord[];
  onEdit?: (recordId: string, amount: number, note?: string) => void;
  onDelete?: (recordId: string) => void;
}

export default function HydrationHistory({ records, onEdit, onDelete }: HydrationHistoryProps) {
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNote, setEditNote] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
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

  const handleEditStart = (record: HydrationRecord) => {
    setEditingRecord(record.id.value);
    setEditAmount(record.amount);
    setEditNote(record.note || '');
  };

  const handleEditSave = (recordId: string) => {
    if (onEdit && editAmount > 0) {
      onEdit(recordId, editAmount, editNote || undefined);
      setEditingRecord(null);
    }
  };

  const handleEditCancel = () => {
    setEditingRecord(null);
    setEditAmount(0);
    setEditNote('');
  };

  const handleDeleteConfirm = (recordId: string) => {
    if (onDelete) {
      onDelete(recordId);
      setShowDeleteConfirm(null);
    }
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
          const isEditing = editingRecord === record.id.value;
          const isDeleting = showDeleteConfirm === record.id.value;
          
          return (
            <div
              key={record.id.value}
              className={`p-3 rounded-2xl transition-all duration-200 ${
                isToday 
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200' 
                  : 'bg-white border border-gray-200'
              } ${index === 0 ? 'shadow-md' : 'shadow-sm'}`}
            >
              {isEditing ? (
                // 編集モード
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getRecordEmoji(editNote, editAmount)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(Number(e.target.value))}
                          className="selectable w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm focus:border-blue-400 focus:outline-none"
                          min="1"
                          max="2000"
                        />
                        <span className="text-sm text-gray-600">ml</span>
                      </div>
                      <input
                        type="text"
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        placeholder="メモ（任意）"
                        className="selectable w-full px-2 py-1 border border-gray-300 rounded-lg text-xs focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleEditSave(record.id.value)}
                      disabled={editAmount <= 0}
                      className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : isDeleting ? (
                // 削除確認モード
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="text-sm font-semibold text-red-600">
                        この記録を削除しますか？
                      </div>
                      <div className="text-xs text-gray-500">
                        {record.amount}ml • {formatTime(record.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={() => handleDeleteConfirm(record.id.value)}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
              ) : (
                // 通常表示モード
                <div className="flex items-center justify-between">
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
                  
                  <div className="flex items-center space-x-2">
                    {index === 0 && (
                      <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                        最新
                      </div>
                    )}
                    
                    {(onEdit || onDelete) && (
                      <div className="flex space-x-1">
                        {onEdit && (
                          <button
                            onClick={() => handleEditStart(record)}
                            className="p-1 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="編集"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => setShowDeleteConfirm(record.id.value)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="削除"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
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