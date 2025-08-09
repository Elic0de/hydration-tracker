'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { WeeklyStatistics } from '@/application/use-cases/GetWeeklyStatisticsUseCase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyChartProps {
  data: WeeklyStatistics;
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  
  const chartData = {
    labels: data.dailyData.map((_, index) => weekDays[index]),
    datasets: [
      {
        label: '摂取量',
        data: data.dailyData.map(day => day.totalAmount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
      },
      {
        label: '目標',
        data: data.dailyData.map(day => day.goalAmount),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderDash: [5, 5],
        fill: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}ml`;
          },
          afterBody: function(tooltipItems: any[]) {
            if (tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const dayData = data.dailyData[index];
              const achievement = Math.round(dayData.achievementRate * 100);
              return [`達成率: ${achievement}%`, `記録回数: ${dayData.recordCount}回`];
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
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-lg p-6 border border-blue-100">
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📊</div>
        <h3 className="text-xl font-bold text-gray-800">週間統計</h3>
        <p className="text-sm text-gray-500">
          {formatDate(data.weekStartDate)} - {formatDate(new Date(data.weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000))}
        </p>
      </div>

      {/* グラフ */}
      <div className="h-64 md:h-80 lg:h-96 mb-6">
        <Line data={chartData} options={options} />
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{Math.round(data.weeklyAverage)}</div>
          <div className="text-xs text-gray-500">ml 平均/日</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-green-600">{data.goalAchievementDays}</div>
          <div className="text-xs text-gray-500">日 目標達成</div>
        </div>
      </div>

      {/* 週間総量 */}
      <div className="mt-4 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl p-4 text-center border border-blue-200">
        <div className="text-sm text-blue-700 font-medium mb-1">週間摂取量</div>
        <div className="text-2xl font-bold text-blue-800">{(data.weeklyTotal / 1000).toFixed(1)}L</div>
      </div>
    </div>
  );
}