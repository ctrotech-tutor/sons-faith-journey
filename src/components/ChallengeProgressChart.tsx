import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ChallengeProgressChart = () => {
  const today = new Date();
  const challengeStart = new Date('2025-06-01');
  const dayDiff = Math.ceil((today.getTime() - challengeStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const progressPercent = Math.min(Math.round((dayDiff / 90) * 100), 100);

  const labels = Array.from({ length: dayDiff }, (_, i) => `Day ${i + 1}`);
  const dataPoints = Array.from({ length: dayDiff }, (_, i) => ((i + 1) / 90) * 100);

  const data = {
    labels,
    datasets: [
      {
        label: 'Progress (%)',
        data: dataPoints,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        max: 100,
        min: 0,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default ChallengeProgressChart;
