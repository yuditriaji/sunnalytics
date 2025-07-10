import React, { useEffect, useState, useMemo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import RiskIndicator from '../components/RiskIndicator';
import { FaRobot, FaChartLine, FaInfoCircle, FaStar, FaExclamationTriangle } from 'react-icons/fa';

// Define the Token type
type Token = {
  id: string;
  symbol: string;
  name: string;
  category: string;
  exchange: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  updatedAt?: string;
  volumeMarketCapRatio?: number;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  isVolumeHealthy?: boolean;
  stats?: {
    priceChange24h?: number;
    liquidityScore?: number;
  };
};

interface AIScore {
  token: Token;
  totalScore: number;
  volumeScore: number;
  liquidityScore: number;
  riskScore: number;
  distributionScore: number;
  confidence: number;
}

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(',', '');
}

export default function AIPicks() {
  const { tokens, setFilteredTokens, loading, error } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCriteria, setSelectedCriteria] = useState<'conservative' | 'balanced' | 'aggressive'>('balanced');

  useEffect(() => {
    const loadTokens = async () => {
      setIsLoading(true);
      try {
        await fetchTokens();
      } catch (err) {
        console.error('Error fetching tokens:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadTokens();
  }, [fetchTokens]);

  const calculateAIScore = (token: Token): AIScore | null => {
    if (!token.volumeMarketCapRatio || !token.liquidityScore || 
        token.pumpDumpRiskScore === undefined || !token.walletDistributionScore) {
      return null;
    }

    // Volume score (0-100) - higher volume/market cap ratio is better
    const volumeScore = Math.min(token.volumeMarketCapRatio * 100, 100);

    // Liquidity score (0-100) - already provided
    const liquidityScore = token.liquidityScore;

    // Risk score (0-100) - inverse of pump/dump risk
    const riskScore = 100 - token.pumpDumpRiskScore;

    // Distribution score (0-100) - already provided
    const distributionScore = token.walletDistributionScore;

    // Calculate weighted total score based on criteria
    let weights = { volume: 0.25, liquidity: 0.25, risk: 0.25, distribution: 0.25 };
    
    if (selectedCriteria === 'conservative') {
      weights = { volume: 0.15, liquidity: 0.3, risk: 0.35, distribution: 0.2 };
    } else if (selectedCriteria === 'aggressive') {
      weights = { volume: 0.35, liquidity: 0.2, risk: 0.15, distribution: 0.3 };
    }

    const totalScore = 
      volumeScore * weights.volume +
      liquidityScore * weights.liquidity +
      riskScore * weights.risk +
      distributionScore * weights.distribution;

    // Calculate confidence based on data completeness and score consistency
    const scores = [volumeScore, liquidityScore, riskScore, distributionScore];
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length;
    const consistency = 100 - Math.min(variance / 10, 100);
    
    const confidence = (consistency + (token.isVolumeHealthy ? 20 : 0)) / 1.2;

    return {
      token,
      totalScore,
      volumeScore,
      liquidityScore,
      riskScore,
      distributionScore,
      confidence: Math.min(confidence, 100),
    };
  };

  const aiPicks = useMemo(() => {
    const scoredTokens = tokens
      .filter(token => 
        token.exchange &&
        ['binance', 'bybit_spot'].includes(token.exchange.toLowerCase())
      )
      .map(calculateAIScore)
      .filter((score): score is AIScore => score !== null)
      .sort((a, b) => b.totalScore - a.totalScore);

    // Apply different thresholds based on criteria
    let minScore = 60;
    if (selectedCriteria === 'conservative') minScore = 70;
    if (selectedCriteria === 'aggressive') minScore = 50;

    return scoredTokens
      .filter(score => score.totalScore >= minScore)
      .slice(0, 10);
  }, [tokens, selectedCriteria]);

  useEffect(() => {
    if (tokens.length > 0) {
      setFilteredTokens(aiPicks.map(pick => pick.token));
    }
  }, [tokens, aiPicks, setFilteredTokens]);

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === 0) return '-';
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-900 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <FaRobot className="mr-3 text-yellow-400" />
          AI-Powered Token Analysis
        </h1>
        <p className="text-gray-400">
          Advanced algorithmic selection based on multiple analytical factors
        </p>
      </div>

      {/* AI Criteria Selector */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center">
          <FaInfoCircle className="mr-2 text-blue-400" />
          Investment Strategy
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedCriteria('conservative')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCriteria === 'conservative'
                ? 'border-green-500 bg-green-500 bg-opacity-20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <h3 className="font-semibold text-green-400">Conservative</h3>
            <p className="text-xs text-gray-400 mt-1">
              Focus on stability, low risk, and proven liquidity
            </p>
          </button>
          <button
            onClick={() => setSelectedCriteria('balanced')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCriteria === 'balanced'
                ? 'border-yellow-500 bg-yellow-500 bg-opacity-20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <h3 className="font-semibold text-yellow-400">Balanced</h3>
            <p className="text-xs text-gray-400 mt-1">
              Equal weight on all factors for optimal risk/reward
            </p>
          </button>
          <button
            onClick={() => setSelectedCriteria('aggressive')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedCriteria === 'aggressive'
                ? 'border-red-500 bg-red-500 bg-opacity-20'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <h3 className="font-semibold text-red-400">Aggressive</h3>
            <p className="text-xs text-gray-400 mt-1">
              High volume focus with potential for rapid gains
            </p>
          </button>
        </div>
      </div>

      {/* Scoring Explanation */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold mb-2 text-gray-300">AI Scoring Methodology</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-blue-400">Volume Score:</span>
            <p className="text-gray-400">Trading volume relative to market cap</p>
          </div>
          <div>
            <span className="text-green-400">Liquidity Score:</span>
            <p className="text-gray-400">Market depth and trading ease</p>
          </div>
          <div>
            <span className="text-yellow-400">Risk Score:</span>
            <p className="text-gray-400">Inverse of pump & dump probability</p>
          </div>
          <div>
            <span className="text-purple-400">Distribution:</span>
            <p className="text-gray-400">Token holder decentralization</p>
          </div>
        </div>
      </div>

      {/* AI Picks */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          <p className="mt-4 text-gray-400">Analyzing market data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button onClick={() => fetchTokens()} className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors">
            Retry
          </button>
        </div>
      ) : aiPicks.length > 0 ? (
        <div className="space-y-4">
          {aiPicks.map((pick, index) => (
            <div
              key={pick.token.id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-all cursor-pointer border border-gray-700 hover:border-gray-600"
              onClick={() => router.push(`/tokens/${pick.token.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl font-bold text-yellow-400">#{index + 1}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{pick.token.symbol}</h3>
                      <p className="text-sm text-gray-400">{pick.token.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">{pick.token.exchange}</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded capitalize">{pick.token.category}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">{formatNumber(pick.token.price)}</p>
                  <p className="text-sm text-gray-400">Market Cap: {formatNumber(pick.token.marketCap)}</p>
                </div>
              </div>

              {/* AI Score Breakdown */}
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-gray-300">AI Score Breakdown</h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-yellow-400">{pick.totalScore.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Volume Activity</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${pick.volumeScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white w-10 text-right">{pick.volumeScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Liquidity</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-green-500"
                          style={{ width: `${pick.liquidityScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white w-10 text-right">{pick.liquidityScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Safety Score</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-yellow-500"
                          style={{ width: `${pick.riskScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white w-10 text-right">{pick.riskScore.toFixed(0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Distribution</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-purple-500"
                          style={{ width: `${pick.distributionScore}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white w-10 text-right">{pick.distributionScore.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-600 flex justify-between items-center">
                  <span className="text-xs text-gray-400">AI Confidence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pick.confidence >= 80 ? 'bg-green-500' : 
                          pick.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pick.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-white">{pick.confidence.toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Indicator */}
              <div className="flex justify-between items-center">
                <RiskIndicator
                  pumpDumpRiskScore={pick.token.pumpDumpRiskScore}
                  liquidityScore={pick.token.liquidityScore}
                  walletDistributionScore={pick.token.walletDistributionScore}
                  isVolumeHealthy={pick.token.isVolumeHealthy}
                  volumeMarketCapRatio={pick.token.volumeMarketCapRatio}
                />
                <div className="text-xs text-gray-400">
                  Updated: {formatDate(pick.token.updatedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <FaExclamationTriangle className="text-4xl text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">No tokens currently meet the AI criteria</p>
          <p className="text-sm text-gray-500">Try adjusting to a more aggressive strategy or check back later</p>
        </div>
      )}

      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}
