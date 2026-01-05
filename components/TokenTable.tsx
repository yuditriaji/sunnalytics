import React, { useState, useMemo, memo } from 'react';
import { useRouter } from 'next/router';
import { useTokenStore } from '../stores/useTokenStore';
import { FiStar, FiChevronUp, FiChevronDown, FiFilter, FiColumns, FiX, FiCheck } from 'react-icons/fi';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  chain?: string;
  exchange?: string;
  volumeMarketCapRatio?: number;
  isVolumeHealthy?: boolean;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  stats?: {
    priceChange24h?: number;
  };
}

type SortKey = 'marketCap' | 'price' | 'volume24h' | 'priceChange24h';

interface TokenTableProps {
  isFilterDrawerOpen?: boolean;
  onFilterClick?: () => void;
  onFilterClose?: () => void;
}

const tokenColors = [
  'bg-gradient-to-br from-purple-500 to-indigo-600',
  'bg-gradient-to-br from-pink-500 to-rose-500',
  'bg-gradient-to-br from-teal-400 to-cyan-500',
  'bg-gradient-to-br from-orange-400 to-amber-500',
  'bg-gradient-to-br from-emerald-400 to-green-500',
];

// All available columns
const ALL_COLUMNS = [
  { id: 'name', label: 'Name', sortable: false },
  { id: 'price', label: 'Price', sortable: true },
  { id: 'change24h', label: '24h Change', sortable: true },
  { id: 'exchange', label: 'Exchange', sortable: false },
  { id: 'chain', label: 'Chain', sortable: false },
  { id: 'marketCap', label: 'Market Cap', sortable: true },
  { id: 'volume24h', label: 'Volume 24h', sortable: true },
  { id: 'volMcapRatio', label: 'Vol/MCap Ratio', sortable: false },
  { id: 'volHealthy', label: 'Vol. Health', sortable: false },
  { id: 'liquidity', label: 'Liquidity Score', sortable: false },
  { id: 'pumpDumpRisk', label: 'P&D Risk', sortable: false },
  { id: 'walletDist', label: 'Wallet Dist.', sortable: false },
  { id: 'risk', label: 'Risk Level', sortable: false },
];

const DEFAULT_COLUMNS = ['name', 'price', 'change24h', 'exchange', 'marketCap', 'volume24h', 'risk'];

