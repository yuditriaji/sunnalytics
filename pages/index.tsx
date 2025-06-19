import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import TabbedFilters from '../components/TabbedFilters';

export default function Home() {
  const { loading, error, fetchTokens, searchQuery, sortConfig, filters, activeTab, setFilteredTokens, tokens } =
    useTokenStore();
  const { fetchTokens: fetchData } = useTokenData();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let filtered = [...tokens];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        token =>
          token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== 'all') {
      filtered = filtered.filter(token => token.category.toLowerCase() === activeTab);
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(token => token.category === filters.category);
    }
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      filtered = filtered.filter(token => token.price !== undefined && token.price >= min);
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      filtered = filtered.filter(token => token.price !== undefined && token.price <= max);
    }
    if (filters.minVolumeMarketCapRatio) {
      const min = parseFloat(filters.minVolumeMarketCapRatio) / 100;
      filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio >= min);
    }
    if (filters.maxVolumeMarketCapRatio) {
      const max = parseFloat(filters.maxVolumeMarketCapRatio) / 100;
      filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio <= max);
    }
    if (filters.minCirculatingSupplyPercentage) {
      const min = parseFloat(filters.minCirculatingSupplyPercentage);
      filtered = filtered.filter(
        token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage >= min
      );
    }
    if (filters.maxCirculatingSupplyPercentage) {
      const max = parseFloat(filters.maxCirculatingSupplyPercentage);
      filtered = filtered.filter(
        token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage <= max
      );
    }
    if (filters.isVolumeHealthy === 'true') {
      filtered = filtered.filter(token => token.isVolumeHealthy === true);
    } else if (filters.isVolumeHealthy === 'false') {
      filtered = filtered.filter(token => token.isVolumeHealthy === false);
    }
    if (filters.isCirculatingSupplyGood === 'true') {
      filtered = filtered.filter(token => token.isCirculatingSupplyGood === true);
    } else if (filters.isCirculatingSupplyGood === 'false') {
      filtered = filtered.filter(token => token.isCirculatingSupplyGood === false);
    }

    // Apply sorting
    if (sortConfig) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue === undefined || bValue === undefined) return 0;
        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    setFilteredTokens(filtered);
  }, [searchQuery, activeTab, filters, sortConfig, tokens, setFilteredTokens]);

  const handleFilterClick = () => {
    setIsFilterDrawerOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-safe-area-inset-bottom bg-gray-900 text-white">
      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Market</h1>
          <div className="text-sm text-gray-400">Watchlist</div>
        </div>
        <TabbedFilters />
        {loading && <p className="text-center text-gray-400">Loading tokens...</p>}
        {error && (
          <p className="text-center text-red-500">
            Error: {error}{' '}
            <button onClick={fetchTokens} className="text-blue-500 underline">
              Retry
            </button>
          </p>
        )}
        {!loading && !error && (
          <TokenTable
            isFilterDrawerOpen={isFilterDrawerOpen}
            onFilterClick={handleFilterClick}
            onFilterClose={handleFilterClose}
          />
        )}
      </main>
      <BottomNav onFilterClick={handleFilterClick} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}