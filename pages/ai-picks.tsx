import React, { useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';

// Define the Token type
type Token = {
  id: string;
  symbol: string;
  exchange?: string;
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

function formatDate(dateString?: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).replace(',', '');
}

export default function AIPicks() {
  const { tokens, setFilteredTokens } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const router = useRouter();

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const getBoomingTokens = (tokens: Token[]) => {
    return tokens
      .filter(token => 
        token.exchange &&
        ['binance', 'bybit_spot'].includes(token.exchange.toLowerCase()) &&
        token.volumeMarketCapRatio !== undefined &&
        token.liquidityScore !== undefined &&
        token.pumpDumpRiskScore !== undefined &&
        token.walletDistributionScore !== undefined &&
        token.liquidityScore > 50 &&
        token.pumpDumpRiskScore < 30 &&
        token.walletDistributionScore > 70 &&
        token.isVolumeHealthy
      )
      .sort((a, b) => {
        const aScore = (a.volumeMarketCapRatio || 0) * (a.liquidityScore || 0);
        const bScore = (b.volumeMarketCapRatio || 0) * (b.liquidityScore || 0);
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  const boomingTokens = getBoomingTokens(tokens);

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">AI Picks</h1>
      <p className="mb-4">Top 5 potential booming tokens from Binance and Bybit Spot based on volume/market cap ratio and liquidity score:</p>
      {boomingTokens.length > 0 ? (
        <ul className="space-y-2">
          {boomingTokens.map(token => (
            <li 
              key={token.id} 
              className="bg-gray-800 p-2 rounded shadow-sm hover:bg-gray-700 cursor-pointer" 
              onClick={() => router.push(`/tokens/${token.id}`)}
              role="button"
              aria-label={`View details for ${token.symbol}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{token.symbol}</span>
                <span className="text-sm text-gray-300">Exchange: {token.exchange || 'N/A'}</span>
              </div>
              <div className="text-sm">
                Vol/Mkt Cap: {(token.volumeMarketCapRatio || 0 * 100).toFixed(2)}%, 
                Liquidity: {(token.liquidityScore || 0).toFixed(2)}, 
                Pump/Dump Risk: {token.pumpDumpRiskScore}, 
                Wallet Distribution: {token.walletDistributionScore}
              </div>
              <div className="text-xs text-gray-400 mt-1">Updated: {formatDate(token.updatedAt)}</div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tokens available from Binance or Bybit Spot for analysis.</p>
      )}
      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}