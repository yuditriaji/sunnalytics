import useSWR from 'swr';

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
    const error = new Error(`An error occurred while fetching the data: ${res.status} ${res.statusText}`);
    error.message = await res.text().catch(() => 'Unknown server error');
    throw error;
  }
  const data = await res.json();
  return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : data;
};

export function useTokens(category?: string, page: number = 1, limit: number = 50) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(category && { category }),
  }).toString();

  const url = `${API_BASE_URL}/api/tokens?${queryParams}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false,
    dedupingInterval: 30000,
    errorRetryCount: 3,
    errorRetryInterval: 5000,
  });

  return { tokens: data, error: error?.message, isLoading };
}

export async function refreshTokens() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  const res = await fetch(`${API_BASE_URL}/api/tokens/refresh`, { 
    method: 'POST',
    headers,
  });
  if (!res.ok) {
    const error = new Error(`Failed to refresh tokens: ${res.status} ${res.statusText}`);
    error.message = await res.text().catch(() => 'Unknown server error');
    throw error;
  }
  return res.json();
}

export async function fetchTokenHistory(tokenId: string, timeframe: string = '7d') {
  const url = `${API_BASE_URL}/api/tokens/${tokenId}/history?timeframe=${timeframe}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const error = new Error(`Failed to fetch token history: ${res.status} ${res.statusText}`);
    error.message = await res.text().catch(() => 'Unknown server error');
    throw error;
  }
  return res.json();
}