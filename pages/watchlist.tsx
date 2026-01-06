// pages/watchlist.tsx
import React, { useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
import { FiStar, FiTrendingUp, FiTrendingDown, FiTrash2, FiShield, FiDroplet, FiUsers, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { useState } from 'react';

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  chain?: string;
  exchange?: string;
  marketCap?: number;
  volume24h?: number;
  price?: number;
  transferVolume24h?: number;
  fullyDilutedValuation?: number;
  volumeMarketCapRatio?: number;
  circulatingSupplyPercentage?: number;
  isVolumeHealthy?: boolean;
  isCirculatingSupplyGood?: boolean;
  potentialMultiplier?: number;
  rank?: number;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  stats?: {
    priceChange24h?: number;
    volatilityScore24h?: number;
    liquidityScore?: number;
  };
}

const tokenColors = [
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-500',
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-amber-500',
  'from-emerald-400 to-green-500',
];

export default function Watchlist() {
  const { watchlist, fetchTokens } = useTokenStore();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Add removeFromWatchlist function to store if not exists
  const removeFromWatchlist = (tokenId: string) => {
    useTokenStore.setState((state) => ({
      watchlist: state.watchlist.filter((t) => t.id !== tokenId),
    }));
  };

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

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

  const getRiskColor = (score?: number) => {
    if (score === undefined) return 'text-gray-400';
    if (score <= 30) return 'text-emerald-400';
    if (score <= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const getRiskBgColor = (score?: number) => {
    if (score === undefined) return 'bg-gray-500/10';
    if (score <= 30) return 'bg-emerald-500/10';
    if (score <= 60) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  const getRiskLabel = (score?: number) => {
    if (score === undefined) return 'N/A';
    if (score <= 30) return 'Low';
    if (score <= 60) return 'Medium';
    return 'High';
  };

  return (
    <div className="min-h-screen bg-[#0A0E17]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'} pb-20 lg:pb-0`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-[#0A0E17]/90 backdrop-blur-sm border-b border-white/5">
          <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiStar className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Watchlist</h1>
              <span className="px-2 py-0.5 bg-white/10 text-gray-400 text-xs rounded-full">
                {watchlist.length} tokens
              </span>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {watchlist.map((token: Token, index: number) => {
                const change24h = token.stats?.priceChange24h;
                const colorIndex = token.symbol.charCodeAt(0) % tokenColors.length;

                return (
                  <div
                    key={token.id}
                    className="bg-[#111827] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer group"
                    onClick={() => router.push(`/tokens/${token.id}`)}
                  >
                    {/* Token Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br ${tokenColors[colorIndex]}`}>
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{token.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 uppercase">{token.symbol}</span>
                            {token.chain && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-gray-500 capitalize">{token.chain}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWatchlist(token.id);
                        }}
                        className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove from watchlist"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price Section */}
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <p className="text-2xl font-bold text-white">{formatPrice(token.price)}</p>
                        <p className="text-xs text-gray-500">MCap: {formatLarge(token.marketCap)}</p>
                      </div>
                      {change24h !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {change24h >= 0 ? <FiTrendingUp className="w-3 h-3" /> : <FiTrendingDown className="w-3 h-3" />}
                          <span className="text-sm font-medium">{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%</span>
                        </div>
                      )}
                    </div>

                    {/* Risk Indicators */}
                    <div className="grid grid-cols-3 gap-2">
                      {/* Liquidity */}
                      <div className={`p-2 rounded-lg ${(token.liquidityScore ?? 0) >= 70 ? 'bg-emerald-500/10' : (token.liquidityScore ?? 0) >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <FiDroplet className={`w-3 h-3 ${(token.liquidityScore ?? 0) >= 70 ? 'text-emerald-400' : (token.liquidityScore ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
                          <span className="text-[10px] text-gray-500">Liquidity</span>
                        </div>
                        <p className={`text-sm font-bold ${(token.liquidityScore ?? 0) >= 70 ? 'text-emerald-400' : (token.liquidityScore ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                          {token.liquidityScore?.toFixed(0) ?? '-'}
                        </p>
                      </div>

                      {/* Distribution */}
                      <div className={`p-2 rounded-lg ${(token.walletDistributionScore ?? 0) >= 70 ? 'bg-emerald-500/10' : (token.walletDistributionScore ?? 0) >= 40 ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <FiUsers className={`w-3 h-3 ${(token.walletDistributionScore ?? 0) >= 70 ? 'text-emerald-400' : (token.walletDistributionScore ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
                          <span className="text-[10px] text-gray-500">Dist.</span>
                        </div>
                        <p className={`text-sm font-bold ${(token.walletDistributionScore ?? 0) >= 70 ? 'text-emerald-400' : (token.walletDistributionScore ?? 0) >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                          {token.walletDistributionScore?.toFixed(0) ?? '-'}
                        </p>
                      </div>

                      {/* Risk Level */}
                      <div className={`p-2 rounded-lg ${getRiskBgColor(token.pumpDumpRiskScore)}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <FiShield className={`w-3 h-3 ${getRiskColor(token.pumpDumpRiskScore)}`} />
                          <span className="text-[10px] text-gray-500">Risk</span>
                        </div>
                        <p className={`text-sm font-bold ${getRiskColor(token.pumpDumpRiskScore)}`}>
                          {getRiskLabel(token.pumpDumpRiskScore)}
                        </p>
                      </div>
                    </div>

                    {/* Volume Health Badge */}
                    {token.isVolumeHealthy !== undefined && (
                      <div className="mt-3 pt-3 border-t border-white/5">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg ${token.isVolumeHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.isVolumeHealthy ? '✓ Healthy Volume' : '✗ Unhealthy Volume'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                <FiStar className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No tokens in watchlist</h2>
              <p className="text-gray-400 text-center mb-6 max-w-md">
                Start tracking your favorite tokens by adding them to your watchlist from the main market page.
              </p>
              <button
                onClick={() => router.push('/')}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                <FiPlus className="w-5 h-5" />
                Explore Tokens
              </button>
            </div>
          )}
        </main>
      </div>

      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}