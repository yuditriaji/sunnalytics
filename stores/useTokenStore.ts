// stores/useTokenStore.ts
import { create } from 'zustand';
import localforage from 'localforage';
import { persist, createJSONStorage } from 'zustand/middleware';

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

interface TokenState {
  tokens: Token[];
  filteredTokens: Token[];
  watchlist: Token[];
  loading: boolean;
  error: string | null;
  setTokens: (tokens: Token[]) => void;
  setFilteredTokens: (tokens: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTokens: () => void;
  addToWatchlist: (token: Token) => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],
      filteredTokens: [],
      watchlist: [],
      loading: false,
      error: null,
      setTokens: (tokens: Token[]) => set({ tokens }),
      setFilteredTokens: (tokens: Token[]) => set({ filteredTokens: tokens }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      fetchTokens: async () => {
        set({ loading: true, error: null });
        try {
          // Replace with your actual backend API endpoint
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens`, {
            method: 'GET',
            headers: {
              // Add authentication headers if required (e.g., Authorization: `Bearer ${yourToken}`)
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          // Map the backend response to the Token interface
          const tokens: Token[] = data.map((item: any) => ({
            id: item.id || item._id, // Adjust based on your backend's ID field
            name: item.name,
            symbol: item.symbol,
            category: item.category || 'Unknown',
            price: item.price,
            marketCap: item.marketCap,
            volume24h: item.volume24h,
            volumeMarketCapRatio: item.volumeMarketCapRatio,
            isVolumeHealthy: item.isVolumeHealthy,
            liquidityScore: item.liquidityScore,
            // Add other fields as needed based on your backend response
          }));

          set({ tokens, filteredTokens: tokens, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch tokens', loading: false });
        }
      },
      addToWatchlist: (token: Token) => set((state) => ({
        watchlist: state.watchlist.some((w: Token) => w.id === token.id) ? state.watchlist : [...state.watchlist, token],
      })),
    }),
    {
      name: 'token-store',
      storage: createJSONStorage(() => localforage),
    }
  )
);