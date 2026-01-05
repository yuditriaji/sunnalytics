import React, { useState, useMemo, memo } from 'react';
import { useRouter } from 'next/router';
import { useTokenStore } from '../stores/useTokenStore';
import { FiStar, FiChevronUp, FiChevronDown } from 'react-icons/fi';

interface Token {
  id: string;
  name: string;
  symbol: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  chain?: string;
  exchange?: string;
  liquidityScore?: number;
  pumpDumpRiskScore?: number;
  walletDistributionScore?: number;
  stats?: {
    priceChange24h?: number;
    priceChange7d?: number;
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

const TokenTable: React.FC<TokenTableProps> = memo(() => {
  const router = useRouter();
  const { filteredTokens, watchlist, addToWatchlist } = useTokenStore();
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'marketCap', dir: 'desc' });
  const [page, setPage] = useState(0);
  const perPage = 50;

  const sortedTokens = useMemo(() => {
    return [...filteredTokens].sort((a, b) => {
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
  }, [filteredTokens, sortConfig]);

  const paginatedTokens = useMemo(() => {
    return sortedTokens.slice(page * perPage, (page + 1) * perPage);
  }, [sortedTokens, page]);

  const totalPages = Math.ceil(sortedTokens.length / perPage);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc'
    }));
  };

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
    const prefix = change >= 0 ? '+' : '';
    return `${prefix}${change.toFixed(2)}%`;
  };

  const SortHeader = ({ label, sortKey }: { label: string; sortKey: SortKey }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortConfig.key === sortKey && (
          sortConfig.dir === 'desc' ? <FiChevronDown className="w-3 h-3" /> : <FiChevronUp className="w-3 h-3" />
        )}
      </div>
    </th>
  );

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="w-10 px-4 py-3"></th>
              <th className="w-10 px-2 py-3 text-left text-xs font-medium text-gray-400">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <SortHeader label="Price" sortKey="price" />
              <SortHeader label="24h" sortKey="priceChange24h" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Exchange</th>
              <SortHeader label="Market Cap" sortKey="marketCap" />
              <SortHeader label="Volume 24h" sortKey="volume24h" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Risk</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTokens.map((token, index) => {
              const isInWatchlist = watchlist.some(w => w.id === token.id);
              const globalIndex = page * perPage + index + 1;
              const change24h = token.stats?.priceChange24h;

              return (
                <tr
                  key={token.id}
                  onClick={() => router.push(`/tokens/${token.id}`)}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  {/* Watchlist */}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlist(token);
                      }}
                      className={`p-1 rounded transition-colors ${isInWatchlist ? 'text-amber-400' : 'text-gray-600 hover:text-amber-400'}`}
                    >
                      <FiStar className="w-4 h-4" fill={isInWatchlist ? 'currentColor' : 'none'} />
                    </button>
                  </td>

                  {/* Rank */}
                  <td className="px-2 py-3 text-sm text-gray-500">{globalIndex}</td>

                  {/* Name */}
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

                  {/* Price */}
                  <td className="px-4 py-3 text-sm font-medium text-white">{formatPrice(token.price)}</td>

                  {/* 24h Change */}
                  <td className={`px-4 py-3 text-sm font-medium ${change24h === undefined ? 'text-gray-500' : change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatChange(change24h)}
                  </td>

                  {/* Exchange */}
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {token.exchange || '-'}
                  </td>

                  {/* Market Cap */}
                  <td className="px-4 py-3 text-sm text-white">{formatLargeNumber(token.marketCap)}</td>

                  {/* Volume */}
                  <td className="px-4 py-3 text-sm text-gray-400">{formatLargeNumber(token.volume24h)}</td>

                  {/* Risk Score */}
                  <td className="px-4 py-3">
                    {token.pumpDumpRiskScore !== undefined && token.pumpDumpRiskScore > 0 ? (
                      <span className={`text-xs font-medium px-2 py-1 rounded ${token.pumpDumpRiskScore <= 30 ? 'bg-emerald-500/10 text-emerald-400' :
                        token.pumpDumpRiskScore <= 60 ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                        {token.pumpDumpRiskScore <= 30 ? 'Low' : token.pumpDumpRiskScore <= 60 ? 'Med' : 'High'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <p className="text-sm text-gray-500">
            Showing {page * perPage + 1}-{Math.min((page + 1) * perPage, sortedTokens.length)} of {sortedTokens.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedTokens.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500 text-sm">No tokens found</p>
        </div>
      )}
    </div>
  );
});

TokenTable.displayName = 'TokenTable';

export default TokenTable;
