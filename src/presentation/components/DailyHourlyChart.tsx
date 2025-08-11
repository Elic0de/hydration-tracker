'use client';

import { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { DailyHourlyStatistics } from '@/application/use-cases/GetDailyHourlyStatisticsUseCase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DailyHourlyChartProps {
  data: DailyHourlyStatistics;
}

export default function DailyHourlyChart({ data }: DailyHourlyChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [showAverage, setShowAverage] = useState(true);
  const hours = Array.from({ length: 24 }, (_, i) => `${i}時`);
  
  const getTimeOfDayColor = (hour: number) => {
    if (hour >= 6 && hour < 12) return 'rgba(251, 191, 36, 0.8)'; // Morning - yellow
    if (hour >= 12 && hour < 18) return 'rgba(59, 130, 246, 0.8)'; // Afternoon - blue
    if (hour >= 18 && hour < 22) return 'rgba(249, 115, 22, 0.8)'; // Evening - orange
    return 'rgba(99, 102, 241, 0.8)'; // Night - indigo
  };

  const averageAmount = data.totalAmount / 24;

  const barChartData = {
    labels: hours,
    datasets: [
      {
        label: '摂取量',
        data: data.hourlyData.map(hour => hour.amount),
        backgroundColor: data.hourlyData.map((hour, index) => 
          index === data.peakHour 
            ? 'rgba(239, 68, 68, 0.8)' 
            : getTimeOfDayColor(index)
        ),
        borderColor: data.hourlyData.map((hour, index) => 
          index === data.peakHour 
            ? 'rgb(239, 68, 68)' 
            : getTimeOfDayColor(index).replace('0.8', '1')
        ),
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const lineChartData = {
    labels: hours,
    datasets: [
      {
        label: '摂取量',
        data: data.hourlyData.map(hour => hour.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: data.hourlyData.map((_, index) => getTimeOfDayColor(index)),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
      ...(showAverage ? [{
        label: '平均',
        data: new Array(24).fill(averageAmount),
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        type: 'line' as const,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutCubic' as const,
    },
    plugins: {
      legend: {
        display: showAverage,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(tooltipItems: TooltipItem<'bar' | 'line'>[]) {
            const hour = tooltipItems[0].dataIndex;
            return `${hour}:00 - ${hour + 1}:00`;
          },
          label: function(context: TooltipItem<'bar' | 'line'>) {
            const value = context.parsed.y;
            const hour = context.dataIndex;
            const recordCount = data.hourlyData[hour].recordCount;
            return [
              `摂取量: ${value}ml`,
              `記録回数: ${recordCount}回`
            ];
          },
          afterBody: function(tooltipItems: TooltipItem<'bar' | 'line'>[]) {
            if (tooltipItems.length > 0) {
              const hour = tooltipItems[0].dataIndex;
              if (hour === data.peakHour) {
                return ['🏆 ピーク時間'];
              }
            }
            return [];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: string | number) {
            return value + 'ml';
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          callback: function(value: string | number, index: number) {
            // 4時間おきに表示
            return index % 4 === 0 ? `${index}時` : '';
          },
        },
      },
    },
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeOfDay = (hour: number) => {
    if (hour >= 6 && hour < 12) return { label: '朝', emoji: '🌅' };
    if (hour >= 12 && hour < 18) return { label: '昼', emoji: '☀️' };
    if (hour >= 18 && hour < 22) return { label: '夕', emoji: '🌆' };
    return { label: '夜', emoji: '🌙' };
  };

  const peakTimeOfDay = getTimeOfDay(data.peakHour);

  return (
    <div className="bg-gradient-to-br from-white to-indigo-50 rounded-3xl shadow-lg p-6 border border-indigo-100">
      {/* ヘッダーとコントロール */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">⏰</div>
        <h3 className="text-xl font-bold text-gray-800">時間別統計</h3>
        <p className="text-sm text-gray-500 mb-4">{formatDate(data.date)}</p>
        
        {/* チャートコントロール */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 バー
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'line'
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📈 ライン
            </button>
          </div>
          
          <button
            onClick={() => setShowAverage(!showAverage)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
              showAverage
                ? 'bg-red-500 text-white border-red-500 shadow-md'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            📏 平均線
          </button>
        </div>
      </div>

      {/* グラフ */}
      <div className="h-64 md:h-80 lg:h-96 mb-6">
        {chartType === 'bar' ? (
          <Bar data={barChartData} options={options} />
        ) : (
          <Line data={lineChartData} options={options} />
        )}
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-indigo-600">{data.peakHour}:00</div>
          <div className="text-xs text-gray-500">ピーク時間</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-purple-600">{data.totalAmount}</div>
          <div className="text-xs text-gray-500">ml 合計</div>
        </div>
      </div>

      {/* ピーク時間の詳細 */}
      <div className="bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-2xl p-4 text-center border border-indigo-200">
        <div className="flex items-center justify-center mb-2">
          <div className="text-2xl mr-2">{peakTimeOfDay.emoji}</div>
          <div className="text-lg font-bold text-indigo-800">
            {peakTimeOfDay.label}の時間帯がピーク
          </div>
        </div>
        <p className="text-sm text-indigo-700">
          {data.peakHour}時台に{data.hourlyData[data.peakHour].amount}ml摂取
        </p>
      </div>

      {/* 時間帯別のヒント */}
      <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <div className="flex items-start">
          <div className="text-xl mr-2">💡</div>
          <div>
            <p className="text-sm font-medium text-amber-800 mb-1">水分補給のタイミング</p>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• 朝起床時：コップ1杯で代謝アップ</li>
              <li>• 食前30分：消化を助ける</li>
              <li>• 運動前後：脱水予防と回復</li>
              <li>• 就寝2時間前：睡眠の質向上</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}