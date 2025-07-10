import { useEffect } from 'react';
import useSWR from 'swr';
import { useTokenStore } from '../stores/useTokenStore';

interface Token {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  category: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  transferVolume24h?: number;
  createdAt: string;
  updatedAt: string;
  volatilityScore24h?: number;
  fullyDilutedValuation?: number;
  volumeMarketCapRatio?: number;
  circulatingSupplyPercentage?: number;
  isVolumeHealthy?: boolean;
  isCirculatingSupplyGood?: boolean;
  potentialMultiplier?: number;
  socialSentimentScore?: number; // New field for potential backend update
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  rank?: number;
  stats?: {
    priceChange24h?: number;
    volatilityScore24h?: number;
    liquidityScore?: number;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const fetcher = async (url: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const error = new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    error.message = await res.text().catch(() => 'Unknown server error');
    throw error;
  }
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [data];
};

export function useTokenData(page: number = 1, limit: number = 50, category?: string) {
  const { setTokens, setFilteredTokens, setLoading, setError, fetchTokens } = useTokenStore();

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
  }).toString();

  const url = `${API_BASE_URL}/api/tokens?${queryParams}`;

  const { data, error, isLoading } = useSWR<Token[]>(url, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60000, // Refresh every minute
    dedupingInterval: 30000, // Dedupe requests within 30 seconds
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  useEffect(() => {
    setLoading(isLoading);
    if (error) {
      setError(error.message || 'An error occurred while fetching tokens');
    } else if (data) {
      setTokens(data);
      setFilteredTokens(data);
      setError(null);
    }
  }, [data, error, isLoading, setTokens, setFilteredTokens, setLoading, setError]);

  return { fetchTokens, isLoading, error, tokens: data };
}