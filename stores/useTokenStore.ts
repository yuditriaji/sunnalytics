import { create } from 'zustand';
import localforage from 'localforage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Token {
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
  stats?: {
    priceChange24h?: number;
    volatilityScore24h?: number;
    liquidityScore?: number;
  };
}

interface TokenState {
  tokens: Token[];
  filteredTokens: Token[];
  loading: boolean;
  error: string | null;
  setTokens: (tokens: Token[]) => void;
  setFilteredTokens: (tokens: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTokens: () => void; // Kept for manual triggering if needed
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set) => ({
      tokens: [],
      filteredTokens: [],
      loading: false,
      error: null,
      setTokens: (tokens: Token[]) => set({ tokens }),
      setFilteredTokens: (tokens: Token[]) => set({ filteredTokens: tokens }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      fetchTokens: () => {}, // Placeholder, will be triggered by useTokenData
    }),
    {
      name: 'token-store',
      storage: createJSONStorage(() => localforage),
    }
  )
);