import React, { useState, memo } from 'react';
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

  const requestSort = (key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' };
      }
      return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  };

  const sortedTokens = React.useMemo(() => {
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
            onClick={() => requestSort('price')}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center"
          >
            <FaSort className="mr-1" /> Sort
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="sm:hidden">
          {sortedTokens.map((token: Token) => (
            <div key={token.name} className="bg-gray-800 p-4 mb-2 rounded shadow">
              <div className="font-bold">{token.name}</div>
              {visibleColumns.map(col => (
                <div key={col} className="text-sm">
                  <span className="font-medium capitalize">{col.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                  {col === 'price' && formatNumber(token.price)}
                  {col === 'marketCap' && formatNumber(token.marketCap, '')}
                  {col === 'volume24h' && formatNumber(token.volume24h, '')}
                  {col === 'transferVolume24h' && (token.transferVolume24h ? `$${token.transferVolume24h.toLocaleString()}` : '-')}
                  {col === 'fullyDilutedValuation' && formatNumber(token.fullyDilutedValuation, '')}
                  {col === 'volumeMarketCapRatio' && formatRatio(token.volumeMarketCapRatio)}
                  {col === 'circulatingSupplyPercentage' && formatPercentage(token.circulatingSupplyPercentage)}
                  {col === 'isVolumeHealthy' && formatBoolean(token.isVolumeHealthy)}
                  {col === 'isCirculatingSupplyGood' && formatBoolean(token.isCirculatingSupplyGood)}
                  {col === 'potentialMultiplier' && formatMultiplier(token.potentialMultiplier)}
                  {col === 'symbol' && token.symbol.toUpperCase()}
                  {col === 'category' && token.category}
                </div>
              ))}
            </div>
          ))}
        </div>
        <table className="min-w-full divide-y divide-gray-600 hidden sm:table">
          <thead className="bg-gray-700">
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {sortedTokens.map((token: Token) => (
              <tr key={token.name}>
                {visibleColumns.includes('name') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {token.name}
                  </td>
                )}
                {visibleColumns.includes('symbol') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {token.symbol.toUpperCase()}
                  </td>
                )}
                {visibleColumns.includes('category') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {token.category}
                  </td>
                )}
                {visibleColumns.includes('price') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatNumber(token.price)}
                  </td>
                )}
                {visibleColumns.includes('marketCap') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatNumber(token.marketCap, '')}
                  </td>
                )}
                {visibleColumns.includes('volume24h') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatNumber(token.volume24h, '')}
                  </td>
                )}
                {visibleColumns.includes('transferVolume24h') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {token.transferVolume24h ? `$${token.transferVolume24h.toLocaleString()}` : '-'}
                  </td>
                )}
                {visibleColumns.includes('fullyDilutedValuation') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatNumber(token.fullyDilutedValuation, '')}
                  </td>
                )}
                {visibleColumns.includes('volumeMarketCapRatio') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatRatio(token.volumeMarketCapRatio)}
                  </td>
                )}
                {visibleColumns.includes('circulatingSupplyPercentage') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatPercentage(token.circulatingSupplyPercentage)}
                  </td>
                )}
                {visibleColumns.includes('isVolumeHealthy') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatBoolean(token.isVolumeHealthy)}
                  </td>
                )}
                {visibleColumns.includes('isCirculatingSupplyGood') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatBoolean(token.isCirculatingSupplyGood)}
                  </td>
                )}
                {visibleColumns.includes('potentialMultiplier') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {formatMultiplier(token.potentialMultiplier)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
      <FilterDrawer isOpen={isFilterDrawerOpen} onClose={onFilterClose} />
    </div>
  );
});

export default TokenTable;