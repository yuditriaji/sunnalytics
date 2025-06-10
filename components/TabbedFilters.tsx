// components/TabbedFilters.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTokenStore } from '../stores/useTokenStore';

const tabs = [
  { id: 'all', label: 'All' },
  { id: 'highlights', label: 'Highlights', badge: '🔥' },
  { id: 'trending', label: 'Trending', badge: '📈' },
  { id: 'pumpfun', label: 'Pump.fun' },
  { id: 'ecosystems', label: 'Ecosystems' },
];

const TabbedFilters: React.FC = () => {
  const { setFilteredTokens, tokens } = useTokenStore();
  const [activeTab, setActiveTab] = useState('all');

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'all') {
      setFilteredTokens(tokens);
    } else {
      setFilteredTokens(tokens.filter(token => token.category.toLowerCase() === tabId));
    }
  };

  return (
    <div className="mb-4">
      <div
        className="flex space-x-2 overflow-x-auto pb-2"
        role="tablist"
        aria-label="Token Categories"
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            {tab.label}
            {tab.badge && <span className="ml-1">{tab.badge}</span>}
          </button>
        ))}
      </div>
      <AnimatePresence>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={activeTab}
        >
          {/* Content managed by TokenTable */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TabbedFilters;