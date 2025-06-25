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
  updatedAt?: string;
  stats?: {
    priceChange24h?: number;
    volatilityScore24h?: number;
    liquidityScore?: number;
  };
}

interface FilterState {
  category: string;
  minPrice: string;
  maxPrice: string;
  minVolumeMarketCapRatio: string;
  maxVolumeMarketCapRatio: string;
  minCirculatingSupplyPercentage: string;
  maxCirculatingSupplyPercentage: string;
  isVolumeHealthy: string;
  isCirculatingSupplyGood: string;
}

interface TokenState {
  tokens: Token[];
  filteredTokens: Token[];
  watchlist: Token[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortConfig: { key: keyof Token; direction: 'asc' | 'desc' } | null;
  filters: FilterState;
  activeTab: string;
  visibleColumns: string[];
  setTokens: (tokens: Token[]) => void;
  setFilteredTokens: (tokens: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: { key: keyof Token; direction: 'asc' | 'desc' } | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setActiveTab: (tab: string) => void;
  setVisibleColumns: (columns: string[]) => void;
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
      searchQuery: '',
      sortConfig: null,
      filters: {
        category: '',
        minPrice: '',
        maxPrice: '',
        minVolumeMarketCapRatio: '',
        maxVolumeMarketCapRatio: '',
        minCirculatingSupplyPercentage: '',
        maxCirculatingSupplyPercentage: '',
        isVolumeHealthy: '',
        isCirculatingSupplyGood: '',
      },
      activeTab: 'all',
      visibleColumns: [
        'symbol',
        'price',
        'volume24h',
        'marketCap',
        'volumeMarketCapRatio',
        'isVolumeHealthy',
        'pumpDumpRiskScore',
        'liquidityScore',
        'walletDistributionScore',
      ],
      setTokens: (tokens: Token[]) => set({ tokens }),
      setFilteredTokens: (tokens: Token[]) => set({ filteredTokens: tokens }),
      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setSortConfig: (config: { key: keyof Token; direction: 'asc' | 'desc' } | null) => set({ sortConfig: config }),
      setFilters: (filters: Partial<FilterState>) =>
        set(state => ({ filters: { ...state.filters, ...filters } })),
      setActiveTab: (tab: string) => set({ activeTab: tab }),
      setVisibleColumns: (columns: string[]) => set({ visibleColumns: columns }),
      fetchTokens: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          const tokens: Token[] = data.map((item: any) => ({
            id: item.id || item._id,
            name: item.name,
            symbol: item.symbol,
            category: item.category || 'Unknown',
            price: item.price,
            marketCap: item.marketCap,
            volume24h: item.volume24h,
            volumeMarketCapRatio: item.volumeMarketCapRatio,
            isVolumeHealthy: item.isVolumeHealthy,
            pumpDumpRiskScore: item.pumpDumpRiskScore,
            liquidityScore: item.liquidityScore,
            walletDistributionScore: item.walletDistributionScore,
            transferVolume24h: item.transferVolume24h,
            updatedAt: item.updatedAt,
          }));

          set({ tokens, filteredTokens: tokens, loading: false });
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to fetch tokens', loading: false });
        }
      },
      addToWatchlist: (token: Token) =>
        set((state) => ({
          watchlist: state.watchlist.some((w: Token) => w.id === token.id)
            ? state.watchlist
            : [...state.watchlist, token],
        })),
    }),
    {
      name: 'token-store',
      storage: createJSONStorage(() => localforage),
    }
  )
);