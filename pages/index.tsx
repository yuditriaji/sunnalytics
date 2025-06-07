import { useEffect, useState } from 'react';
import BottomNav from '../components/BottomNav';
import TokenTable from '../components/TokenTable';
import { useTokenStore } from '../stores/useTokenStore';
import { useTokenData } from '../hooks/useTokenData';

export default function Home() {
  const { loading, error } = useTokenStore();
  const { fetchTokens } = useTokenData();
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const handleFilterClick = () => {
    setIsFilterDrawerOpen(true);
  };

  const handleFilterClose = () => {
    setIsFilterDrawerOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-safe-area-inset-bottom bg-gray-900 text-white">
      <main className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Market</h1>
          <div className="text-sm text-gray-400">Portfolio</div>
        </div>
        {loading && <p className="text-center text-gray-400">Loading tokens...</p>}
        {error && (
          <p className="text-center text-red-500">
            Error: {error}{' '}
            <button onClick={fetchTokens} className="text-blue-500 underline">
              Retry
            </button>
          </p>
        )}
        {!loading && !error && (
          <TokenTable
            isFilterDrawerOpen={isFilterDrawerOpen}
            onFilterClick={handleFilterClick}
            onFilterClose={handleFilterClose}
          />
        )}
      </main>
      <BottomNav onFilterClick={handleFilterClick} />
    </div>
  );
}