const TokenTable: React.FC<TokenTableProps> = memo(() => {
  const router = useRouter();
  const { filteredTokens, watchlist, addToWatchlist } = useTokenStore();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'marketCap', dir: 'desc' });
  const [page, setPage] = useState(0);
  const perPage = 50;

  // Column customization
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_COLUMNS);
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    chain: '',
    exchange: '',
    riskLevel: '',
    minMarketCap: '',
    maxMarketCap: '',
  });

  // Get unique values for filter dropdowns
  const uniqueChains = useMemo(() => {
    const chains = [...new Set(filteredTokens.map(t => t.chain).filter(Boolean))];
    return chains.sort();
  }, [filteredTokens]);

  const uniqueExchanges = useMemo(() => {
    const exchanges = [...new Set(filteredTokens.map(t => t.exchange).filter(Boolean))];
    return exchanges.sort();
  }, [filteredTokens]);

  // Filter tokens
  const localFilteredTokens = useMemo(() => {
    return filteredTokens.filter(token => {
      if (filters.chain && token.chain !== filters.chain) return false;
      if (filters.exchange && token.exchange !== filters.exchange) return false;
      if (filters.riskLevel) {
        const risk = token.pumpDumpRiskScore ?? 0;
        if (filters.riskLevel === 'low' && risk > 30) return false;
        if (filters.riskLevel === 'medium' && (risk <= 30 || risk > 60)) return false;
        if (filters.riskLevel === 'high' && risk <= 60) return false;
      }
      if (filters.minMarketCap) {
        const min = parseFloat(filters.minMarketCap) * 1e6;
        if ((token.marketCap ?? 0) < min) return false;
      }
      if (filters.maxMarketCap) {
        const max = parseFloat(filters.maxMarketCap) * 1e6;
        if ((token.marketCap ?? 0) > max) return false;
      }
      return true;
    });
  }, [filteredTokens, filters]);

  // Sort tokens
  const sortedTokens = useMemo(() => {
    return [...localFilteredTokens].sort((a, b) => {
      let aVal: number | undefined;
      let bVal: number | undefined;
      switch (sortConfig.key) {
        case 'priceChange24h':
          aVal = a.stats?.priceChange24h;
          bVal = b.stats?.priceChange24h;
          break;
        default:
          aVal = a[sortConfig.key] as number | undefined;
          bVal = b[sortConfig.key] as number | undefined;
      }
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      return sortConfig.dir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [localFilteredTokens, sortConfig]);

  const paginatedTokens = useMemo(() => sortedTokens.slice(page * perPage, (page + 1) * perPage), [sortedTokens, page]);
  const totalPages = Math.ceil(sortedTokens.length / perPage);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId) ? prev.filter(c => c !== columnId) : [...prev, columnId]
    );
  };

  const clearFilters = () => {
    setFilters({ chain: '', exchange: '', riskLevel: '', minMarketCap: '', maxMarketCap: '' });
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const formatPrice = (price?: number) => {
    if (!price) return '-';
    if (price < 0.0001) return `$${price.toExponential(2)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (num?: number) => {
    if (!num) return '-';
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatChange = (change?: number) => {
    if (change === undefined || change === null) return '-';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors" onClick={() => handleSort(sortKey)}>
      <div className="flex items-center gap-1">
        {label}
        {sortConfig.key === sortKey && (sortConfig.dir === 'desc' ? <FiChevronDown className="w-3 h-3" /> : <FiChevronUp className="w-3 h-3" />)}
      </div>
    </th>
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${showFilters ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
          >
            <FiFilter className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-black text-xs flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>

          {/* Column Customization */}
          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${showColumnMenu ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              <FiColumns className="w-4 h-4" />
              Columns
            </button>

            {/* Column Menu */}
            {showColumnMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#1F2937] border border-white/10 rounded-xl shadow-xl z-50">
                <div className="p-2">
                  {ALL_COLUMNS.map(col => (
                    <button
                      key={col.id}
                      onClick={() => toggleColumn(col.id)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg"
                    >
                      {col.label}
                      {visibleColumns.includes(col.id) && <FiCheck className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-500">{sortedTokens.length} tokens</p>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="px-4 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex flex-wrap items-end gap-4">
            {/* Chain Filter */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Chain</label>
              <select
                value={filters.chain}
                onChange={(e) => setFilters(f => ({ ...f, chain: e.target.value }))}
                className="h-9 px-3 bg-[#1F2937] border border-white/10 rounded-lg text-sm text-white"
              >
                <option value="">All Chains</option>
                {uniqueChains.map(chain => (
                  <option key={chain} value={chain}>{chain}</option>
                ))}
              </select>
            </div>

            {/* Exchange Filter */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Exchange</label>
              <select
                value={filters.exchange}
                onChange={(e) => setFilters(f => ({ ...f, exchange: e.target.value }))}
                className="h-9 px-3 bg-[#1F2937] border border-white/10 rounded-lg text-sm text-white"
              >
                <option value="">All Exchanges</option>
                {uniqueExchanges.map(ex => (
                  <option key={ex} value={ex}>{ex}</option>
                ))}
              </select>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Risk Level</label>
              <select
                value={filters.riskLevel}
                onChange={(e) => setFilters(f => ({ ...f, riskLevel: e.target.value }))}
                className="h-9 px-3 bg-[#1F2937] border border-white/10 rounded-lg text-sm text-white"
              >
                <option value="">All Risks</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </div>

            {/* Market Cap Range */}
            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Min MCap (M)</label>
              <input
                type="number"
                value={filters.minMarketCap}
                onChange={(e) => setFilters(f => ({ ...f, minMarketCap: e.target.value }))}
                placeholder="0"
                className="w-24 h-9 px-3 bg-[#1F2937] border border-white/10 rounded-lg text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 uppercase mb-1">Max MCap (M)</label>
              <input
                type="number"
                value={filters.maxMarketCap}
                onChange={(e) => setFilters(f => ({ ...f, maxMarketCap: e.target.value }))}
                placeholder="∞"
                className="w-24 h-9 px-3 bg-[#1F2937] border border-white/10 rounded-lg text-sm text-white"
              />
            </div>

            {/* Clear Filters */}
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="flex items-center gap-1 h-9 px-3 text-sm text-red-400 hover:text-red-300">
                <FiX className="w-4 h-4" /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="w-10 px-4 py-3"></th>
              <th className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-400">#</th>
              {visibleColumns.includes('name') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>}
              {visibleColumns.includes('price') && <SortHeader label="Price" sortKey="price" />}
              {visibleColumns.includes('change24h') && <SortHeader label="24h" sortKey="priceChange24h" />}
              {visibleColumns.includes('exchange') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exchange</th>}
              {visibleColumns.includes('chain') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Chain</th>}
              {visibleColumns.includes('marketCap') && <SortHeader label="Market Cap" sortKey="marketCap" />}
              {visibleColumns.includes('volume24h') && <SortHeader label="Volume 24h" sortKey="volume24h" />}
              {visibleColumns.includes('volMcapRatio') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vol/MCap</th>}
              {visibleColumns.includes('volHealthy') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Vol Health</th>}
              {visibleColumns.includes('liquidity') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Liquidity</th>}
              {visibleColumns.includes('pumpDumpRisk') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">P&D Risk</th>}
              {visibleColumns.includes('walletDist') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Wallet Dist</th>}
              {visibleColumns.includes('risk') && <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedTokens.map((token, index) => {
              const isInWatchlist = watchlist.some(w => w.id === token.id);
              const globalIndex = page * perPage + index + 1;
              const change24h = token.stats?.priceChange24h;

              return (
                <tr key={token.id} onClick={() => router.push(`/tokens/${token.id}`)} className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors">
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.stopPropagation(); addToWatchlist(token); }} className={`p-1 rounded transition-colors ${isInWatchlist ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}>
                      <FiStar className="w-4 h-4" fill={isInWatchlist ? 'currentColor' : 'none'} />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-sm text-gray-500">{globalIndex}</td>
                  {visibleColumns.includes('name') && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${tokenColors[index % tokenColors.length]}`}>
                          {token.symbol.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{token.name || token.symbol}</p>
                          <p className="text-xs text-gray-500 uppercase">{token.symbol}</p>
                        </div>
                      </div>
                    </td>
                  )}
                  {visibleColumns.includes('price') && <td className="px-4 py-3 text-sm font-medium text-white">{formatPrice(token.price)}</td>}
                  {visibleColumns.includes('change24h') && (
                    <td className={`px-4 py-3 text-sm font-medium ${change24h === undefined ? 'text-gray-500' : change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {formatChange(change24h)}
                    </td>
                  )}
                  {visibleColumns.includes('exchange') && <td className="px-4 py-3 text-sm text-gray-400">{token.exchange || '-'}</td>}
                  {visibleColumns.includes('chain') && (
                    <td className="px-4 py-3">
                      {token.chain && (
                        <span className="text-xs px-2 py-1 rounded bg-white/5 text-gray-400 capitalize">{token.chain}</span>
                      )}
                    </td>
                  )}
                  {visibleColumns.includes('marketCap') && <td className="px-4 py-3 text-sm text-white">{formatLargeNumber(token.marketCap)}</td>}
                  {visibleColumns.includes('volume24h') && <td className="px-4 py-3 text-sm text-gray-400">{formatLargeNumber(token.volume24h)}</td>}
                  {visibleColumns.includes('volMcapRatio') && (
                    <td className="px-4 py-3">
                      {token.volumeMarketCapRatio !== undefined ? (
                        <span className={`text-xs font-medium ${token.volumeMarketCapRatio > 2 ? 'text-red-400' : token.volumeMarketCapRatio > 1 ? 'text-amber-400' : 'text-gray-400'}`}>
                          {(token.volumeMarketCapRatio * 100).toFixed(2)}%
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                  {visibleColumns.includes('volHealthy') && (
                    <td className="px-4 py-3">
                      {token.isVolumeHealthy !== undefined ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${token.isVolumeHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.isVolumeHealthy ? 'Yes' : 'No'}
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                  {visibleColumns.includes('liquidity') && (
                    <td className="px-4 py-3">
                      {token.liquidityScore !== undefined && token.liquidityScore > 0 ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${token.liquidityScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : token.liquidityScore >= 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.liquidityScore.toFixed(0)}
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                  {visibleColumns.includes('pumpDumpRisk') && (
                    <td className="px-4 py-3">
                      {token.pumpDumpRiskScore !== undefined && token.pumpDumpRiskScore > 0 ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${token.pumpDumpRiskScore <= 30 ? 'bg-emerald-500/10 text-emerald-400' : token.pumpDumpRiskScore <= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.pumpDumpRiskScore.toFixed(0)}
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                  {visibleColumns.includes('walletDist') && (
                    <td className="px-4 py-3">
                      {token.walletDistributionScore !== undefined && token.walletDistributionScore > 0 ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${token.walletDistributionScore >= 70 ? 'bg-emerald-500/10 text-emerald-400' : token.walletDistributionScore >= 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.walletDistributionScore.toFixed(0)}
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                  {visibleColumns.includes('risk') && (
                    <td className="px-4 py-3">
                      {token.pumpDumpRiskScore !== undefined && token.pumpDumpRiskScore > 0 ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded ${token.pumpDumpRiskScore <= 30 ? 'bg-emerald-500/10 text-emerald-400' : token.pumpDumpRiskScore <= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {token.pumpDumpRiskScore <= 30 ? 'Low' : token.pumpDumpRiskScore <= 60 ? 'Med' : 'High'}
                        </span>
                      ) : <span className="text-xs text-gray-600">-</span>}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-sm text-gray-500">Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, sortedTokens.length)} of {sortedTokens.length}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg">Next</button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedTokens.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">No tokens found</p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mt-2 text-cyan-400 text-sm hover:underline">Clear filters</button>
          )}
        </div>
      )}
    </div>
  );
});

TokenTable.displayName = 'TokenTable';

export default TokenTable;
