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
      setFilteredTokens(filtered);
    };

    applyFilters();
  }, [filters, tokens, setFilteredTokens]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '' });
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