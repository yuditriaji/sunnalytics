import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useTokens } from '../../utils/api';
import BottomNav from '../../components/BottomNav';
import Sidebar from '../../components/Sidebar';
import { FiArrowLeft, FiStar, FiExternalLink, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiShield, FiDroplet, FiUsers } from 'react-icons/fi';

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend, Filler);

interface TokenHistory {
  timestamp: string;
  price: number | null;
  marketCap: number | null;
  volume24h: number | null;
}

const TokenDetails: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { tokens, isLoading, error } = useTokens();
  const [history, setHistory] = useState<TokenHistory[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  useEffect(() => {
    if (id) {
      fetch(`${BACKEND_URL}/api/tokens/${id}/history`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setHistory(data))
        .catch(() => setHistory([]));
    }
  }, [id, BACKEND_URL]);

  const token = tokens?.find((t: any) => t.id === id);

  const formatPrice = (price?: number) => {
    if (!price) return '$0.00';
    if (price < 0.0001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatLarge = (num?: number) => {
    if (!num) return '-';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  // Parse history for chart
  const validHistory = history
    .filter(h => h.price != null)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const chartData = {
    labels: validHistory.map(h => new Date(h.timestamp)),
    datasets: [{
      label: 'Price',
      data: validHistory.map(h => h.price),
      borderColor: '#22D3EE',
      backgroundColor: 'rgba(34, 211, 238, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2,
    }],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        type: 'time',
        time: { unit: 'day' },
        grid: { display: false },
        ticks: { color: '#6B7280' },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#6B7280' },
      },
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !token) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="text-center">
          <FiAlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Token not found</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const change24h = token.stats?.priceChange24h;
  const tokenColors = ['from-purple-500 to-indigo-600', 'from-pink-500 to-rose-500', 'from-teal-400 to-cyan-500', 'from-orange-400 to-amber-500', 'from-emerald-400 to-green-500'];
  const colorIndex = token.symbol.charCodeAt(0) % tokenColors.length;

  return (
    <div className="min-h-screen bg-[#0A0E17]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'} pb-20 lg:pb-0`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0A0E17]/90 backdrop-blur-sm border-b border-white/5">
          <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white">
              <FiArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <button className="p-2 text-gray-400 hover:text-amber-400 transition-colors">
              <FiStar className="w-5 h-5" />
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {/* Token Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white bg-gradient-to-br ${tokenColors[colorIndex]}`}>
              {token.symbol.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white">{token.name}</h1>
                <span className="text-sm text-gray-500 uppercase">{token.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-white">{formatPrice(token.price)}</span>
                {change24h !== undefined && (
                  <span className={`flex items-center gap-1 text-sm font-medium ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {change24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="bg-[#111827] border border-white/5 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Price Chart</h2>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${timeRange === range ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64">
              {validHistory.length > 0 ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                  No price history available
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Market Cap</p>
              <p className="text-lg font-bold text-white">{formatLarge(token.marketCap)}</p>
            </div>
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">24h Volume</p>
              <p className="text-lg font-bold text-white">{formatLarge(token.volume24h)}</p>
            </div>
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Exchange</p>
              <p className="text-lg font-bold text-white">{token.exchange || '-'}</p>
            </div>
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase mb-1">Chain</p>
              <p className="text-lg font-bold text-white capitalize">{token.chain || '-'}</p>
            </div>
          </div>

          {/* Risk Analysis */}
          <div className="bg-[#111827] border border-white/5 rounded-xl p-4 mb-6">
            <h2 className="text-sm font-medium text-white mb-4">Risk Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Liquidity Score */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(token.liquidityScore ?? 0) >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                    (token.liquidityScore ?? 0) >= 40 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                  }`}>
                  <FiDroplet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Liquidity Score</p>
                  <p className="text-lg font-bold text-white">{token.liquidityScore?.toFixed(0) ?? '-'}</p>
                </div>
              </div>

              {/* Wallet Distribution */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(token.walletDistributionScore ?? 0) >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                    (token.walletDistributionScore ?? 0) >= 40 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                  }`}>
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Distribution</p>
                  <p className="text-lg font-bold text-white">{token.walletDistributionScore?.toFixed(0) ?? '-'}</p>
                </div>
              </div>

              {/* Risk Score */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(token.pumpDumpRiskScore ?? 100) <= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                    (token.pumpDumpRiskScore ?? 100) <= 60 ? 'bg-amber-500/10 text-amber-400' :
                      'bg-red-500/10 text-red-400'
                  }`}>
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Risk Level</p>
                  <p className="text-lg font-bold text-white">
                    {token.pumpDumpRiskScore !== undefined
                      ? token.pumpDumpRiskScore <= 30 ? 'Low' : token.pumpDumpRiskScore <= 60 ? 'Medium' : 'High'
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Info */}
          {token.contractAddress && (
            <div className="bg-[#111827] border border-white/5 rounded-xl p-4">
              <h2 className="text-sm font-medium text-white mb-3">Contract</h2>
              <div className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <code className="text-sm text-gray-400 truncate">{token.contractAddress}</code>
                <button className="text-gray-400 hover:text-cyan-400 ml-2">
                  <FiExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default TokenDetails;
