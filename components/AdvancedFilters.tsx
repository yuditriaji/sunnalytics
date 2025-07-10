import React, { useState, useEffect } from 'react';
import { useTokenStore } from '../stores/useTokenStore';
import { FaFilter, FaSave, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface FilterPreset {
  name: string;
  description: string;
  filters: FilterState;
}

interface FilterState {
  category: string;
  exchange: string;
  minPrice: string;
  maxPrice: string;
  minVolumeMarketCapRatio: string;
  maxVolumeMarketCapRatio: string;
  minCirculatingSupplyPercentage: string;
  maxCirculatingSupplyPercentage: string;
  isVolumeHealthy: string;
  isCirculatingSupplyGood: string;
  minLiquidityScore: string;
  maxPumpDumpRiskScore: string;
  minWalletDistributionScore: string;
}

const defaultFilters: FilterState = {
  category: '',
  exchange: '',
  minPrice: '',
  maxPrice: '',
  minVolumeMarketCapRatio: '',
  maxVolumeMarketCapRatio: '',
  minCirculatingSupplyPercentage: '',
  maxCirculatingSupplyPercentage: '',
  isVolumeHealthy: '',
  isCirculatingSupplyGood: '',
  minLiquidityScore: '',
  maxPumpDumpRiskScore: '',
  minWalletDistributionScore: '',
};

const presetFilters: FilterPreset[] = [
  {
    name: 'Safe Investments',
    description: 'Low risk tokens with good fundamentals',
    filters: {
      ...defaultFilters,
      isVolumeHealthy: 'true',
      minLiquidityScore: '70',
      maxPumpDumpRiskScore: '30',
      minWalletDistributionScore: '70',
      minVolumeMarketCapRatio: '0.1',
      maxVolumeMarketCapRatio: '1',
    },
  },
  {
    name: 'High Risk/Reward',
    description: 'Volatile tokens with potential',
    filters: {
      ...defaultFilters,
      minVolumeMarketCapRatio: '1',
      minLiquidityScore: '30',
      maxPumpDumpRiskScore: '70',
    },
  },
  {
    name: 'Volume Anomalies',
    description: 'Tokens with unusual trading volume',
    filters: {
      ...defaultFilters,
      minVolumeMarketCapRatio: '1.5',
    },
  },
  {
    name: 'Healthy DeFi',
    description: 'DeFi tokens with good metrics',
    filters: {
      ...defaultFilters,
      category: 'defi',
      isVolumeHealthy: 'true',
      minLiquidityScore: '50',
      minWalletDistributionScore: '50',
    },
  },
];

interface AdvancedFiltersProps {
  isCompact?: boolean;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ isCompact = false }) => {
  const { setFilters: setStoreFilters, tokens, setFilteredTokens } = useTokenStore();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customPresets, setCustomPresets] = useState<FilterPreset[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isCompact);
  const [newPresetName, setNewPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);

  useEffect(() => {
    // Load custom presets from localStorage
    const saved = localStorage.getItem('sunnalytics-filter-presets');
    if (saved) {
      setCustomPresets(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, tokens]);

  const applyFilters = () => {
    let filtered = [...tokens];

    // Apply all filters
    if (filters.category) {
      filtered = filtered.filter(token => token.category === filters.category);
    }
    if (filters.exchange) {
      filtered = filtered.filter(token => token.exchange?.toLowerCase() === filters.exchange.toLowerCase());
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
      const min = parseFloat(filters.minVolumeMarketCapRatio);
      filtered = filtered.filter(token => token.volumeMarketCapRatio !== undefined && token.volumeMarketCapRatio >= min);
    }
    if (filters.maxVolumeMarketCapRatio) {
      const max = parseFloat(filters.maxVolumeMarketCapRatio);
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
    if (filters.minLiquidityScore) {
      const min = parseFloat(filters.minLiquidityScore);
      filtered = filtered.filter(token => token.liquidityScore !== undefined && token.liquidityScore >= min);
    }
    if (filters.maxPumpDumpRiskScore) {
      const max = parseFloat(filters.maxPumpDumpRiskScore);
      filtered = filtered.filter(token => token.pumpDumpRiskScore !== undefined && token.pumpDumpRiskScore <= max);
    }
    if (filters.minWalletDistributionScore) {
      const min = parseFloat(filters.minWalletDistributionScore);
      filtered = filtered.filter(token => token.walletDistributionScore !== undefined && token.walletDistributionScore >= min);
    }

    setFilteredTokens(filtered);
    setStoreFilters(filters);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSelectedPreset('');
  };

  const handleRangeChange = (name: string, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setSelectedPreset('');
  };

  const handlePresetSelect = (preset: FilterPreset) => {
    setFilters(preset.filters);
    setSelectedPreset(preset.name);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setSelectedPreset('');
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim()) return;

    const newPreset: FilterPreset = {
      name: newPresetName,
      description: 'Custom filter preset',
      filters: { ...filters },
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem('sunnalytics-filter-presets', JSON.stringify(updated));
    setNewPresetName('');
    setShowSavePreset(false);
  };

  const deleteCustomPreset = (name: string) => {
    const updated = customPresets.filter(p => p.name !== name);
    setCustomPresets(updated);
    localStorage.setItem('sunnalytics-filter-presets', JSON.stringify(updated));
  };

  const activeFiltersCount = Object.entries(filters).filter(([_, value]) => value !== '').length;

  if (isCompact) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-yellow-400" />
            <span className="font-semibold text-white">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4">
            {/* Preset Filters */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Quick Presets</h3>
              <div className="flex flex-wrap gap-2">
                {[...presetFilters, ...customPresets].map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handlePresetSelect(preset)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors ${
                      selectedPreset === preset.name
                        ? 'bg-yellow-500 text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                    title={preset.description}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="altcoin">Altcoin</option>
                  <option value="defi">DeFi</option>
                  <option value="memecoin">Memecoin</option>
                </select>
              </div>

              {/* Exchange */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Exchange</label>
                <select
                  name="exchange"
                  value={filters.exchange}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="binance">Binance</option>
                  <option value="bybit_spot">Bybit Spot</option>
                </select>
              </div>

              {/* Volume/Market Cap Ratio */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Vol/MCap Ratio: {filters.minVolumeMarketCapRatio || '0'} - {filters.maxVolumeMarketCapRatio || '∞'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="minVolumeMarketCapRatio"
                    value={filters.minVolumeMarketCapRatio}
                    onChange={handleChange}
                    className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="Min"
                    step="0.1"
                  />
                  <input
                    type="number"
                    name="maxVolumeMarketCapRatio"
                    value={filters.maxVolumeMarketCapRatio}
                    onChange={handleChange}
                    className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                    placeholder="Max"
                    step="0.1"
                  />
                </div>
              </div>

              {/* Liquidity Score */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Min Liquidity Score: {filters.minLiquidityScore || '0'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minLiquidityScore || '0'}
                  onChange={(e) => handleRangeChange('minLiquidityScore', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Pump/Dump Risk */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Max P&D Risk: {filters.maxPumpDumpRiskScore || '100'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.maxPumpDumpRiskScore || '100'}
                  onChange={(e) => handleRangeChange('maxPumpDumpRiskScore', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Wallet Distribution */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Min Wallet Distribution: {filters.minWalletDistributionScore || '0'}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.minWalletDistributionScore || '0'}
                  onChange={(e) => handleRangeChange('minWalletDistributionScore', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Volume Health */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Volume Health</label>
                <select
                  name="isVolumeHealthy"
                  value={filters.isVolumeHealthy}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="true">Healthy Only</option>
                  <option value="false">Unhealthy Only</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowSavePreset(!showSavePreset)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Preset
                </button>
              </div>
              <div className="text-sm text-gray-400">
                {tokens.length - (tokens.length - activeFiltersCount)} tokens match filters
              </div>
            </div>

            {/* Save Preset Dialog */}
            {showSavePreset && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Enter preset name"
                  className="w-full p-2 bg-gray-600 border border-gray-500 rounded text-white mb-2"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={saveCustomPreset}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSavePreset(false);
                      setNewPresetName('');
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Custom Presets */}
            {customPresets.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Presets</h3>
                <div className="space-y-2">
                  {customPresets.map(preset => (
                    <div key={preset.name} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                      <button
                        onClick={() => handlePresetSelect(preset)}
                        className="text-sm text-white hover:text-yellow-400"
                      >
                        {preset.name}
                      </button>
                      <button
                        onClick={() => deleteCustomPreset(preset.name)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full sidebar version for desktop
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center">
        <FaFilter className="mr-2 text-yellow-400" />
        Advanced Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full">
            {activeFiltersCount} active
          </span>
        )}
      </h2>

      {/* Content similar to compact version but with more spacing */}
      {/* ... (same content as above but with adjusted spacing) ... */}
    </div>
  );
};

export default AdvancedFilters;
