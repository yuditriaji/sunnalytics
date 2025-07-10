import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTokens } from '../utils/api';
import BottomNav from './BottomNav';
import { formatLargeNumber as formatNumber } from '../utils/tokenStats';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

interface TokenHistory {
  id: string;
  tokenId: string;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
  timestamp: string;
}

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  volumeMarketCapRatio?: number;
  isVolumeHealthy?: boolean;
}

const TokenDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { tokens, isLoading, error } = useTokens();
  const [history, setHistory] = useState<TokenHistory[]>([]);

  React.useEffect(() => {
    if (id) {
      fetch(`/api/tokens/${id}/history`)
        .then(res => res.json())
        .then(data => setHistory(data))
        .catch(err => console.error('Error fetching history:', err));
    }
  }, [id]);

  const token = tokens?.find((t: Token) => t.id === id);

  if (isLoading) return <div className="p-4 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!token) return <div className="p-4 text-center text-gray-400">Token not found</div>;

  const chartData = {
    labels: history.map(h => new Date(h.timestamp)),
    datasets: [
      {
        label: 'Price (USD)',
        data: history.map(h => h.price || 0),
        borderColor: '#FBBF24',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'day' as const, // Explicitly set to 'day'
          tooltipFormat: 'MMM d, yyyy HH:mm',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#fff',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)',
          color: '#fff',
        },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Price: $${context.parsed.y.toFixed(2)}`,
          title: (tooltipItems: any[]) => {
            return new Date(tooltipItems[0].parsed.x).toLocaleString();
          },
        },
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex items-center">
        <button
          onClick={() => router.back()}
          className="mr-4 text-yellow-400 hover:text-yellow-300"
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold">{token.name} ({token.symbol.toUpperCase()})</h1>
      </header>
      <main className="flex-1 p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold">Details</h2>
            <p>Price: ${token.price ? formatNumber(token.price) : 'N/A'}</p>
            <p>Market Cap: ${token.marketCap ? formatNumber(token.marketCap) : 'N/A'}</p>
            <p>24h Volume: ${token.volume24h ? formatNumber(token.volume24h) : 'N/A'}</p>
            <p>Category: {token.category.charAt(0).toUpperCase() + token.category.slice(1)}</p>
            <p>Volume/Market Cap Ratio: {(token.volumeMarketCapRatio * 100)?.toFixed(2)}%</p>
            <p>Healthy Volume: {token.isVolumeHealthy ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow h-80">
            <h2 className="text-lg font-semibold mb-2">Price History</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </main>
      <BottomNav onFilterClick={() => {}} />
    </div>
  );
};

export default TokenDetails;