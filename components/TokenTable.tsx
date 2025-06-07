import React, { useState, memo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import FilterDrawer from './FilterDrawer';

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
  const MAX_COLUMNS = 4; // Maximum number of visible columns for compact view
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'price',
    'marketCap',
    'volumeMarketCapRatio', // Default to a compact set like the screenshot
  ]);
  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => {
      const isCurrentlyVisible = prev.includes(key);
      const newVisibleColumns = isCurrentlyVisible
        ? prev.filter(col => col !== key)
        : [...prev.filter(col => col !== key), key];

      // Enforce MAX_COLUMNS limit
      if (newVisibleColumns.length > MAX_COLUMNS) {
        return prev; // Do not add if it exceeds the limit
      }
      return newVisibleColumns;
    });
  };

  const showColumnModal = () => {
    setIsColumnModalVisible(true);
  };

  const handleColumnClose = () => {
    setIsColumnModalVisible(false);
  };

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

  // Formatting functions
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
    <div className="p-2 sm:p-4">
      <div className="mb-2 sm:mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search tokens..."
          className="w-full sm:max-w-xs p-1 sm:p-2 border border-gray-300 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
        />
        <div className="mt-1 sm:mt-0 sm:ml-2 flex space-x-1 sm:space-x-2">
          <button
            onClick={showColumnModal}
            className="px-2 sm:px-4 py-1 sm:py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-xs sm:text-sm"
          >
            Add/Remove Columns
          </button>
          <button
            onClick={onFilterClick}
            className="px-2 sm:px-4 py-1 sm:py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors text-xs sm:text-sm"
          >
            Filter
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              {columns.map(col => (
                <th
                  key={col}
                  className="px-2 sm:px-4 py-1 sm:py-2 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {filteredTokens.map((token: Token) => (
              <tr key={token.name}>
                {visibleColumns.includes('name') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {token.name}
                  </td>
                )}
                {visibleColumns.includes('symbol') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {token.symbol.toUpperCase()}
                  </td>
                )}
                {visibleColumns.includes('category') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {token.category}
                  </td>
                )}
                {visibleColumns.includes('price') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatNumber(token.price)}
                  </td>
                )}
                {visibleColumns.includes('marketCap') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatNumber(token.marketCap, '')}
                  </td>
                )}
                {visibleColumns.includes('volume24h') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatNumber(token.volume24h, '')}
                  </td>
                )}
                {visibleColumns.includes('transferVolume24h') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {token.transferVolume24h
                      ? `$${token.transferVolume24h.toLocaleString()}`
                      : '-'}
                  </td>
                )}
                {visibleColumns.includes('fullyDilutedValuation') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatNumber(token.fullyDilutedValuation, '')}
                  </td>
                )}
                {visibleColumns.includes('volumeMarketCapRatio') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatRatio(token.volumeMarketCapRatio)}
                  </td>
                )}
                {visibleColumns.includes('circulatingSupplyPercentage') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatPercentage(token.circulatingSupplyPercentage)}
                  </td>
                )}
                {visibleColumns.includes('isVolumeHealthy') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatBoolean(token.isVolumeHealthy)}
                  </td>
                )}
                {visibleColumns.includes('isCirculatingSupplyGood') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
                    {formatBoolean(token.isCirculatingSupplyGood)}
                  </td>
                )}
                {visibleColumns.includes('potentialMultiplier') && (
                  <td className="px-2 sm:px-4 py-1 sm:py-2 whitespace-nowrap text-white text-xs sm:text-sm">
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
                <span className="text-white text-sm">
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