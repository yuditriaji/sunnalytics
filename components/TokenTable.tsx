import React, { useState, memo } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import FilterDrawer from './FilterDrawer';

interface Token {
  id: string;
  name: string;
  symbol: string;
  category: string;
  price?: number;
  marketCap?: number;
  volume24h?: number;
  transferVolume24h?: number;
  createdAt: string;
  updatedAt: string;
  volatilityScore24h?: number;
  fullyDilutedValuation?: number;
  volumeMarketCapRatio?: number;
  circulatingSupplyPercentage?: number;
  isVolumeHealthy?: boolean;
  isCirculatingSupplyGood?: boolean;
  potentialMultiplier?: number;
}

const TokenTable: React.FC = memo(() => {
  const { filteredTokens, setFilteredTokens, tokens } = useTokenStore();
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'name',
    'symbol',
    'price',
    'marketCap',
    'volume24h',
    'transferVolume24h',
    'volatilityScore24h',
    'volumeMarketCapRatio',
    'circulatingSupplyPercentage',
  ]);
  const [isColumnModalVisible, setIsColumnModalVisible] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

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

  const showFilterDrawer = () => {
    setIsFilterDrawerOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterDrawerOpen(false);
  };

  const columns = [
    'name',
    'symbol',
    'price',
    'marketCap',
    'volume24h',
    'transferVolume24h',
    'volatilityScore24h',
    'volumeMarketCapRatio',
    'circulatingSupplyPercentage',
  ].filter(col => visibleColumns.includes(col));

  const formatNumber = (value: number | undefined, suffix: string = '') => {
    if (value === undefined) return '-';
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
            onClick={showFilterDrawer}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {col.charAt(0).toUpperCase() + col.slice(1).replace(/([A-Z])/g, ' $1')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {filteredTokens.map((token: Token) => (
              <tr key={token.id}>
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
                    {token.transferVolume24h
                      ? `$${token.transferVolume24h.toLocaleString()}`
                      : '-'}
                  </td>
                )}
                {visibleColumns.includes('volatilityScore24h') && (
                  <td className="px-6 py-4 whitespace-nowrap text-white">
                    {token.volatilityScore24h !== undefined ? token.volatilityScore24h.toFixed(2) : '-'}
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
              'price',
              'marketCap',
              'volume24h',
              'transferVolume24h',
              'volatilityScore24h',
              'volumeMarketCapRatio',
              'circulatingSupplyPercentage',
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
      <FilterDrawer isOpen={isFilterDrawerOpen} onClose={handleFilterClose} />
    </div>
  );
});

export default TokenTable;