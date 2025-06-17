// components/TokenTable.tsx
import React, { useState, useEffect, useMemo, memo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTokenStore } from '../stores/useTokenStore';
import FilterDrawer from './FilterDrawer';
import { FaSort, FaStar } from 'react-icons/fa';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash.debounce';

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
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
}

interface TokenTableProps {
  isFilterDrawerOpen: boolean;
  onFilterClick: () => void;
  onFilterClose: () => void;
  defaultMobileColumns: boolean;
}

export function formatNumber(value: number | undefined, suffix: string = ''): string {
  if (value === undefined || value === 0) return '-';
  if (value >= 1e9) return `$${Math.floor(value / 1e9)}${suffix}B`;
  if (value >= 1e6) return `$${Math.floor(value / 1e6)}${suffix}M`;
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
}

const TokenTable: React.FC<TokenTableProps> = memo(({ isFilterDrawerOpen, onFilterClick, onFilterClose, defaultMobileColumns }) => {
  const router = useRouter();
  const { filteredTokens, setFilteredTokens, tokens, watchlist, addToWatchlist } = useTokenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'symbol',
    'price',
    'volume24h',
    'marketCap',
    'volumeMarketCapRatio',
    'isVolumeHealthy',
    'pumpDumpRiskScore',
    'liquidityScore',
    'walletDistributionScore',
  ]);

  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Token; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (defaultMobileColumns) {
      setVisibleColumns(['symbol', 'volumeMarketCapRatio', 'isVolumeHealthy']);
    } else {
      setVisibleColumns([
        'symbol',
        'price',
        'volume24h',
        'marketCap',
        'volumeMarketCapRatio',
        'isVolumeHealthy',
        'pumpDumpRiskScore',
        'liquidityScore',
        'walletDistributionScore',
      ]);
    }
  }, [defaultMobileColumns]);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
  };

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setFilteredTokens(
        tokens.filter(
          token =>
            token.name.toLowerCase().includes(query.toLowerCase()) ||
            token.symbol.toLowerCase().includes(query.toLowerCase())
        )
      );
    }, 300),
    [tokens, setFilteredTokens]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const showColumnModal = () => {
    setIsColumnModalVisible(true);
  };

  const handleColumnClose = () => {
    setIsColumnModalVisible(false);
  };

  const showSortModal = () => {
    setIsSortModalVisible(true);
  };

  const handleSortClose = () => {
    setIsSortModalVisible(false);
  };

  const requestSort = (key: keyof Token) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' as const };
      }
      return prev.direction === 'asc' ? { key, direction: 'desc' as const } : null;
    });
    handleSortClose();
  };

  const sortedTokens: Token[] = useMemo(() => {
    if (!sortConfig) return filteredTokens as Token[];
    return [...filteredTokens].sort((a: Token, b: Token) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue === undefined || bValue === undefined) return 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortConfig.direction === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
      return 0;
    });
  }, [filteredTokens, sortConfig]);

  const columns = [
    'symbol',
    'price',
    'volume24h',
    'marketCap',
    'volumeMarketCapRatio',
    'isVolumeHealthy',
    'pumpDumpRiskScore',
    'liquidityScore',
    'walletDistributionScore',
  ].filter(col => visibleColumns.includes(col));

  const formatRatio = (value: number | undefined) => value !== undefined ? `${(value * 100).toFixed(2)}%` : '-';
  const formatBoolean = (value: boolean | undefined) => value !== undefined ? (value ? 'Yes' : 'No') : '-';
  const formatScore = (value: number | undefined) => value !== undefined ? value.toFixed(2) : '-';

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const token: Token = sortedTokens[index];
    const isInWatchlist = watchlist.some(w => w.id === token.id);

    const handleAddToWatchlist = () => {
      if (!isInWatchlist) {
        addToWatchlist(token);
      }
    };

    return (
      <div
        style={style}
        className="bg-gray-800 p-2 flex items-center space-x-2 text-white rounded shadow-sm hover:bg-gray-700 transition-colors cursor-pointer"
        role="row"
        aria-label={`Token ${token.symbol}`}
        onClick={() => router.push(`/tokens/${token.id}`)}
      >
        {columns.map(col => (
          <div key={col} className="flex-1 text-sm truncate" role="cell">
            {col === 'symbol' ? (
              <span className="font-semibold">{token.symbol}</span>
            ) : col === 'price' ? (
              <button className="bg-green-500 text-black px-2 py-1 rounded hover:bg-green-400 transition-colors">
                Buy ${formatNumber(token.price)}
              </button>
            ) : col === 'volume24h' ? (
              formatNumber(token.volume24h)
            ) : col === 'marketCap' ? (
              formatNumber(token.marketCap)
            ) : col === 'volumeMarketCapRatio' ? (
              formatRatio(token.volumeMarketCapRatio)
            ) : col === 'isVolumeHealthy' ? (
              formatBoolean(token.isVolumeHealthy)
            ) : col === 'pumpDumpRiskScore' ? (
              formatScore(token.pumpDumpRiskScore)
            ) : col === 'liquidityScore' ? (
              formatScore(token.liquidityScore)
            ) : col === 'walletDistributionScore' ? (
              formatScore(token.walletDistributionScore)
            ) : (
              '-'
            )}
          </div>
        ))}
        <button
          onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(); }}
          className={`p-1 rounded-full ${isInWatchlist ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'} transition-colors`}
          aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <FaStar />
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full sm:max-w-xs p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
          aria-label="Search tokens"
        />
        <div className="flex flex-wrap gap-2">
          <select
            onChange={e => requestSort(e.target.value as keyof Token)}
            className="p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            aria-label="Sort tokens by"
          >
            <option value="">Sort By</option>
            <option value="marketCap">Market Cap</option>
            <option value="volume24h">Volume 24h</option>
            <option value="price">Price</option>
            <option value="liquidityScore">Liquidity Score</option>
            <option value="pumpDumpRiskScore">Pump/Dump Risk</option>
            <option value="walletDistributionScore">Wallet Dist Score</option>
          </select>
          <button
            onClick={showColumnModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            aria-label="Customize table columns"
          >
            Columns
          </button>
          <button
            onClick={onFilterClick}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            aria-label="Open filter drawer"
          >
            Filter
          </button>
          <button
            onClick={showSortModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 flex items-center focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
            aria-label="Open sort options"
          >
            <FaSort className="mr-1" /> Sort
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <div className="min-w-full">
          <div
            className={`grid gap-2 sticky top-0 bg-gray-800 z-10 p-2 text-white font-bold border-b border-gray-700`}
            style={{
              gridTemplateColumns: columns.map(() => defaultMobileColumns ? '1fr' : 'minmax(80px, 1fr)').join(' '),
            }}
            role="row"
            aria-label="Table headers"
          >
            {columns.map(col => (
              <div
                key={col}
                className="text-sm truncate"
                role="columnheader"
                aria-sort={sortConfig?.key === col ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {col === 'symbol' ? 'Symbol' : 
                 col === 'volumeMarketCapRatio' ? 'Vol/Mkt Cap' : 
                 col === 'isVolumeHealthy' ? 'Health' : 
                 col === 'pumpDumpRiskScore' ? 'Risk' : 
                 col === 'walletDistributionScore' ? 'Wallet Score' : 
                 col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
              </div>
            ))}
          </div>
          <div role="grid" aria-label="Token data table" className="bg-gray-900">
            <FixedSizeList
              height={400}
              itemCount={sortedTokens.length}
              itemSize={50}
              width="100%"
            >
              {Row}
            </FixedSizeList>
          </div>
        </div>
      </div>
      {isColumnModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md p-6 rounded-lg shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Customize Columns</h2>
            {[
              'symbol',
              'price',
              'volume24h',
              'marketCap',
              'volumeMarketCapRatio',
              'isVolumeHealthy',
              'pumpDumpRiskScore',
              'liquidityScore',
              'walletDistributionScore',
            ].map(key => (
              <div key={key} className="flex items-center mb-3">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="mr-2 h-4 w-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
                  id={`column-${key}`}
                  aria-label={`Toggle ${key} column`}
                />
                <label htmlFor={`column-${key}`} className="text-white text-sm">
                  {key === 'symbol' ? 'Symbol' : 
                   key === 'volumeMarketCapRatio' ? 'Vol/Mkt Cap' : 
                   key === 'isVolumeHealthy' ? 'Health' : 
                   key === 'pumpDumpRiskScore' ? 'Risk' : 
                   key === 'walletDistributionScore' ? 'Wallet Score' : 
                   key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
              </div>
            ))}
            <button
              onClick={handleColumnClose}
              className="w-full mt-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Close column customization"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {isSortModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md p-6 rounded-lg shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Sort By</h2>
            {[
              'price',
              'marketCap',
              'volume24h',
              'volumeMarketCapRatio',
              'pumpDumpRiskScore',
              'liquidityScore',
              'walletDistributionScore',
            ].map(key => (
              <div key={key} className="mb-3">
                <button
                  onClick={() => requestSort(key as keyof Token)}
                  className="w-full text-left p-2 bg-gray-700 rounded hover:bg-gray-600 text-white flex justify-between focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                  aria-label={`Sort by ${key}`}
                >
                  <span>{key === 'volumeMarketCapRatio' ? 'Vol/Mkt Cap' : 
                         key === 'isVolumeHealthy' ? 'Health' : 
                         key === 'pumpDumpRiskScore' ? 'Risk' : 
                         key === 'walletDistributionScore' ? 'Wallet Score' : 
                         key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  <span>{sortConfig?.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleSortClose}
              className="w-full mt-4 px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Close sort options"
            >
              Done
            </button>
          </div>
        </div>
      )}
      <FilterDrawer isOpen={isFilterDrawerOpen} onClose={onFilterClose} />
    </div>
  );
});

export default TokenTable;