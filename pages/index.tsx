import { useEffect, useState, useMemo } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import Sidebar from '../components/Sidebar';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';
import DashboardHeader from '../components/DashboardHeader';
import StatsCard from '../components/StatsCard';
import TrendingTokens from '../components/TrendingTokens';
import TokenAnalyticsCard from '../components/TokenAnalyticsCard';
import { FaSearch, FaChartLine, FaDollarSign, FaShieldAlt, FaFire, FaThLarge, FaList, FaCoins } from 'react-icons/fa';

export default function Home() {
  const { loading, error, fetchTokens, searchQuery, setSearchQuery, tokens, filteredTokens, applyFilters } = useTokenStore();
  const { fetchTokens: fetchData } = useTokenData();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    const highRiskCount = tokens.filter(t => (t.pumpDumpRiskScore || 0) > 60).length;

    return {
      totalMarketCap,
      totalVolume,
      healthyPercent: (healthyCount / tokens.length) * 100,
      riskPercent: (highRiskCount / tokens.length) * 100,
      tokenCount: tokens.length,
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
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      {/* Sidebar (Desktop) */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`
          min-h-screen transition-all duration-300
          ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}
          pb-20 lg:pb-0
        `}
      >
        {/* Header */}
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

        <main className="px-4 lg:px-6 py-6">
          {/* Stats Grid */}
          {!loading && !error && marketMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                title="Total Market Cap"
                value={formatNumber(marketMetrics.totalMarketCap)}
                icon={<FaChartLine className="w-5 h-5" />}
                color="cyan"
              />
              <StatsCard
                title="24h Volume"
                value={formatNumber(marketMetrics.totalVolume)}
                icon={<FaDollarSign className="w-5 h-5" />}
                color="green"
              />
              <StatsCard
                title="Tracked Tokens"
                value={marketMetrics.tokenCount.toLocaleString()}
                icon={<FaCoins className="w-5 h-5" />}
                color="purple"
              />
              <StatsCard
                title="High Risk Tokens"
                value={`${marketMetrics.riskPercent.toFixed(1)}%`}
                subtitle="with risk score > 60"
                icon={<FaFire className="w-5 h-5" />}
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
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-3.5 
                bg-[#141B2D] border border-white/10 rounded-xl 
                text-white placeholder-gray-500 
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 
                transition-all"
            />
          </div>

          {/* Trending Section (when not searching) */}
          {!loading && !error && !searchQuery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <TrendingTokens tokens={topGainers} title="Top Gainers" type="gainers" />
              <TrendingTokens tokens={topLosers} title="Top Losers" type="losers" />
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading market data...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                <FaFire className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchTokens}
                className="px-6 py-2.5 bg-cyan-500 text-black rounded-xl font-semibold hover:bg-cyan-400 transition-all"
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
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    All Tokens
                  </h2>
                  <p className="text-sm text-gray-500">
                    {filteredTokens.length} tokens
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex bg-[#141B2D] border border-white/10 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'table'
                          ? 'bg-cyan-500 text-black'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <FaList className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'cards'
                          ? 'bg-cyan-500 text-black'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      <FaThLarge className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Token Display */}
              {viewMode === 'table' ? (
                <div className="bg-[#141B2D] border border-white/10 rounded-2xl overflow-hidden">
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
      </div>

      {/* Bottom Nav (Mobile) */}
      <div className="lg:hidden">
        <BottomNav
          onFilterClick={() => { }}
          onSearchFocus={() => document.querySelector('input')?.focus()}
        />
      </div>
    </div>
  );
}
