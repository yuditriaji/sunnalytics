import { create } from 'zustand';
import localforage from 'localforage';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Token {
  id: string;
  name: string;
  symbol: string;
  exchange: string;
  category: string;
  chain?: string;
  contractAddress?: string;
  marketCap?: number;
  volume24h?: number;
  price?: number;
  transferVolume24h?: number;
  fullyDilutedValuation?: number;
  fdv?: number; // Alias for fullyDilutedValuation
  volumeMarketCapRatio?: number;
  circulatingSupplyPercentage?: number;
  totalSupply?: number;
  circulatingSupply?: number;
  isVolumeHealthy?: boolean;
  isCirculatingSupplyGood?: boolean;
  potentialMultiplier?: number;
  rank?: number;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  sentimentScore?: number;
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
  scrollPosition: number;
  setTokens: (tokens: Token[]) => void;
  setFilteredTokens: (tokens: Token[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortConfig: (config: { key: keyof Token; direction: 'asc' | 'desc' } | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  setActiveTab: (tab: string) => void;
  setVisibleColumns: (columns: string[]) => void;
  setScrollPosition: (position: number) => void;
  fetchTokens: () => void;
  addToWatchlist: (token: Token) => void;
  applyFilters: () => void;
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
      visibleColumns: [],
      scrollPosition: 0,
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
      setScrollPosition: (position: number) => set({ scrollPosition: position }),
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
            exchange: item.exchange || 'Unknown',
            category: item.category || 'Unknown',
            price: item.price,
            marketCap: item.marketCap,
            volume24h: item.volume24h,
            transferVolume24h: item.transferVolume24h,
            fullyDilutedValuation: item.fullyDilutedValuation || item.fdv,
            fdv: item.fdv || item.fullyDilutedValuation,
            volumeMarketCapRatio: item.volumeMarketCapRatio,
            circulatingSupplyPercentage: item.circulatingSupplyPercentage,
            totalSupply: item.totalSupply,
            circulatingSupply: item.circulatingSupply,
            isVolumeHealthy: item.isVolumeHealthy,
            isCirculatingSupplyGood: item.isCirculatingSupplyGood,
            potentialMultiplier: item.potentialMultiplier,
            rank: item.rank,
            liquidityScore: item.liquidityScore,
            pumpDumpRiskScore: item.pumpDumpRiskScore,
            walletDistributionScore: item.walletDistributionScore,
            sentimentScore: item.sentimentScore,
            updatedAt: item.updatedAt,
            stats: {
              priceChange24h: item.stats?.priceChange24h || item.priceChange24h,
              volatilityScore24h: item.stats?.volatilityScore24h || item.volatilityScore24h,
              liquidityScore: item.stats?.liquidityScore || item.liquidityScore,
            },
          }));

          // Only update if we have valid data to prevent blinking
          if (tokens.length > 0) {
            set({ tokens, filteredTokens: tokens, loading: false });
          } else {
            set({ loading: false });
          }
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
      applyFilters: () => {
        const state = get();
        let filtered = [...state.tokens];

        // Apply search
        if (state.searchQuery) {
          filtered = filtered.filter(
            token =>
              token.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
              token.symbol.toLowerCase().includes(state.searchQuery.toLowerCase())
          );
        }

        // Apply filters from AdvancedFilters component
        if (state.filters.category) {
          filtered = filtered.filter(token => token.category === state.filters.category);
        }
        if (state.filters.minPrice) {
          const min = parseFloat(state.filters.minPrice);
          filtered = filtered.filter(token => token.price !== undefined && token.price >= min);
        }
        if (state.filters.maxPrice) {
          const max = parseFloat(state.filters.maxPrice);
          filtered = filtered.filter(token => token.price !== undefined && token.price <= max);
        }
        if (state.filters.minVolumeMarketCapRatio) {
          const min = parseFloat(state.filters.minVolumeMarketCapRatio);
          filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio >= min);
        }
        if (state.filters.maxVolumeMarketCapRatio) {
          const max = parseFloat(state.filters.maxVolumeMarketCapRatio);
          filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio <= max);
        }
        if (state.filters.minCirculatingSupplyPercentage) {
          const min = parseFloat(state.filters.minCirculatingSupplyPercentage);
          filtered = filtered.filter(token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage >= min);
        }
        if (state.filters.maxCirculatingSupplyPercentage) {
          const max = parseFloat(state.filters.maxCirculatingSupplyPercentage);
          filtered = filtered.filter(token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage <= max);
        }
        if (state.filters.isVolumeHealthy === 'true') {
          filtered = filtered.filter(token => token.isVolumeHealthy === true);
        } else if (state.filters.isVolumeHealthy === 'false') {
          filtered = filtered.filter(token => token.isVolumeHealthy === false);
        }
        if (state.filters.isCirculatingSupplyGood === 'true') {
          filtered = filtered.filter(token => token.isCirculatingSupplyGood === true);
        } else if (state.filters.isCirculatingSupplyGood === 'false') {
          filtered = filtered.filter(token => token.isCirculatingSupplyGood === false);
        }

        // Apply sorting
        if (state.sortConfig) {
          filtered = [...filtered].sort((a, b) => {
            const aValue = a[state.sortConfig!.key];
            const bValue = b[state.sortConfig!.key];
            if (aValue === undefined || bValue === undefined) return 0;
            if (state.sortConfig!.direction === 'asc') {
              return aValue > bValue ? 1 : -1;
            }
            return aValue < bValue ? 1 : -1;
          });
        }

        set({ filteredTokens: filtered });
      },
    }),
    {
      name: 'token-store',
      storage: createJSONStorage(() => localforage),
    }
  )
);