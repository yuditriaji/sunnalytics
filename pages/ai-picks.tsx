// pages/ai-picks.tsx
import React, { useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';

// Define the Token type if not imported from elsewhere
type Token = {
  id: string;
  symbol: string;
  volumeMarketCapRatio?: number;
  liquidityScore?: number;
  // Add other properties as needed
};

export default function AIPicks() {
  const { tokens, setFilteredTokens } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const router = useRouter();

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const getBoomingTokens = (tokens: Token[]) => {
    return tokens
      .filter(token => token.volumeMarketCapRatio !== undefined && token.liquidityScore !== undefined)
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
      <p className="mb-4">Top 5 potential booming tokens based on volume/market cap ratio and liquidity score:</p>
      {boomingTokens.length > 0 ? (
        <ul className="space-y-2">
          {boomingTokens.map(token => (
            <li key={token.id} className="bg-gray-800 p-2 rounded shadow-sm hover:bg-gray-700 cursor-pointer" onClick={() => router.push(`/tokens/${token.id}`)}>
              {token.symbol} - Vol/Mkt Cap: {(token.volumeMarketCapRatio || 0 * 100).toFixed(2)}%, Liquidity: {(token.liquidityScore || 0).toFixed(2)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-400">No tokens available for analysis.</p>
      )}
      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}