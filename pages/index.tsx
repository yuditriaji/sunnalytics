import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import TabbedFilters from '../components/TabbedFilters';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdvancedFilters from '../components/AdvancedFilters';
import TokenAnalyticsCard from '../components/TokenAnalyticsCard';
import { FaThLarge, FaList } from 'react-icons/fa';

export default function Home() {
  const { loading, error, fetchTokens, searchQuery, sortConfig, filters, activeTab, setFilteredTokens, tokens, filteredTokens } =
    useTokenStore();
  const { fetchTokens: fetchData } = useTokenData();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showDashboard, setShowDashboard] = useState(true);

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Sunnalytics Market
          </h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`text-sm px-3 py-1 rounded transition-colors ${
                showDashboard ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {showDashboard ? 'Hide' : 'Show'} Dashboard
            </button>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'table' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Table View"
              >
                <FaList />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'cards' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                }`}
                title="Card View"
              >
                <FaThLarge />
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        {showDashboard && !loading && !error && tokens.length > 0 && (
          <AnalyticsDashboard />
        )}

        {/* Advanced Filters */}
        <AdvancedFilters isCompact={true} />

        {/* Tabbed Filters */}
        <TabbedFilters />

        {/* Loading and Error States */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="mt-4 text-gray-400">Loading market data...</p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <button onClick={fetchTokens} className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Token Display */}
        {!loading && !error && (
          <>
            {viewMode === 'table' ? (
              <TokenTable
                isFilterDrawerOpen={isFilterDrawerOpen}
                onFilterClick={handleFilterClick}
                onFilterClose={handleFilterClose}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                {filteredTokens.map(token => (
                  <TokenAnalyticsCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav onFilterClick={handleFilterClick} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}
