import React, { useState, useMemo, memo, useCallback } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import FilterDrawer from './FilterDrawer';
import RiskIndicator from './RiskIndicator';
import { FaSort, FaStar, FaArrowUp, FaArrowDown, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { FixedSizeList } from 'react-window';
import debounce from 'lodash.debounce';
import { useRouter } from 'next/router';

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  exchange: string;
  chain?: string;
  contractAddress?: string;
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
  stats?: {
    priceChange24h?: number;
  };
}

// Define sortable keys explicitly
type SortKey =
  | 'symbol'
  | 'exchange'
  | 'chain'
  | 'price'
  | 'volume24h'
  | 'marketCap'
  | 'volumeMarketCapRatio'
  | 'isVolumeHealthy'
  | 'pumpDumpRiskScore'
  | 'liquidityScore'
  | 'walletDistributionScore';

interface TokenTableProps {
  isFilterDrawerOpen: boolean;
  onFilterClick: () => void;
  onFilterClose: () => void;
}

const TokenTable: React.FC<TokenTableProps> = memo(({ isFilterDrawerOpen, onFilterClick, onFilterClose }) => {
  const { filteredTokens, setFilteredTokens, tokens } = useTokenStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'symbol',
    'exchange',
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
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

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

  const requestSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
    handleSortClose();
  };

  const sortedTokens = useMemo(() => {
    if (!sortConfig) return filteredTokens;

    const compareValues = (a: Token, b: Token, key: SortKey) => {
      const aValue = a[key];
      const bValue = b[key];

      // Handle undefined or null values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle boolean values
      if (key === 'isVolumeHealthy') {
        const aBool = aValue as boolean;
        const bBool = bValue as boolean;
        return sortConfig.direction === 'asc'
          ? Number(aBool) - Number(bBool)
          : Number(bBool) - Number(aBool);
      }

      // Handle string values (symbol, exchange, chain)
      if (key === 'symbol' || key === 'exchange' || key === 'chain') {
        const aStr = (aValue as string) || '';
        const bStr = (bValue as string) || '';
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      // Handle numeric values
      const aNum = aValue as number;
      const bNum = bValue as number;
      return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
    };

    return [...filteredTokens].sort((a, b) => compareValues(a, b, sortConfig.key));
  }, [filteredTokens, sortConfig]);

  const columns = [
    'symbol',
    'chain',
    'exchange',
    'price',
    'volume24h',
    'marketCap',
    'volumeMarketCapRatio',
    'isVolumeHealthy',
    'pumpDumpRiskScore',
    'liquidityScore',
    'walletDistributionScore',
  ].filter(col => visibleColumns.includes(col));

  const router = useRouter();
  const { watchlist, addToWatchlist } = useTokenStore();

  const formatNumber = (value: number | undefined, suffix: string = '') => {
    if (value === undefined || value === 0) return '-';
    if (value >= 1e9) return `$${Math.floor(value / 1e9)}${suffix}B`;
    if (value >= 1e6) return `$${Math.floor(value / 1e6)}${suffix}M`;
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatRatio = (value: number | undefined) => value !== undefined ? value.toFixed(4) : '-';
  const formatBoolean = (value: boolean | undefined) => value !== undefined ? (value ? 'Yes' : 'No') : '-';
  const formatScore = (value: number | undefined) => value !== undefined ? value.toFixed(2) : '-';

  const getScoreColor = (score: number | undefined, type: 'liquidity' | 'risk' | 'distribution') => {
    if (score === undefined) return 'text-gray-400';

    if (type === 'risk') {
      // For risk, lower is better
      if (score <= 30) return 'text-green-400';
      if (score <= 60) return 'text-yellow-400';
      return 'text-red-400';
    } else {
      // For liquidity and distribution, higher is better
      if (score >= 70) return 'text-green-400';
      if (score >= 40) return 'text-yellow-400';
      return 'text-red-400';
    }
  };

  const getVolumeRatioColor = (ratio: number | undefined) => {
    if (ratio === undefined) return 'text-gray-400';
    if (ratio > 2) return 'text-red-400'; // Too high, possible manipulation
    if (ratio > 1) return 'text-yellow-400'; // High activity
    if (ratio > 0.5) return 'text-green-400'; // Healthy
    return 'text-gray-400'; // Low activity
  };

  const getPriceChangeIcon = (change: number | undefined) => {
    if (change === undefined) return null;
    if (change > 0) return <FaArrowUp className="inline w-3 h-3 ml-1 text-green-400" />;
    if (change < 0) return <FaArrowDown className="inline w-3 h-3 ml-1 text-red-400" />;
    return null;
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const token = sortedTokens[index];
    const isInWatchlist = watchlist.some(w => w.id === token.id);

    return (
      <div
        style={style}
        className="bg-gray-800 p-2 flex items-center space-x-4 text-white rounded shadow-sm hover:bg-gray-700 transition-colors cursor-pointer"
        role="row"
        aria-label={`Token ${token.symbol}`}
        onClick={(e) => {
          // Don't navigate if clicking on buttons
          if ((e.target as HTMLElement).tagName !== 'BUTTON' &&
            !(e.target as HTMLElement).closest('button')) {
            router.push(`/tokens/${token.id}`);
          }
        }}
      >
        {/* Watchlist Star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToWatchlist(token);
          }}
          className={`p-1 rounded transition-colors ${isInWatchlist ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
            }`}
          title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <FaStar className="w-4 h-4" />
        </button>

        {/* Risk Indicator */}
        <div className="w-8">
          <RiskIndicator
            pumpDumpRiskScore={token.pumpDumpRiskScore}
            liquidityScore={token.liquidityScore}
            walletDistributionScore={token.walletDistributionScore}
            isVolumeHealthy={token.isVolumeHealthy}
            volumeMarketCapRatio={token.volumeMarketCapRatio}
            compact={true}
          />
        </div>

        {columns.map(col => (
          <div key={col} className="flex-1 text-sm truncate" role="cell">
            {col === 'symbol' ? (
              <div>
                <span className="font-semibold">{token.symbol}</span>
                {token.stats?.priceChange24h !== undefined && (
                  <span className={`ml-2 text-xs ${token.stats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {token.stats.priceChange24h >= 0 ? '+' : ''}{token.stats.priceChange24h.toFixed(2)}%
                    {getPriceChangeIcon(token.stats.priceChange24h)}
                  </span>
                )}
              </div>
            ) : col === 'chain' ? (
              <span className={`text-xs px-2 py-1 rounded capitalize ${token.chain === 'ethereum' ? 'bg-blue-900 text-blue-300' :
                token.chain === 'solana' ? 'bg-purple-900 text-purple-300' :
                  token.chain === 'bsc' ? 'bg-yellow-900 text-yellow-300' :
                    token.chain === 'arbitrum' ? 'bg-cyan-900 text-cyan-300' :
                      token.chain === 'base' ? 'bg-indigo-900 text-indigo-300' :
                        'bg-gray-700 text-gray-300'
                }`}>{token.chain || '-'}</span>
            ) : col === 'exchange' ? (
              <span className="text-xs bg-gray-700 px-2 py-1 rounded">{token.exchange || 'N/A'}</span>
            ) : col === 'price' ? (
              <div className="flex flex-col">
                <span className="font-medium">{formatNumber(token.price)}</span>
              </div>
            ) : col === 'volume24h' ? (
              <span className={token.volume24h && token.volume24h > 1e6 ? 'text-green-400' : ''}>
                {formatNumber(token.volume24h)}
              </span>
            ) : col === 'marketCap' ? (
              formatNumber(token.marketCap)
            ) : col === 'volumeMarketCapRatio' ? (
              <span className={getVolumeRatioColor(token.volumeMarketCapRatio)}>
                {formatRatio(token.volumeMarketCapRatio)}
                {token.volumeMarketCapRatio && token.volumeMarketCapRatio > 1.5 && (
                  <FaExclamationTriangle className="inline w-3 h-3 ml-1" />
                )}
              </span>
            ) : col === 'isVolumeHealthy' ? (
              token.isVolumeHealthy !== undefined ? (
                token.isVolumeHealthy ? (
                  <FaCheckCircle className="text-green-400 w-4 h-4" />
                ) : (
                  <FaExclamationTriangle className="text-red-400 w-4 h-4" />
                )
              ) : (
                '-'
              )
            ) : col === 'pumpDumpRiskScore' ? (
              <span className={getScoreColor(token.pumpDumpRiskScore, 'risk')}>
                {formatScore(token.pumpDumpRiskScore)}
              </span>
            ) : col === 'liquidityScore' ? (
              <span className={getScoreColor(token.liquidityScore, 'liquidity')}>
                {formatScore(token.liquidityScore)}
              </span>
            ) : col === 'walletDistributionScore' ? (
              <span className={getScoreColor(token.walletDistributionScore, 'distribution')}>
                {formatScore(token.walletDistributionScore)}
              </span>
            ) : (
              '-'
            )}
          </div>
        ))}

        {/* Action Buttons */}
        {/* <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tokens/${token.id}`);
            }}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
          >
            Details
          </button>
        </div> */}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full sm:max-w-xs p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search tokens"
        />
        <div className="mt-2 sm:mt-0 sm:ml-4 flex space-x-2">
          <select
            onChange={e => requestSort(e.target.value as SortKey)}
            className="p-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort tokens by"
          >
            <option value="">Sort By</option>
            <option value="marketCap">Market Cap</option>
            <option value="volume24h">Volume 24h</option>
            <option value="price">Price</option>
            <option value="liquidityScore">Liquidity Score</option>
            <option value="pumpDumpRiskScore">Pump/Dump Risk</option>
            <option value="walletDistributionScore">Wallet Dist Score</option>
            <option value="exchange">Exchange</option>
          </select>
          <button
            onClick={showColumnModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Customize table columns"
          >
            Add/Remove Columns
          </button>
          <button
            onClick={onFilterClick}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
            aria-label="Open filter drawer"
          >
            Filter
          </button>
          <button
            onClick={showSortModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open sort options"
          >
            <FaSort className="mr-1" /> Sort
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="sticky top-0 bg-gray-900 z-10">
            <tr>
              <th className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"></th>
              <th className="w-12 px-2 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Risk</th>
              {columns.includes('symbol') && (
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Symbol</th>
              )}
              {columns.includes('chain') && (
                <th className="w-20 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
              )}
              {columns.includes('exchange') && (
                <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Exchange</th>
              )}
              {columns.includes('price') && (
                <th className="w-28 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
              )}
              {columns.includes('volume24h') && (
                <th className="w-28 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Volume 24h</th>
              )}
              {columns.includes('marketCap') && (
                <th className="w-28 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Market Cap</th>
              )}
              {columns.includes('volumeMarketCapRatio') && (
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Vol/Mkt Cap Ratio</th>
              )}
              {columns.includes('isVolumeHealthy') && (
                <th className="w-20 px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Health</th>
              )}
              {columns.includes('pumpDumpRiskScore') && (
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Pump/Dump Risk</th>
              )}
              {columns.includes('liquidityScore') && (
                <th className="w-28 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Liquidity Score</th>
              )}
              {columns.includes('walletDistributionScore') && (
                <th className="w-32 px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Wallet Dist Score</th>
              )}
              <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedTokens.map((token) => {
              const isInWatchlist = watchlist.some(w => w.id === token.id);
              return (
                <tr
                  key={token.id}
                  className="hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).tagName !== 'BUTTON' &&
                      !(e.target as HTMLElement).closest('button')) {
                      router.push(`/tokens/${token.id}`);
                    }
                  }}
                >
                  <td className="px-2 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToWatchlist(token);
                      }}
                      className={`p-1 rounded transition-colors ${isInWatchlist ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'
                        }`}
                      title={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                    >
                      <FaStar className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-2 py-3 text-center">
                    <RiskIndicator
                      pumpDumpRiskScore={token.pumpDumpRiskScore}
                      liquidityScore={token.liquidityScore}
                      walletDistributionScore={token.walletDistributionScore}
                      isVolumeHealthy={token.isVolumeHealthy}
                      volumeMarketCapRatio={token.volumeMarketCapRatio}
                      compact={true}
                    />
                  </td>
                  {columns.includes('symbol') && (
                    <td className="px-4 py-3 text-sm text-white">
                      <div>
                        <span className="font-semibold">{token.symbol}</span>
                        {token.stats?.priceChange24h !== undefined && (
                          <span className={`ml-2 text-xs ${token.stats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {token.stats.priceChange24h >= 0 ? '+' : ''}{token.stats.priceChange24h.toFixed(2)}%
                            {getPriceChangeIcon(token.stats.priceChange24h)}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {columns.includes('chain') && (
                    <td className="px-4 py-3 text-sm">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${token.chain === 'ethereum' ? 'bg-blue-900 text-blue-300' :
                        token.chain === 'solana' ? 'bg-purple-900 text-purple-300' :
                          token.chain === 'bsc' ? 'bg-yellow-900 text-yellow-300' :
                            token.chain === 'arbitrum' ? 'bg-cyan-900 text-cyan-300' :
                              token.chain === 'base' ? 'bg-indigo-900 text-indigo-300' :
                                'bg-gray-700 text-gray-300'
                        }`}>{token.chain || '-'}</span>
                    </td>
                  )}
                  {columns.includes('exchange') && (
                    <td className="px-4 py-3 text-sm">
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded">{token.exchange || 'N/A'}</span>
                    </td>
                  )}
                  {columns.includes('price') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="font-medium text-white">{formatNumber(token.price)}</span>
                    </td>
                  )}
                  {columns.includes('volume24h') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={token.volume24h && token.volume24h > 1e6 ? 'text-green-400' : 'text-white'}>
                        {formatNumber(token.volume24h)}
                      </span>
                    </td>
                  )}
                  {columns.includes('marketCap') && (
                    <td className="px-4 py-3 text-sm text-right text-white">
                      {formatNumber(token.marketCap)}
                    </td>
                  )}
                  {columns.includes('volumeMarketCapRatio') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={getVolumeRatioColor(token.volumeMarketCapRatio)}>
                        {formatRatio(token.volumeMarketCapRatio)}
                        {token.volumeMarketCapRatio && token.volumeMarketCapRatio > 1.5 && (
                          <FaExclamationTriangle className="inline w-3 h-3 ml-1" />
                        )}
                      </span>
                    </td>
                  )}
                  {columns.includes('isVolumeHealthy') && (
                    <td className="px-4 py-3 text-sm text-center">
                      {token.isVolumeHealthy !== undefined ? (
                        token.isVolumeHealthy ? (
                          <FaCheckCircle className="text-green-400 w-4 h-4 mx-auto" />
                        ) : (
                          <FaExclamationTriangle className="text-red-400 w-4 h-4 mx-auto" />
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}
                  {columns.includes('pumpDumpRiskScore') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={getScoreColor(token.pumpDumpRiskScore, 'risk')}>
                        {formatScore(token.pumpDumpRiskScore)}
                      </span>
                    </td>
                  )}
                  {columns.includes('liquidityScore') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={getScoreColor(token.liquidityScore, 'liquidity')}>
                        {formatScore(token.liquidityScore)}
                      </span>
                    </td>
                  )}
                  {columns.includes('walletDistributionScore') && (
                    <td className="px-4 py-3 text-sm text-right">
                      <span className={getScoreColor(token.walletDistributionScore, 'distribution')}>
                        {formatScore(token.walletDistributionScore)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/tokens/${token.id}`);
                      }}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isColumnModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md p-4 rounded-t-lg">
            <h2 className="text-lg font-bold text-white mb-4">Customize Table Columns</h2>
            {[
              'symbol',
              'chain',
              'exchange',
              'price',
              'volume24h',
              'marketCap',
              'volumeMarketCapRatio',
              'isVolumeHealthy',
              'pumpDumpRiskScore',
              'liquidityScore',
              'walletDistributionScore',
            ].map(key => (
              <div key={key} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="mr-2 h-4 w-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  id={`column-${key}`}
                  aria-label={`Toggle ${key} column`}
                />
                <label htmlFor={`column-${key}`} className="text-white">
                  {key === 'symbol' ? 'Symbol' :
                    key === 'chain' ? 'Chain' :
                      key === 'exchange' ? 'Exchange' :
                        key === 'volumeMarketCapRatio' ? 'Vol/Mkt Cap Ratio' :
                          key === 'isVolumeHealthy' ? 'Health' :
                            key === 'pumpDumpRiskScore' ? 'Pump/Dump Risk' :
                              key === 'walletDistributionScore' ? 'Wallet Dist Score' :
                                key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </label>
              </div>
            ))}
            <button
              onClick={handleColumnClose}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Close column customization"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {isSortModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md p-4 rounded-t-lg">
            <h2 className="text-lg font-bold text-white mb-4">Sort By</h2>
            {([
              'price',
              'marketCap',
              'volume24h',
              'volumeMarketCapRatio',
              'pumpDumpRiskScore',
              'liquidityScore',
              'walletDistributionScore',
              'chain',
              'exchange',
            ] as SortKey[]).map(key => (
              <div key={key} className="mb-2">
                <button
                  onClick={() => requestSort(key)}
                  className="w-full text-left p-2 bg-gray-700 rounded hover:bg-gray-600 text-white flex justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={`Sort by ${key}`}
                >
                  <span>{key === 'volumeMarketCapRatio' ? 'Vol/Mkt Cap Ratio' :
                    key === 'isVolumeHealthy' ? 'Health' :
                      key === 'pumpDumpRiskScore' ? 'Pump/Dump Risk' :
                        key === 'walletDistributionScore' ? 'Wallet Dist Score' :
                          key === 'chain' ? 'Chain' :
                            key === 'exchange' ? 'Exchange' :
                              key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  <span>{sortConfig?.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleSortClose}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
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
