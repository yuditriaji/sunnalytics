import { useEffect, useState, useMemo } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import AdvancedFilters from '../components/AdvancedFilters';
import TokenAnalyticsCard from '../components/TokenAnalyticsCard';
import { FaThLarge, FaList, FaSearch, FaChartBar, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Home() {
  const { loading, error, fetchTokens, searchQuery, setSearchQuery, tokens, filteredTokens, applyFilters } = useTokenStore();
  const { fetchTokens: fetchData } = useTokenData();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Apply filters whenever search query or tokens change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, tokens, applyFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Calculate market overview metrics
  const marketOverview = useMemo(() => {
    if (!tokens.length) return null;

    const totalMarketCap = tokens.reduce((sum, token) => sum + (token.marketCap || 0), 0);
    const totalVolume = tokens.reduce((sum, token) => sum + (token.volume24h || 0), 0);
    const healthyTokens = tokens.filter(token => token.isVolumeHealthy).length;
    const highRiskTokens = tokens.filter(token => (token.pumpDumpRiskScore || 0) > 70).length;
    const avgVolMktCapRatio = tokens.reduce((sum, token) => sum + (token.volumeMarketCapRatio || 0), 0) / tokens.length;

    return {
      totalMarketCap,
      totalVolume,
      healthyTokens,
      highRiskTokens,
      avgVolMktCapRatio,
      totalTokens: tokens.length,
      healthyPercentage: (healthyTokens / tokens.length) * 100,
      riskPercentage: (highRiskTokens / tokens.length) * 100,
    };
  }, [tokens]);

  return (
    <div className="min-h-screen flex flex-col pb-safe-area-inset-bottom bg-gray-900 text-white">
      <main className="flex-1 p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Sunnalytics
            </h1>
            <p className="text-sm text-gray-400 mt-1">Blockchain Analytics Platform</p>
          </div>
          <div className="flex items-center space-x-2">
            {/* Dashboard Toggle - Icon on mobile, text on desktop */}
            <button
              onClick={() => setShowDashboard(!showDashboard)}
              className={`p-2 md:px-3 md:py-1 rounded transition-colors ${
                showDashboard ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-300'
              }`}
              title={showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
            >
              <span className="md:hidden">
                {showDashboard ? <FaEyeSlash /> : <FaEye />}
              </span>
              <span className="hidden md:inline flex items-center">
                <FaChartBar className="mr-2" />
                {showDashboard ? 'Hide' : 'Show'} Dashboard
              </span>
            </button>
            {/* View Mode Toggle */}
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

        {/* Market Overview Summary - Always visible when data is loaded */}
        {!loading && !error && marketOverview && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400">Total Market Cap</p>
                <p className="text-lg font-bold text-blue-400">
                  ${(marketOverview.totalMarketCap / 1e9).toFixed(2)}B
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">24h Volume</p>
                <p className="text-lg font-bold text-green-400">
                  ${(marketOverview.totalVolume / 1e9).toFixed(2)}B
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Healthy Tokens</p>
                <p className="text-lg font-bold text-green-400">
                  {marketOverview.healthyPercentage.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">High Risk</p>
                <p className="text-lg font-bold text-red-400">
                  {marketOverview.riskPercentage.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search tokens by name or symbol..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        {/* Detailed Analytics Dashboard */}
        {showDashboard && !loading && !error && tokens.length > 0 && (
          <div className="mb-6">
            <AnalyticsDashboard />
          </div>
        )}

        {/* Advanced Filters */}
        <AdvancedFilters isCompact={true} />

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
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-300">
                {filteredTokens.length} Tokens
                {searchQuery && ` matching "${searchQuery}"`}
              </h2>
            </div>
            {viewMode === 'table' ? (
              <TokenTable
                isFilterDrawerOpen={false}
                onFilterClick={() => {}}
                onFilterClose={() => {}}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTokens.map(token => (
                  <TokenAnalyticsCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <BottomNav onFilterClick={() => {}} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}
