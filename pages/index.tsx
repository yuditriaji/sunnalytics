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
import { FiSearch, FiTrendingUp, FiDollarSign, FiDatabase, FiAlertTriangle, FiGrid, FiList } from 'react-icons/fi';

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

  // Market metrics
  const marketMetrics = useMemo(() => {
    if (!tokens.length) return null;

    const totalMarketCap = tokens.reduce((sum, t) => sum + (t.marketCap || 0), 0);
    const totalVolume = tokens.reduce((sum, t) => sum + (t.volume24h || 0), 0);
    const highRiskCount = tokens.filter(t => (t.pumpDumpRiskScore || 0) > 60).length;

    return {
      totalMarketCap,
      totalVolume,
      tokenCount: tokens.length,
      riskPercent: tokens.length > 0 ? (highRiskCount / tokens.length) * 100 : 0,
    };
  }, [tokens]);

  // Top movers
  const topGainers = useMemo(() => {
    return [...tokens]
      .filter(t => t.stats?.priceChange24h !== undefined && t.stats.priceChange24h > 0)
      .sort((a, b) => (b.stats?.priceChange24h || 0) - (a.stats?.priceChange24h || 0))
      .slice(0, 5)
      .map(t => ({ ...t, priceChange24h: t.stats?.priceChange24h }));
  }, [tokens]);

  const topLosers = useMemo(() => {
    return [...tokens]
      .filter(t => t.stats?.priceChange24h !== undefined && t.stats.priceChange24h < 0)
      .sort((a, b) => (a.stats?.priceChange24h || 0) - (b.stats?.priceChange24h || 0))
      .slice(0, 5)
      .map(t => ({ ...t, priceChange24h: t.stats?.priceChange24h }));
  }, [tokens]);

  const formatNumber = (n: number) => {
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0E17]">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'} pb-20 lg:pb-0`}>
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

        <main className="p-4 lg:p-6">
          {/* Stats Grid */}
          {!loading && marketMetrics && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatsCard
                label="Total Market Cap"
                value={formatNumber(marketMetrics.totalMarketCap)}
                icon={<FiTrendingUp className="w-5 h-5" />}
                iconBg="bg-cyan-500/10 text-cyan-400"
              />
              <StatsCard
                label="24H Volume"
                value={formatNumber(marketMetrics.totalVolume)}
                icon={<FiDollarSign className="w-5 h-5" />}
                iconBg="bg-emerald-500/10 text-emerald-400"
              />
              <StatsCard
                label="Tracked Tokens"
                value={marketMetrics.tokenCount.toLocaleString()}
                icon={<FiDatabase className="w-5 h-5" />}
                iconBg="bg-purple-500/10 text-purple-400"
              />
              <StatsCard
                label="High Risk Tokens"
                value={`${marketMetrics.riskPercent.toFixed(1)}%`}
                subtitle="with risk score > 60"
                icon={<FiAlertTriangle className="w-5 h-5" />}
                iconBg="bg-red-500/10 text-red-400"
              />
            </div>
          )}

          {/* Search Bar */}
          <div className="relative mb-6">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tokens by name or symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-[#111827] border border-white/5 rounded-xl
                text-white text-sm placeholder-gray-500
                focus:border-cyan-500/30 transition-colors"
            />
          </div>

          {/* Top Gainers & Losers */}
          {!loading && !searchQuery && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <TrendingTokens tokens={topGainers} title="Top Gainers" type="gainers" />
              <TrendingTokens tokens={topLosers} title="Top Losers" type="losers" />
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full spinner" />
              <p className="mt-4 text-gray-500 text-sm">Loading market data...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <FiAlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-red-400 text-sm mb-4">{error}</p>
              <button
                onClick={fetchTokens}
                className="h-9 px-4 bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* All Tokens Section */}
          {!loading && !error && (
            <div>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-white">All Tokens</h2>
                  {searchQuery && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {filteredTokens.length} results for "{searchQuery}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#111827] border border-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'
                      }`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Token Display */}
              {viewMode === 'table' ? (
                <div className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
                  <TokenTable
                    isFilterDrawerOpen={false}
                    onFilterClick={() => { }}
                    onFilterClose={() => { }}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredTokens.slice(0, 20).map((token) => (
                    <TokenAnalyticsCard key={token.id} token={token} />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav onFilterClick={() => { }} onSearchFocus={() => document.querySelector('input')?.focus()} />
      </div>
    </div>
  );
}
