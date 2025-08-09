'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DailyHourlyStatistics } from '@/application/use-cases/GetDailyHourlyStatisticsUseCase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyHourlyChartProps {
  data: DailyHourlyStatistics;
}

export default function DailyHourlyChart({ data }: DailyHourlyChartProps) {
  const hours = Array.from({ length: 24 }, (_, i) => `${i}時`);
  
  const chartData = {
    labels: hours,
    datasets: [
      {
        label: '摂取量',
        data: data.hourlyData.map(hour => hour.amount),
        backgroundColor: data.hourlyData.map((hour, index) => 
          index === data.peakHour 
            ? 'rgba(239, 68, 68, 0.8)' 
            : 'rgba(59, 130, 246, 0.6)'
        ),
        borderColor: data.hourlyData.map((hour, index) => 
          index === data.peakHour 
            ? 'rgb(239, 68, 68)' 
            : 'rgb(59, 130, 246)'
        ),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          title: function(tooltipItems: any[]) {
            const hour = tooltipItems[0].dataIndex;
            return `${hour}:00 - ${hour + 1}:00`;
          },
          label: function(context: any) {
            const value = context.parsed.y;
            const hour = context.dataIndex;
            const recordCount = data.hourlyData[hour].recordCount;
            return [
              `摂取量: ${value}ml`,
              `記録回数: ${recordCount}回`
            ];
          },
          afterBody: function(tooltipItems: any[]) {
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
          callback: function(value: any) {
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
          callback: function(value: any, index: number) {
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
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">⏰</div>
        <h3 className="text-xl font-bold text-gray-800">時間別統計</h3>
        <p className="text-sm text-gray-500">{formatDate(data.date)}</p>
      </div>

      {/* グラフ */}
      <div className="h-64 md:h-80 lg:h-96 mb-6">
        <Bar data={chartData} options={options} />
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