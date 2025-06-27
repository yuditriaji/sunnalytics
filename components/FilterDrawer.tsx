import React, { useState, useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FilterDrawer: React.FC<FilterDrawerProps> = ({ isOpen, onClose }) => {
  const { filteredTokens, setFilteredTokens, tokens } = useTokenStore();
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    minVolumeMarketCapRatio: '',
    maxVolumeMarketCapRatio: '',
    minCirculatingSupplyPercentage: '',
    maxCirculatingSupplyPercentage: '',
    isVolumeHealthy: '',
    isCirculatingSupplyGood: '',
    exchange: '',
  });

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...tokens];
      if (filters.category) {
        filtered = filtered.filter(token => token.category === filters.category);
      }
      if (filters.minPrice) {
        const min = parseFloat(filters.minPrice);
        filtered = filtered.filter(token => token.price !== undefined && token.price >= min);
      }
      if (filters.maxPrice) {
        const max = parseFloat(filters.maxPrice);
        filtered = filtered.filter(token => token.price !== undefined && token.price <= max);
      }
      if (filters.minVolumeMarketCapRatio) {
        const min = parseFloat(filters.minVolumeMarketCapRatio) / 100;
        filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio >= min);
      }
      if (filters.maxVolumeMarketCapRatio) {
        const max = parseFloat(filters.maxVolumeMarketCapRatio) / 100;
        filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio <= max);
      }
      if (filters.minCirculatingSupplyPercentage) {
        const min = parseFloat(filters.minCirculatingSupplyPercentage);
        filtered = filtered.filter(token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage >= min);
      }
      if (filters.maxCirculatingSupplyPercentage) {
        const max = parseFloat(filters.maxCirculatingSupplyPercentage);
        filtered = filtered.filter(token => token.circulatingSupplyPercentage !== undefined && token.circulatingSupplyPercentage <= max);
      }
      if (filters.isVolumeHealthy === 'true') {
        filtered = filtered.filter(token => token.isVolumeHealthy === true);
      } else if (filters.isVolumeHealthy === 'false') {
        filtered = filtered.filter(token => token.isVolumeHealthy === false);
      }
      if (filters.isCirculatingSupplyGood === 'true') {
        filtered = filtered.filter(token => token.isCirculatingSupplyGood === true);
      } else if (filters.isCirculatingSupplyGood === 'false') {
        filtered = filtered.filter(token => token.isCirculatingSupplyGood === false);
      }
      if (filters.exchange) {
        filtered = filtered.filter(token => token.exchange?.toLowerCase() === filters.exchange.toLowerCase());
      }
      setFilteredTokens(filtered);
    };

    applyFilters();
  }, [filters, tokens, setFilteredTokens]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      minVolumeMarketCapRatio: '',
      maxVolumeMarketCapRatio: '',
      minCirculatingSupplyPercentage: '',
      maxCirculatingSupplyPercentage: '',
      isVolumeHealthy: '',
      isCirculatingSupplyGood: '',
      exchange: '',
    });
    setFilteredTokens(tokens);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-gray-800 w-full max-w-md p-4 rounded-t-lg">
        <h2 className="text-lg font-bold text-white mb-4">Filter Tokens</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Category</label>
            <select
              name="category"
              value={filters.category}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">All</option>
              <option value="altcoin">Altcoin</option>
              <option value="defi">DeFi</option>
              <option value="memecoin">Memecoin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Exchange</label>
            <select
              name="exchange"
              value={filters.exchange}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">All</option>
              <option value="bybit_spot">Bybit_Spot</option>
              <option value="binance">Binance</option>
              <option value="coinbase">Coinbase</option>
              <option value="kraken">Kraken</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Min Price ($)</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0.00"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Max Price ($)</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0.00"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Min Volume Market Cap Ratio (%)</label>
            <input
              type="number"
              name="minVolumeMarketCapRatio"
              value={filters.minVolumeMarketCapRatio}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Max Volume Market Cap Ratio (%)</label>
            <input
              type="number"
              name="maxVolumeMarketCapRatio"
              value={filters.maxVolumeMarketCapRatio}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="100.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Min Circulating Supply (%)</label>
            <input
              type="number"
              name="minCirculatingSupplyPercentage"
              value={filters.minCirculatingSupplyPercentage}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="0.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Max Circulating Supply (%)</label>
            <input
              type="number"
              name="maxCirculatingSupplyPercentage"
              value={filters.maxCirculatingSupplyPercentage}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              placeholder="100.00"
              min="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Is Volume Healthy</label>
            <select
              name="isVolumeHealthy"
              value={filters.isVolumeHealthy}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Is Circulating Supply Good</label>
            <select
              name="isCirculatingSupplyGood"
              value={filters.isCirculatingSupplyGood}
              onChange={handleChange}
              className="mt-1 block w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-400 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;