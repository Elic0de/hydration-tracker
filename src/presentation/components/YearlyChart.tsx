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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { YearlyStatistics } from '@/application/use-cases/GetYearlyStatisticsUseCase';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface YearlyChartProps {
  data: YearlyStatistics;
}

export default function YearlyChart({ data }: YearlyChartProps) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const chartData = {
    labels: months,
    datasets: [
      {
        label: '月間平均摂取量',
        data: data.monthlyData.map(month => month.averageAmount),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: 'rgb(16, 185, 129)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
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
              return [
                `月間総量: ${total}L`,
                `目標達成率: ${achievement}%`,
                `記録回数: ${monthData.recordCount}回`
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
      {/* ヘッダー */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">📈</div>
        <h3 className="text-xl font-bold text-gray-800">年間統計</h3>
        <p className="text-sm text-gray-500">{data.year}年</p>
      </div>

      {/* グラフ */}
      <div className="h-64 md:h-80 lg:h-96 mb-6">
        <Line data={chartData} options={options} />
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