import { useState } from 'react';
import TokenTable from '../components/TokenTable';
import BottomNav from '../components/BottomNav';
import FilterDrawer from '../components/FilterDrawer';

export default function Home() {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  const handleFilterClick = () => {
    setIsFilterDrawerOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Sunnalytics</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search tokens..."
            className="p-2 border border-gray-600 rounded bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleFilterClick}
            className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 transition-colors"
          >
            Filter
          </button>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <TokenTable
          isFilterDrawerOpen={isFilterDrawerOpen}
          onFilterClick={handleFilterClick}
          onFilterClose={handleFilterClose}
        />
      </main>
      <BottomNav onFilterClick={handleFilterClick} />
      <FilterDrawer isOpen={isFilterDrawerOpen} onClose={handleFilterClose} />
    </div>
  );
}