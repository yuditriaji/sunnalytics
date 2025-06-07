import React, { useState, useMemo, memo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import FilterDrawer from './FilterDrawer';
import { FaSort } from 'react-icons/fa';

interface Token {
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
}

interface TokenTableProps {
  isFilterDrawerOpen: boolean;
  onFilterClick: () => void;
  onFilterClose: () => void;
}

const TokenTable: React.FC<TokenTableProps> = memo(({ isFilterDrawerOpen, onFilterClick, onFilterClose }) => {
  const { filteredTokens } = useTokenStore();
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'symbol',
    'category',
    'price',
    'marketCap',
    'volume24h',
    'transferVolume24h',
    'fullyDilutedValuation',
    'volumeMarketCapRatio',
    'circulatingSupplyPercentage',
    'isVolumeHealthy',
    'isCirculatingSupplyGood',
    'potentialMultiplier',
  ]);
  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);
  const [isSortModalVisible, setIsSortModalVisible] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
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

  const requestSort = (key: string) => {
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
    return [...filteredTokens].sort((a, b) => {
      if (a[sortConfig.key as keyof Token] === undefined || b[sortConfig.key as keyof Token] === undefined) return 0;
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key as keyof Token]! > b[sortConfig.key as keyof Token]! ? 1 : -1;
      }
      return a[sortConfig.key as keyof Token]! < b[sortConfig.key as keyof Token]! ? 1 : -1;
    });
  }, [filteredTokens, sortConfig]);

  const columns = [
    'name',
    'symbol',
    'category',
    'price',
    'marketCap',
    'volume24h',
    'transferVolume24h',
    'fullyDilutedValuation',
    'volumeMarketCapRatio',
    'circulatingSupplyPercentage',
    'isVolumeHealthy',
    'isCirculatingSupplyGood',
    'potentialMultiplier',
  ].filter(col => visibleColumns.includes(col));

  const formatNumber = (value: number | undefined, suffix: string = '') => {
    if (value === undefined || value === 0) return '-';
    if (value >= 1e9) return `$${Math.floor(value / 1e9)}${suffix}B`;
    if (value >= 1e6) return `$${Math.floor(value / 1e6)}${suffix}M`;
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  const formatRatio = (value: number | undefined) => value !== undefined ? `${(value * 100).toFixed(2)}%` : '-';
  const formatPercentage = (value: number | undefined) => value !== undefined ? `${value.toFixed(2)}%` : '-';
  const formatBoolean = (value: boolean | undefined) => value !== undefined ? (value ? 'Yes' : 'No') : '-';
  const formatMultiplier = (value: number | undefined) => value !== undefined ? value.toFixed(2) : '-';

  return (
    <div className="p-4">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search tokens..."
          className="w-full sm:max-w-xs p-2 border border-gray-300 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-2 sm:mt-0 sm:ml-4 flex space-x-2">
          <button
            onClick={showColumnModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Add/Remove Columns
          </button>
          <button
            onClick={onFilterClick}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors"
          >
            Filter
          </button>
          <button
            onClick={showSortModal}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center"
          >
            <FaSort className="mr-1" /> Sort
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {sortedTokens.map((token: Token) => (
          <div key={token.name} className="bg-gray-800 p-4 rounded shadow flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold">{token.name}</span>
              <span className="text-gray-400">({token.category})</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {visibleColumns.includes('price') && (
                <div className="text-sm">
                  <span className="font-medium">Price:</span> {formatNumber(token.price)}
                </div>
              )}
              {visibleColumns.includes('marketCap') && (
                <div className="text-sm">
                  <span className="font-medium">Market Cap:</span> {formatNumber(token.marketCap, '')}
                </div>
              )}
              {visibleColumns.includes('volume24h') && (
                <div className="text-sm">
                  <span className="font-medium">Volume 24h:</span> {formatNumber(token.volume24h, '')}
                </div>
              )}
              {visibleColumns.includes('transferVolume24h') && (
                <div className="text-sm">
                  <span className="font-medium">Transfer Vol 24h:</span> {token.transferVolume24h ? `$${token.transferVolume24h.toLocaleString()}` : '-'}
                </div>
              )}
              {visibleColumns.includes('fullyDilutedValuation') && (
                <div className="text-sm">
                  <span className="font-medium">Fully Diluted Val:</span> {formatNumber(token.fullyDilutedValuation, '')}
                </div>
              )}
              {visibleColumns.includes('volumeMarketCapRatio') && (
                <div className="text-sm">
                  <span className="font-medium">Vol/MC Ratio:</span> {formatRatio(token.volumeMarketCapRatio)}
                </div>
              )}
              {visibleColumns.includes('circulatingSupplyPercentage') && (
                <div className="text-sm">
                  <span className="font-medium">Circ. Supply %:</span> {formatPercentage(token.circulatingSupplyPercentage)}
                </div>
              )}
              {visibleColumns.includes('isVolumeHealthy') && (
                <div className="text-sm">
                  <span className="font-medium">Vol Healthy:</span> {formatBoolean(token.isVolumeHealthy)}
                </div>
              )}
              {visibleColumns.includes('isCirculatingSupplyGood') && (
                <div className="text-sm">
                  <span className="font-medium">Circ. Supply Good:</span> {formatBoolean(token.isCirculatingSupplyGood)}
                </div>
              )}
              {visibleColumns.includes('potentialMultiplier') && (
                <div className="text-sm">
                  <span className="font-medium">Potential Multiplier:</span> {formatMultiplier(token.potentialMultiplier)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {isColumnModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-gray-800 w-full max-w-md p-4 rounded-t-lg">
            <h2 className="text-lg font-bold text-white mb-4">Customize Table Columns</h2>
            {[
              'name',
              'symbol',
              'category',
              'price',
              'marketCap',
              'volume24h',
              'transferVolume24h',
              'fullyDilutedValuation',
              'volumeMarketCapRatio',
              'circulatingSupplyPercentage',
              'isVolumeHealthy',
              'isCirculatingSupplyGood',
              'potentialMultiplier',
            ].map(key => (
              <div key={key} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(key)}
                  onChange={() => toggleColumn(key)}
                  className="mr-2 h-4 w-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                />
                <span className="text-white">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </span>
              </div>
            ))}
            <button
              onClick={handleColumnClose}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors"
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
            {[
              'price',
              'marketCap',
              'volume24h',
              'transferVolume24h',
              'fullyDilutedValuation',
              'volumeMarketCapRatio',
              'circulatingSupplyPercentage',
              'potentialMultiplier',
            ].map(key => (
              <div key={key} className="mb-2">
                <button
                  onClick={() => requestSort(key)}
                  className="w-full text-left p-2 bg-gray-700 rounded hover:bg-gray-600 text-white flex justify-between"
                >
                  <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  <span>{sortConfig?.key === key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleSortClose}
              className="w-full mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors"
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