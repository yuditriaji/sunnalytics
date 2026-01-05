import React from 'react';
import { useRouter } from 'next/router';
import { FiHome, FiStar, FiSearch, FiTrendingUp, FiBell } from 'react-icons/fi';

interface BottomNavProps {
  onFilterClick?: () => void;
  onSearchFocus?: () => void;
}

const navItems = [
  { id: 'home', label: 'Market', icon: FiHome, href: '/' },
  { id: 'watchlist', label: 'Watchlist', icon: FiStar, href: '/watchlist' },
  { id: 'search', label: 'Search', icon: FiSearch, href: null },
  { id: 'charts', label: 'Charts', icon: FiTrendingUp, href: '/charts' },
  { id: 'alerts', label: 'Alerts', icon: FiBell, href: '/alerts' },
];

const BottomNav: React.FC<BottomNavProps> = ({ onSearchFocus }) => {
  const router = useRouter();

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D1117] border-t border-white/5 pb-safe">
      <div className="flex justify-around items-center h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'search' && onSearchFocus) {
                  onSearchFocus();
                } else if (item.href) {
                  router.push(item.href);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors ${active ? 'text-cyan-400' : 'text-gray-500'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;