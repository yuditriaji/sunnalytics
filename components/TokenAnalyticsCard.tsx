import React from 'react';
import { useRouter } from 'next/router';
import { FaChartLine, FaExclamationTriangle, FaStar, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import RiskIndicator from './RiskIndicator';
import { useTokenStore } from '../stores/useTokenStore';

interface TokenAnalyticsCardProps {
  token: {
    id: string;
    name: string;
    symbol: string;
    category: string;
    exchange?: string;
    price?: number;
    marketCap?: number;
    volume24h?: number;
    volumeMarketCapRatio?: number;
    isVolumeHealthy?: boolean;
    liquidityScore?: number;
    pumpDumpRiskScore?: number;
    walletDistributionScore?: number;
    stats?: {
      priceChange24h?: number;
    };
  };
}

const TokenAnalyticsCard: React.FC<TokenAnalyticsCardProps> = ({ token }) => {
  const router = useRouter();
  const { watchlist, addToWatchlist } = useTokenStore();
  
  const isInWatchlist = watchlist.some(w => w.id === token.id);
  
  // Create a token object with required exchange field
  const tokenForWatchlist = {
    ...token,
    exchange: token.exchange || 'Unknown'
  };

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === 0) return '-';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  const getPriceChangeColor = (change: number | undefined) => {
    if (change === undefined) return 'text-gray-400';
    return change >= 0 ? 'text-green-400' : 'text-red-400';
  };

  const getPriceChangeIcon = (change: number | undefined) => {
    if (change === undefined || change === 0) return null;
    return change > 0 ? <FaArrowUp className="inline w-3 h-3 ml-1" /> : <FaArrowDown className="inline w-3 h-3 ml-1" />;
  };

  const getHealthIndicator = () => {
    const scores = [];
    if (token.liquidityScore !== undefined) scores.push(token.liquidityScore);
    if (token.walletDistributionScore !== undefined) scores.push(token.walletDistributionScore);
    if (token.pumpDumpRiskScore !== undefined) scores.push(100 - token.pumpDumpRiskScore);
    
    if (scores.length === 0) return null;
    
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    if (avgScore >= 70) return { color: 'bg-green-500', label: 'Excellent' };
    if (avgScore >= 50) return { color: 'bg-yellow-500', label: 'Good' };
    if (avgScore >= 30) return { color: 'bg-orange-500', label: 'Fair' };
    return { color: 'bg-red-500', label: 'Poor' };
  };

  const healthIndicator = getHealthIndicator();

  return (
    <div className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all duration-200 border border-gray-700 hover:border-gray-600">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center">
            {token.symbol}
            {token.exchange && (
              <span className="ml-2 text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
                {token.exchange}
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400">{token.name}</p>
          <p className="text-xs text-gray-500 capitalize">{token.category}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addToWatchlist(tokenForWatchlist as any);
            }}
            className={`p-2 rounded-full transition-colors ${
              isInWatchlist ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
            title={isInWatchlist ? 'In watchlist' : 'Add to watchlist'}
          >
            <FaStar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Price and Change */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white">{formatNumber(token.price)}</span>
          {token.stats?.priceChange24h !== undefined && (
            <span className={`text-sm font-medium ${getPriceChangeColor(token.stats.priceChange24h)}`}>
              {token.stats.priceChange24h >= 0 ? '+' : ''}{formatPercentage(token.stats.priceChange24h)}
              {getPriceChangeIcon(token.stats.priceChange24h)}
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Market Cap</p>
          <p className="text-sm font-semibold text-white">{formatNumber(token.marketCap)}</p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">24h Volume</p>
          <p className="text-sm font-semibold text-white">{formatNumber(token.volume24h)}</p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Vol/MCap Ratio</p>
          <p className="text-sm font-semibold text-white">
            {token.volumeMarketCapRatio !== undefined ? formatPercentage(token.volumeMarketCapRatio * 100) : '-'}
          </p>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <p className="text-xs text-gray-400 mb-1">Health Score</p>
          {healthIndicator && (
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${healthIndicator.color} mr-2`}></div>
              <p className="text-sm font-semibold text-white">{healthIndicator.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Risk Indicator */}
      <div className="mb-4">
        <RiskIndicator
          pumpDumpRiskScore={token.pumpDumpRiskScore}
          liquidityScore={token.liquidityScore}
          walletDistributionScore={token.walletDistributionScore}
          isVolumeHealthy={token.isVolumeHealthy}
          volumeMarketCapRatio={token.volumeMarketCapRatio}
        />
      </div>

      {/* Analytics Scores */}
      <div className="space-y-2 mb-4">
        {token.liquidityScore !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Liquidity</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
                <div
                  className={`h-2 rounded-full ${
                    token.liquidityScore >= 70 ? 'bg-green-500' : 
                    token.liquidityScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${token.liquidityScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-white">{token.liquidityScore.toFixed(0)}</span>
            </div>
          </div>
        )}
        {token.walletDistributionScore !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Distribution</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
                <div
                  className={`h-2 rounded-full ${
                    token.walletDistributionScore >= 70 ? 'bg-green-500' : 
                    token.walletDistributionScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${token.walletDistributionScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-white">{token.walletDistributionScore.toFixed(0)}</span>
            </div>
          </div>
        )}
        {token.pumpDumpRiskScore !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">P&D Risk</span>
            <div className="flex items-center">
              <div className="w-24 bg-gray-700 rounded-full h-2 mr-2">
                <div
                  className={`h-2 rounded-full ${
                    token.pumpDumpRiskScore <= 30 ? 'bg-green-500' : 
                    token.pumpDumpRiskScore <= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${token.pumpDumpRiskScore}%` }}
                ></div>
              </div>
              <span className="text-xs text-white">{token.pumpDumpRiskScore.toFixed(0)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => router.push(`/tokens/${token.id}`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium flex items-center justify-center"
        >
          <FaChartLine className="mr-2" />
          View Details
        </button>
        <button
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
        >
          Trade
        </button>
      </div>
    </div>
  );
};

export default TokenAnalyticsCard;
