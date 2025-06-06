import { useEffect } from 'react';
   import useSWR from 'swr';
   import { useTokenStore } from '../stores/useTokenStore';

   interface Token {
     id: string;
     name: string;
     symbol: string;
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
   }

   const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
   const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

   const fetcher = async (url: string) => {
     const headers: HeadersInit = {};
     if (API_KEY) {
       headers['Authorization'] = `Bearer ${API_KEY}`;
     }
     const res = await fetch(url, { headers });
     if (!res.ok) {
       throw new Error(`Failed to fetch: ${res.statusText}`);
     }
     const data = await res.json();
     return Array.isArray(data) ? data : [data];
   };

   export function useTokenData() {
     const { setTokens, setFilteredTokens, setLoading, setError, fetchTokens } = useTokenStore();

     const { data, error, isLoading } = useSWR<Token[]>(`${API_BASE_URL}/tokens`, fetcher, {
       revalidateOnFocus: false,
       revalidateOnReconnect: false,
     });

     useEffect(() => {
       setLoading(isLoading);
       if (error) {
         setError(error.message || 'An unknown error occurred');
       } else if (data) {
         setTokens(data);
         setFilteredTokens(data);
         setError(null);
       }
     }, [data, error, isLoading, setTokens, setFilteredTokens, setLoading, setError]);

     return { fetchTokens };
   }