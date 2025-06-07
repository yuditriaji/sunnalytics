import React from 'react';
import { useRouter } from 'next/router';
import { FaHome, FaWallet, FaFilter, FaSearch, FaCog } from 'react-icons/fa';

interface BottomNavProps {
  onFilterClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ onFilterClick }) => {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 h-16 p-2 flex justify-around items-center border-t border-gray-700 shadow-lg pb-safe-area-inset-bottom">
      <button
        onClick={() => router.push('/')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaHome className="text-lg" />
        <span>Market</span>
      </button>
      <button
        onClick={() => router.push('/portfolio')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/portfolio' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaWallet className="text-lg" />
        <span>Portfolio</span>
      </button>
      <button
        onClick={onFilterClick}
        className={`flex flex-col items-center text-xs ${
          router.pathname.includes('filter') ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaFilter className="text-lg" />
        <span>Filter</span>
      </button>
      <button
        onClick={() => router.push('/search')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/search' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaSearch className="text-lg" />
        <span>Search</span>
      </button>
      <button
        onClick={() => router.push('/settings')}
        className={`flex flex-col items-center text-xs ${
          router.pathname === '/settings' ? 'text-yellow-400' : 'text-gray-400'
        } hover:text-yellow-400 transition-all duration-200 hover:scale-110`}
      >
        <FaCog className="text-lg" />
        <span>Settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;