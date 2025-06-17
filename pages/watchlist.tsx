// pages/watchlist.tsx
import React, { useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
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

export default function Watchlist() {
  const { watchlist, fetchTokens } = useTokenStore();
  const router = useRouter();

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const formatNumber = (value: number | undefined, suffix: string = ''): string => {
    if (value === undefined || value === 0) return '-';
    if (value >= 1e9) return `$${Math.floor(value / 1e9)}${suffix}B`;
    if (value >= 1e6) return `$${Math.floor(value / 1e6)}${suffix}M`;
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatRatio = (value: number | undefined) => value !== undefined ? `${(value * 100).toFixed(2)}%` : '-';
  const formatBoolean = (value: boolean | undefined) => value !== undefined ? (value ? 'Yes' : 'No') : '-';
  const formatScore = (value: number | undefined) => value !== undefined ? value.toFixed(2) : '-';

  return (
    <div className="min-h-screen flex flex-col p-4 bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Watchlist</h1>
      {watchlist.length > 0 ? (
        <ul className="space-y-4">
          {watchlist.map((token: Token) => (
            <li
              key={token.id}
              className="bg-gray-800 p-4 rounded-lg shadow-sm hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => router.push(`/tokens/${token.id}`)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{token.symbol}</h2>
                  <p className="text-sm text-gray-400">{token.name} - {token.category}</p>
                </div>
                <div className="mt-2 sm:mt-0 space-y-1">
                  <p>Price: {formatNumber(token.price)}</p>
                  <p>Market Cap: {formatNumber(token.marketCap)}</p>
                  <p>Volume (24h): {formatNumber(token.volume24h)}</p>
                  <p>Vol/Mkt Cap: {formatRatio(token.volumeMarketCapRatio)}</p>
                  <p>Health: {formatBoolean(token.isVolumeHealthy)}</p>
                  <p>Liquidity Score: {formatScore(token.liquidityScore)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tokens in watchlist. Add tokens from the Market page.</p>
      )}
      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}