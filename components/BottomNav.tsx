// components/BottomNav.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { FaChartLine, FaFilter, FaSearch, FaHome, FaStar, FaRobot } from 'react-icons/fa';

interface BottomNavProps {
  onFilterClick?: () => void;
  onSearchFocus?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onFilterClick, onSearchFocus }) => {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 h-20 p-2 flex justify-around items-center border-t border-gray-700 shadow-lg pb-safe-area-inset-bottom">
      <button
        onClick={() => router.push('/')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaHome className="text-lg mb-1" />
        <span>Market</span>
      </button>
      <button
        onClick={() => router.push('/watchlist')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/watchlist' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaStar className="text-lg mb-1" />
        <span>Watchlist</span>
      </button>
      <button
        onClick={onSearchFocus}
        className="flex flex-col items-center text-xs text-gray-400 hover:text-yellow-400 transition-all duration-200 hover:scale-110"
      >
        <FaSearch className="text-lg mb-1" />
        <span>Search</span>
      </button>
      <button
        onClick={() => router.push('/ai-picks')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/ai-picks' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaRobot className="text-lg mb-1" />
        <span>AI Picks</span>
      </button>
      <button
        onClick={() => router.push('/charts')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/charts' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaChartLine className="text-lg mb-1" />
        <span>Charts</span>
      </button>
    </nav>
  );
};

export default BottomNav;