import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, ChartOptions } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTokens } from '../../utils/api';
import BottomNav from '../../components/BottomNav';
import { formatNumber } from '../../components/TokenTable';

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
  const [apiError, setApiError] = useState<string | null>(null);

  // Replace with your backend URL, e.g., 'https://your-backend.com'
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    if (id) {
      const url = `${BACKEND_URL}/api/tokens/${id}/history`;
      console.log(`Fetching history from: ${url}`);
      fetch(url)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('Token history data:', data);
          setHistory(data);
          setApiError(null);
        })
        .catch(err => {
          console.error('Error fetching history:', err.message);
          setApiError(err.message);
        });
    }
  }, [id]);

  const token = tokens?.find((t: Token) => t.id === id);

  if (isLoading) return <div className="p-4 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!token) return <div className="p-4 text-center text-gray-400">Token not found</div>;

  // Group by date, minimal filtering
  const validHistory = history
    .filter(h => h.price != null && h.volume24h != null && h.marketCap != null && h.marketCap !== 0)
    .reduce((acc: TokenHistory[], h) => {
      const date = new Date(h.timestamp).toISOString().split('T')[0];
      const existing = acc.find(item => new Date(item.timestamp).toISOString().split('T')[0] === date);
      if (!existing) acc.push(h);
      return acc;
    }, [])
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  console.log('Valid history:', validHistory);

  const chartData = {
    labels: validHistory.map(h => new Date(h.timestamp)),
    datasets: [
      {
        label: 'Volume/Market Cap Ratio (%)',
        data: validHistory.map(h => (h.volume24h! / h.marketCap!) * 100),
        borderColor: '#FBBF24',
        yAxisID: 'y-ratio',
      },
      {
        label: 'Price (USD)',
        data: validHistory.map(h => h.price!),
        borderColor: '#3B82F6',
        yAxisID: 'y-price',
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day' },
        title: { display: true, text: 'Date' },
      },
      'y-ratio': {
        type: 'linear',
        position: 'left',
        title: { display: true, text: 'Ratio (%)' },
        beginAtZero: true,
      },
      'y-price': {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Price ($)' },
        beginAtZero: true,
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: { mode: 'index', intersect: false },
    },
  };

  console.log('Chart data:', chartData);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex items-center">
        <button onClick={() => router.back()} className="mr-4 text-yellow-400">
          ← Back
        </button>
        <h1 className="text-xl font-bold">{token.name} ({token.symbol.toUpperCase()})</h1>
      </header>
      <main className="flex-1 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-lg font-semibold">Details</h2>
            <p>Price: {formatNumber(token.price)}</p>
            <p>Market Cap: {formatNumber(token.marketCap)}</p>
            <p>24h Volume: {formatNumber(token.volume24h)}</p>
            <p>Category: {token.category.charAt(0).toUpperCase() + token.category.slice(1)}</p>
            <p>Volume/Market Cap Ratio: {(token.volumeMarketCapRatio * 100)?.toFixed(2)}%</p>
            <p>Healthy Volume: {token.isVolumeHealthy ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg h-80">
            <h2 className="text-lg font-semibold mb-2">Historical Data</h2>
            <div className="h-64">
              {apiError ? (
                <div className="text-center text-red-500 h-full flex items-center justify-center">
                  Error: {apiError}
                </div>
              ) : validHistory.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="text-center text-gray-400 h-full flex items-center justify-center">
                  No history data
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav onFilterClick={() => {}} />
    </div>
  );
};

export default TokenDetails;