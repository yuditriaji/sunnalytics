import { useEffect, useState, useMemo } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import DashboardHeader from '../components/DashboardHeader';
import StatsCard from '../components/StatsCard';
import TrendingTokens from '../components/TrendingTokens';
import TokenAnalyticsCard from '../components/TokenAnalyticsCard';
import { FaSearch, FaChartLine, FaDollarSign, FaShieldAlt, FaFire, FaThLarge, FaList } from 'react-icons/fa';

export default function Home() {
  const { loading, error, fetchTokens, searchQuery, setSearchQuery, tokens, filteredTokens, applyFilters } = useTokenStore();
  const { fetchTokens: fetchData } = useTokenData();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, tokens, applyFilters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Market metrics
  const marketMetrics = useMemo(() => {
    if (!tokens.length) return null;

    const totalMarketCap = tokens.reduce((sum, t) => sum + (t.marketCap || 0), 0);
    const totalVolume = tokens.reduce((sum, t) => sum + (t.volume24h || 0), 0);
    const healthyCount = tokens.filter(t => t.isVolumeHealthy).length;
    const highRiskCount = tokens.filter(t => (t.pumpDumpRiskScore || 0) > 70).length;

    return {
      totalMarketCap,
      totalVolume,
      healthyPercent: (healthyCount / tokens.length) * 100,
      riskPercent: (highRiskCount / tokens.length) * 100,
    };
  }, [tokens]);

  // Top movers
  const topGainers = useMemo(() => {
    return [...tokens]
      .filter(t => t.stats?.priceChange24h !== undefined)
      .sort((a, b) => (b.stats?.priceChange24h || 0) - (a.stats?.priceChange24h || 0))
      .slice(0, 5)
      .map(t => ({
        ...t,
        priceChange24h: t.stats?.priceChange24h,
      }));
  }, [tokens]);

  const topLosers = useMemo(() => {
    return [...tokens]
      .filter(t => t.stats?.priceChange24h !== undefined)
      .sort((a, b) => (a.stats?.priceChange24h || 0) - (b.stats?.priceChange24h || 0))
      .slice(0, 5)
      .map(t => ({
        ...t,
        priceChange24h: t.stats?.priceChange24h,
      }));
  }, [tokens]);

  const formatNumber = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-white pb-20">
      {/* Header */}
      <DashboardHeader />

      <main className="flex-1 px-4 pb-4">
        {/* Stats Grid */}
        {!loading && !error && marketMetrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatsCard
              title="Total Market Cap"
              value={formatNumber(marketMetrics.totalMarketCap)}
              icon={<FaChartLine className="w-4 h-4" />}
              color="blue"
            />
            <StatsCard
              title="24h Volume"
              value={formatNumber(marketMetrics.totalVolume)}
              icon={<FaDollarSign className="w-4 h-4" />}
              color="green"
            />
            <StatsCard
              title="Healthy Tokens"
              value={`${marketMetrics.healthyPercent.toFixed(0)}%`}
              icon={<FaShieldAlt className="w-4 h-4" />}
              color="yellow"
            />
            <StatsCard
              title="High Risk"
              value={`${marketMetrics.riskPercent.toFixed(0)}%`}
              icon={<FaFire className="w-4 h-4" />}
              color="red"
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-11 pr-4 py-3.5 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 transition-all"
          />
        </div>

        {/* Trending Section (when not searching) */}
        {!loading && !error && !searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <TrendingTokens tokens={topGainers} title="Top Gainers" type="gainers" />
            <TrendingTokens tokens={topLosers} title="Top Losers" type="losers" />
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-yellow-500 border-t-transparent" />
            <p className="mt-4 text-gray-500">Loading market data...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={fetchTokens}
              className="px-6 py-2 bg-yellow-500 text-black rounded-xl font-semibold hover:bg-yellow-400 transition-all"
            >
              Retry
            </button>
          </div>
        )}

        {/* Token List */}
        {!loading && !error && (
          <>
            {/* Header with view toggle */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {filteredTokens.length} Tokens
                {searchQuery && <span className="text-gray-500"> matching "{searchQuery}"</span>}
              </h2>
              <div className="flex bg-gray-800/50 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <FaList className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'
                    }`}
                >
                  <FaThLarge className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Token Display */}
            {viewMode === 'table' ? (
              <div className="bg-gray-800/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl overflow-hidden">
                <TokenTable
                  isFilterDrawerOpen={false}
                  onFilterClick={() => { }}
                  onFilterClose={() => { }}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTokens.map((token) => (
                  <TokenAnalyticsCard key={token.id} token={token} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav onFilterClick={() => { }} onSearchFocus={() => document.querySelector('input')?.focus()} />
    </div>
  );
}
