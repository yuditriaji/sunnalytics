// pages/charts.tsx
import React, { useState, useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import BottomNav from '../components/BottomNav';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Charts() {
  const { tokens } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    if (selectedToken && tokens.length > 0) {
      const token = tokens.find(t => t.symbol === selectedToken);
      if (token) {
        // Mock historical data (replace with real API data if available)
        const labels = ['June 10', 'June 12', 'June 14', 'June 16', 'June 18'];
        const priceData = [token.price || 0, (token.price || 0) * 1.1, (token.price || 0) * 1.2, (token.price || 0) * 1.15, (token.price || 0) * 1.3];
        const volumeData = [(token.volume24h || 0), (token.volume24h || 0) * 0.9, (token.volume24h || 0) * 1.1, (token.volume24h || 0) * 1.05, (token.volume24h || 0) * 1.2];
        const marketCapData = [token.marketCap || 0, (token.marketCap || 0) * 1.15, (token.marketCap || 0) * 1.25, (token.marketCap || 0) * 1.2, (token.marketCap || 0) * 1.35];

        setChartData({
          labels,
          datasets: [
            {
              label: 'Price (USD)',
              data: priceData,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              yAxisID: 'y1',
            },
            {
              label: 'Volume (24h)',
              data: volumeData,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              yAxisID: 'y2',
            },
            {
              label: 'Market Cap',
              data: marketCapData,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              yAxisID: 'y3',
            },
          ],
        });
      }
    }
  }, [selectedToken, tokens]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Token Price, Volume, and Market Cap Trends' },
    },
    scales: {
      y1: { 
        type: 'linear' as const, 
        position: 'left' as const, 
        title: { display: true, text: 'Price (USD)' } 
      },
      y2: { 
        type: 'linear' as const, 
        position: 'right' as const, 
        title: { display: true, text: 'Volume (USD)' }, 
        grid: { drawOnChartArea: false } 
      },
      y3: { 
        type: 'linear' as const, 
        position: 'right' as const, 
        title: { display: true, text: 'Market Cap (USD)' }, 
        grid: { drawOnChartArea: false }, 
        min: 0 
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Charts</h1>
      <select
        onChange={e => setSelectedToken(e.target.value)}
        className="p-2 mb-4 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
        value={selectedToken || ''}
      >
        <option value="">Select a Token</option>
        {tokens.map(token => (
          <option key={token.id} value={token.symbol}>{token.symbol}</option>
        ))}
      </select>
      {chartData && selectedToken ? (
        <div>
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-gray-400">Select a token to view charts.</p>
      )}
      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}