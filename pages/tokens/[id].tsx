import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend } from 'chart.js';
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

  useEffect(() => {
    if (id) {
      console.log(`Fetching history for token ID: ${id}`); // Debug log
      fetch(`/api/tokens/${id}/history`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          return res.json();
        })
        .then(data => {
          console.log('Token history data:', data); // Debug log
          setHistory(data);
        })
        .catch(err => console.error('Error fetching history:', err));
    }
  }, [id]);

  const token = tokens?.find((t: Token) => t.id === id);

  if (isLoading) return <div className="p-4 text-center text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!token) return <div className="p-4 text-center text-gray-400">Token not found</div>;

  // Filter valid history for volume/market cap ratio
  const validHistory = history.filter(
    h => h.volume24h != null && h.marketCap != null && h.marketCap !== 0
  );
  console.log('Valid history data:', validHistory); // Debug log

  const chartData = {
    labels: validHistory.map(h => new Date(h.timestamp)),
    datasets: [
      {
        label: 'Volume/Market Cap Ratio (%)',
        data: validHistory.map(h => (h.volume24h! / h.marketCap!) * 100),
        borderColor: '#FBBF24',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          tooltipFormat: 'MMM d, yyyy HH:mm',
        },
        title: {
          display: true,
          text: 'Date',
          color: '#fff',
        },
      },
      y: {
        type: 'linear',
        title: {
          display: true,
          text: 'Volume/Market Cap Ratio (%)',
          color: '#fff',
        },
        beginAtZero: true,
        ticks: {
          // Simplified callback with type assertion
          callback: (value: number) => `${value.toFixed(2)}%`,
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: '#fff',
        },
      },
      tooltip: {
        // Simplified tooltip callbacks
        callbacks: {
          label: (context: any) => `Ratio: ${context.parsed.y.toFixed(2)}%`,
          title: (context: any[]) => {
            return new Date(context[0].parsed.x).toLocaleString();
          },
        },
      },
    },
  };

  console.log('Chart data:', chartData); // Debug log

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
            <p>Price: {formatNumber(token.price)}</p>
            <p>Market Cap: {formatNumber(token.marketCap)}</p>
            <p>24h Volume: {formatNumber(token.volume24h)}</p>
            <p>Category: {token.category.charAt(0).toUpperCase() + token.category.slice(1)}</p>
            <p>Volume/Market Cap Ratio: {(token.volumeMarketCapRatio * 100)?.toFixed(2)}%</p>
            <p>Healthy Volume: {token.isVolumeHealthy ? 'Yes' : 'No'}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg shadow h-80">
            <h2 className="text-lg font-semibold mb-2">Volume/Market Cap Ratio History</h2>
            <div className="h-64 relative">
              {validHistory.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="text-center text-gray-400 h-full flex items-center justify-center">
                  No valid history data available
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