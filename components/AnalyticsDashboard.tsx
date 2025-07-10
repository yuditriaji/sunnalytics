import React, { useMemo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { FaArrowUp, FaArrowDown, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

interface MarketMetrics {
  totalMarketCap: number;
  totalVolume24h: number;
  avgVolumeMarketCapRatio: number;
  healthyTokensPercentage: number;
  highRiskTokensCount: number;
  topGainers: any[];
  topLosers: any[];
  volumeAnomalies: any[];
}

const AnalyticsDashboard: React.FC = () => {
  const { tokens } = useTokenStore();

  const metrics: MarketMetrics = useMemo(() => {
    if (!tokens || tokens.length === 0) {
      return {
        totalMarketCap: 0,
        totalVolume24h: 0,
        avgVolumeMarketCapRatio: 0,
        healthyTokensPercentage: 0,
        highRiskTokensCount: 0,
        topGainers: [],
        topLosers: [],
        volumeAnomalies: [],
      };
    }

    const totalMarketCap = tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0);
    const totalVolume24h = tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
    
    const tokensWithRatio = tokens.filter(t => t.volumeMarketCapRatio !== undefined);
    const avgVolumeMarketCapRatio = tokensWithRatio.length > 0
      ? tokensWithRatio.reduce((sum, token) => sum + (token.volumeMarketCapRatio || 0), 0) / tokensWithRatio.length
      : 0;

    const healthyTokens = tokens.filter(t => t.isVolumeHealthy === true);
    const healthyTokensPercentage = (healthyTokens.length / tokens.length) * 100;

    const highRiskTokens = tokens.filter(t => 
      (t.pumpDumpRiskScore && t.pumpDumpRiskScore > 70) ||
      (t.liquidityScore && t.liquidityScore < 30) ||
      (t.walletDistributionScore && t.walletDistributionScore < 30)
    );

    // Volume anomalies (tokens with unusually high volume/market cap ratio)
    const volumeAnomalies = tokens
      .filter(t => t.volumeMarketCapRatio && t.volumeMarketCapRatio > 1.5)
      .sort((a, b) => (b.volumeMarketCapRatio || 0) - (a.volumeMarketCapRatio || 0))
      .slice(0, 5);

    // Mock top gainers/losers (in real app, this would compare with historical data)
    const topGainers = tokens
      .filter(t => t.price && t.stats?.priceChange24h && t.stats.priceChange24h > 0)
      .sort((a, b) => (b.stats?.priceChange24h || 0) - (a.stats?.priceChange24h || 0))
      .slice(0, 5);

    const topLosers = tokens
      .filter(t => t.price && t.stats?.priceChange24h && t.stats.priceChange24h < 0)
      .sort((a, b) => (a.stats?.priceChange24h || 0) - (b.stats?.priceChange24h || 0))
      .slice(0, 5);

    return {
      totalMarketCap,
      totalVolume24h,
      avgVolumeMarketCapRatio,
      healthyTokensPercentage,
      highRiskTokensCount: highRiskTokens.length,
      topGainers,
      topLosers,
      volumeAnomalies,
    };
  }, [tokens]);

  const formatNumber = (value: number): string => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
        <FaChartLine className="mr-2" />
        Market Analytics Dashboard
      </h2>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Total Market Cap</h3>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalMarketCap)}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">24h Volume</h3>
          <p className="text-2xl font-bold text-white">{formatNumber(metrics.totalVolume24h)}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Avg Vol/MCap Ratio</h3>
          <p className="text-2xl font-bold text-white">{formatPercentage(metrics.avgVolumeMarketCapRatio * 100)}</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm text-gray-400 mb-1">Healthy Tokens</h3>
          <p className="text-2xl font-bold text-green-400">{formatPercentage(metrics.healthyTokensPercentage)}</p>
        </div>
      </div>

      {/* Risk Alert */}
      {metrics.highRiskTokensCount > 0 && (
        <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-6 flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3 text-xl" />
          <div>
            <h3 className="text-red-400 font-semibold">Risk Alert</h3>
            <p className="text-gray-300 text-sm">
              {metrics.highRiskTokensCount} tokens showing high risk indicators (pump/dump risk, low liquidity, or poor wallet distribution)
            </p>
          </div>
        </div>
      )}

      {/* Market Movers and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-400 flex items-center">
            <FaArrowUp className="mr-2" />
            Top Gainers
          </h3>
          {metrics.topGainers.length > 0 ? (
            <ul className="space-y-2">
              {metrics.topGainers.map((token, index) => (
                <li key={token.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{token.symbol}</span>
                  <span className="text-green-400 font-semibold">
                    +{formatPercentage(token.stats?.priceChange24h || 0)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No gainers data available</p>
          )}
        </div>

        {/* Top Losers */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-red-400 flex items-center">
            <FaArrowDown className="mr-2" />
            Top Losers
          </h3>
          {metrics.topLosers.length > 0 ? (
            <ul className="space-y-2">
              {metrics.topLosers.map((token, index) => (
                <li key={token.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{token.symbol}</span>
                  <span className="text-red-400 font-semibold">
                    {formatPercentage(token.stats?.priceChange24h || 0)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No losers data available</p>
          )}
        </div>

        {/* Volume Anomalies */}
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-yellow-400 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            Volume Anomalies
          </h3>
          {metrics.volumeAnomalies.length > 0 ? (
            <ul className="space-y-2">
              {metrics.volumeAnomalies.map((token, index) => (
                <li key={token.id} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{token.symbol}</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatPercentage((token.volumeMarketCapRatio || 0) * 100)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm">No unusual volume detected</p>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2 text-white">Quick Insights</h3>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• Average volume/market cap ratio is {formatPercentage(metrics.avgVolumeMarketCapRatio * 100)}</li>
          <li>• {formatPercentage(metrics.healthyTokensPercentage)} of tokens show healthy volume patterns</li>
          {metrics.volumeAnomalies.length > 0 && (
            <li>• {metrics.volumeAnomalies.length} tokens showing unusual trading volume (potential opportunities or risks)</li>
          )}
          {metrics.highRiskTokensCount > 0 && (
            <li className="text-yellow-400">• {metrics.highRiskTokensCount} tokens flagged as high risk</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
