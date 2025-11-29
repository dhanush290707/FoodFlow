import React from 'react';
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
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
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

export const DonationsBarChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Monthly Donations (kg)' },
    },
    scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
    }
  };

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Food Donations',
        data: [65, 59, 80, 81, 56, 55, 40],
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Primary Green
        borderRadius: 4,
      },
      {
        label: 'Claimed Items',
        data: [28, 48, 40, 19, 86, 27, 90],
        backgroundColor: 'rgba(16, 185, 129, 0.3)', // Light Green
        borderRadius: 4,
      },
    ],
  };

  return <Bar options={options} data={data} />;
};

export const ActivityLineChart = () => {
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Platform Activity Trends' },
    },
    scales: {
        y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
        x: { grid: { display: false } }
    },
    elements: {
        line: { tension: 0.4 } // Smooth curves
    }
  };

  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        fill: true,
        label: 'Active Requests',
        data: [12, 19, 3, 5, 2, 3, 15],
        borderColor: 'rgb(59, 130, 246)', // Blue
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      },
    ],
  };

  return <Line options={options} data={data} />;
};