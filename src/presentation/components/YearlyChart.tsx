'use client';

import { useState } from 'react';
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
import { Line, Bar } from 'react-chartjs-2';
import { YearlyStatistics } from '@/application/use-cases/GetYearlyStatisticsUseCase';

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

interface YearlyChartProps {
  data: YearlyStatistics;
}

export default function YearlyChart({ data }: YearlyChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [showTrend, setShowTrend] = useState(true);
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const getSeasonColors = (index: number) => {
    if (index < 2 || index === 11) return 'rgba(59, 130, 246, 0.8)'; // Winter - blue
    if (index < 5) return 'rgba(34, 197, 94, 0.8)'; // Spring - green
    if (index < 8) return 'rgba(251, 191, 36, 0.8)'; // Summer - yellow
    return 'rgba(249, 115, 22, 0.8)'; // Autumn - orange
  };

  const getTrendData = () => {
    const amounts = data.monthlyData.map(month => month.averageAmount);
    const trend = [];
    for (let i = 0; i < amounts.length; i++) {
      if (i === 0) {
        trend.push(amounts[0]);
      } else {
        const window = Math.min(3, i + 1);
        const sum = amounts.slice(Math.max(0, i - window + 1), i + 1).reduce((a, b) => a + b, 0);
        trend.push(sum / window);
      }
    }
    return trend;
  };

  const chartData = {
    labels: months,
    datasets: [
      {
        label: '月間平均摂取量',
        data: data.monthlyData.map(month => month.averageAmount),
        borderColor: chartType === 'line' ? 'rgb(16, 185, 129)' : undefined,
        backgroundColor: chartType === 'bar' ? months.map((_, i) => getSeasonColors(i)) : 'rgba(16, 185, 129, 0.1)',
        fill: chartType === 'line',
        tension: 0.4,
        pointRadius: chartType === 'line' ? 6 : 0,
        pointHoverRadius: 8,
        pointBackgroundColor: months.map((_, i) => getSeasonColors(i)),
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        borderWidth: chartType === 'bar' ? 0 : 2,
        borderRadius: chartType === 'bar' ? 8 : 0,
      },
      ...(showTrend && chartType === 'line' ? [{
        label: 'トレンド',
        data: getTrendData(),
        borderColor: 'rgba(147, 51, 234, 0.8)',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        borderDash: [10, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutCubic' as const,
    },
    plugins: {
      legend: {
        display: showTrend && chartType === 'line',
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
            const value = context.parsed.y;
            return `平均: ${value}ml/日`;
          },
          afterBody: function(tooltipItems: any[]) {
            if (tooltipItems.length > 0) {
              const index = tooltipItems[0].dataIndex;
              const monthData = data.monthlyData[index];
              const total = (monthData.totalAmount / 1000).toFixed(1);
              const achievement = Math.round(monthData.goalAchievementRate * 100);
              const season = index < 2 || index === 11 ? '❄️ 冬' : 
                          index < 5 ? '🌸 春' : 
                          index < 8 ? '☀️ 夏' : '🍂 秋';
              return [
                `月間総量: ${total}L`,
                `目標達成率: ${achievement}%`,
                `記録回数: ${monthData.recordCount}回`,
                `季節: ${season}`
              ];
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

  return (
    <div className="bg-gradient-to-br from-white to-emerald-50 rounded-3xl shadow-lg p-6 border border-emerald-100">
      {/* ヘッダーとコントロール */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📈</div>
        <h3 className="text-xl font-bold text-gray-800">年間統計</h3>
        <p className="text-sm text-gray-500 mb-4">{data.year}年</p>
        
        {/* チャートコントロール */}
        <div className="flex justify-center gap-2 mb-4">
          <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'line'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📈 ライン
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 バー
            </button>
          </div>
          
          {chartType === 'line' && (
            <button
              onClick={() => setShowTrend(!showTrend)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                showTrend
                  ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              📉 トレンド線
            </button>
          )}
        </div>
      </div>

      {/* グラフ */}
      <div className="h-64 md:h-80 lg:h-96 mb-6">
        {chartType === 'line' ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>

      {/* 統計サマリー */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(data.yearlyAverage)}</div>
          <div className="text-xs text-gray-500">ml 年間平均/日</div>
        </div>
        <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{data.totalGoalAchievementDays}</div>
          <div className="text-xs text-gray-500">日 目標達成</div>
        </div>
      </div>

      {/* 年間総量 */}
      <div className="bg-gradient-to-r from-emerald-100 to-emerald-50 rounded-2xl p-4 text-center border border-emerald-200 mb-4">
        <div className="text-sm text-emerald-700 font-medium mb-1">年間摂取量</div>
        <div className="text-2xl font-bold text-emerald-800">{(data.yearlyTotal / 1000).toFixed(1)}L</div>
      </div>

      {/* ベストマンス */}
      {data.bestMonth && (
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl p-4 border border-amber-200">
          <div className="flex items-center justify-center">
            <div className="text-2xl mr-2">🏆</div>
            <div className="text-center">
              <div className="text-sm text-amber-700 font-medium">ベスト月</div>
              <div className="text-lg font-bold text-amber-800">
                {data.bestMonth.month.getMonth() + 1}月 - {Math.round(data.bestMonth.averageAmount)}ml/日
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}