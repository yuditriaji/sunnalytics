import React from 'react';
import { useRouter } from 'next/router';
import { FaChartLine, FaFilter, FaWallet, FaHome } from 'react-icons/fa';

interface BottomNavProps {
  onFilterClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onFilterClick }) => {
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
        onClick={() => router.push('/portfolio')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/portfolio' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaWallet className="text-lg mb-1" />
        <span>Portfolio</span>
      </button>
      <button
        onClick={onFilterClick}
        className="flex flex-col items-center text-xs text-gray-400 hover:text-yellow-400 transition-all duration-200 hover:scale-110"
      >
        <FaFilter className="text-lg mb-1" />
        <span>Filter</span>
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