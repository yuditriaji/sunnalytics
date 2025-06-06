import useSWR from 'swr';

const API_BASE_URL = 'http://localhost:3001';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    throw error;
  }
  return res.json();
};

export function useTokens(category?: string) {
  const url = category
    ? `${API_BASE_URL}/tokens?category=${category}`
    : `${API_BASE_URL}/tokens`;
  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false,
  });
  return { tokens: data, error, isLoading };
}

export async function refreshTokens() {
  const res = await fetch(`${API_BASE_URL}/tokens/refresh`, { method: 'POST' });
  if (!res.ok) {
    throw new Error('Failed to refresh tokens');
  }
  return res.json();
}
