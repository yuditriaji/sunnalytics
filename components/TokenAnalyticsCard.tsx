import React from 'react';
import { useRouter } from 'next/router';
import { FiStar, FiTrendingUp, FiArrowUpRight } from 'react-icons/fi';
import { useTokenStore } from '../stores/useTokenStore';

interface TokenAnalyticsCardProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    category?: string;
    exchange?: string;
    price?: number;
    marketCap?: number;
    volume24h?: number;
    liquidityScore?: number;
    pumpDumpRiskScore?: number;
    walletDistributionScore?: number;
    stats?: {
      priceChange24h?: number;
    };
  };
}

const tokenColors = [
  'bg-gradient-to-br from-purple-500 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-teal-400 to-cyan-500',
  'bg-gradient-to-br from-orange-400 to-amber-500',
  'bg-gradient-to-br from-emerald-400 to-green-500',
];

const TokenAnalyticsCard: React.FC<TokenAnalyticsCardProps> = ({ token }) => {
  const router = useRouter();
  const { watchlist, addToWatchlist } = useTokenStore();
  const isInWatchlist = watchlist.some(w => w.id === token.id);
  const colorIndex = token.symbol.charCodeAt(0) % tokenColors.length;

  const formatNumber = (value?: number): string => {
    if (!value) return '-';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(0)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toFixed(2)}`;
  };

  const change24h = token.stats?.priceChange24h;

  return (
    <div
      onClick={() => router.push(`/tokens/${token.id}`)}
      className="bg-[#111827] border border-white/5 rounded-xl p-4 hover:border-white/10 cursor-pointer transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${tokenColors[colorIndex]}`}>
            {token.symbol.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
              {token.symbol}
            </h3>
            <p className="text-xs text-gray-500 truncate max-w-[120px]">{token.name}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToWatchlist({ ...token, exchange: token.exchange || 'Unknown' } as any);
          }}
          className={`p-1.5 rounded-lg transition-colors ${isInWatchlist ? 'text-amber-400 bg-amber-400/10' : 'text-gray-500 hover:text-amber-400 hover:bg-white/5'
            }`}
        >
          <FiStar className="w-4 h-4" fill={isInWatchlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Price */}
      <div className="mb-4">
        <p className="text-xl font-bold text-white">{formatPrice(token.price)}</p>
        {change24h !== undefined && (
          <p className={`text-sm font-medium ${change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/[0.03] rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase">Mkt Cap</p>
          <p className="text-xs font-medium text-white">{formatNumber(token.marketCap)}</p>
        </div>
        <div className="bg-white/[0.03] rounded-lg px-3 py-2">
          <p className="text-[10px] text-gray-500 uppercase">Volume</p>
          <p className="text-xs font-medium text-white">{formatNumber(token.volume24h)}</p>
        </div>
      </div>

      {/* Scores */}
      {(token.liquidityScore || token.pumpDumpRiskScore) && (
        <div className="flex items-center gap-2">
          {token.liquidityScore !== undefined && token.liquidityScore > 0 && (
            <span className={`text-[10px] font-medium px-2 py-1 rounded ${token.liquidityScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' :
                token.liquidityScore >= 40 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
              }`}>
              Liq: {token.liquidityScore.toFixed(0)}
            </span>
          )}
          {token.pumpDumpRiskScore !== undefined && token.pumpDumpRiskScore > 0 && (
            <span className={`text-[10px] font-medium px-2 py-1 rounded ${token.pumpDumpRiskScore <= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                token.pumpDumpRiskScore <= 60 ? 'bg-amber-500/10 text-amber-400' :
                  'bg-red-500/10 text-red-400'
              }`}>
              Risk: {token.pumpDumpRiskScore <= 30 ? 'Low' : token.pumpDumpRiskScore <= 60 ? 'Med' : 'High'}
            </span>
          )}
        </div>
      )}

      {/* View Details */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center justify-between text-xs text-gray-500 group-hover:text-cyan-400 transition-colors">
          <span>View Details</span>
          <FiArrowUpRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};

export default TokenAnalyticsCard;
