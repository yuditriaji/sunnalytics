// components/BottomNav.tsx
import React from 'react';
import { useRouter } from 'next/router';
import { FaChartLine, FaSearch, FaHome, FaStar, FaBell } from 'react-icons/fa';

interface BottomNavProps {
  onFilterClick?: () => void;
  onSearchFocus?: () => void;
}

const navItems = [
  { id: 'home', label: 'Market', icon: FaHome, href: '/' },
  { id: 'watchlist', label: 'Watchlist', icon: FaStar, href: '/watchlist' },
  { id: 'search', label: 'Search', icon: FaSearch, href: null },
  { id: 'charts', label: 'Charts', icon: FaChartLine, href: '/charts' },
  { id: 'alerts', label: 'Alerts', icon: FaBell, href: '/alerts' },
];

const BottomNav: React.FC<BottomNavProps> = ({ onSearchFocus }) => {
  const router = useRouter();

  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === '/') return router.pathname === '/';
    return router.pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Blur background */}
      <div className="absolute inset-0 bg-[#0D1321]/90 backdrop-blur-xl border-t border-white/5" />

      {/* Content */}
      <div className="relative flex justify-around items-center h-16 pb-safe-area-inset-bottom">
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
              className={`
                flex flex-col items-center justify-center gap-1 px-4 py-2
                transition-all duration-200
                ${active ? 'text-cyan-400' : 'text-gray-500'}
              `}
            >
              <div className={`
                relative p-2 rounded-xl transition-all
                ${active ? 'bg-cyan-500/10' : 'hover:bg-white/5'}
              `}>
                <Icon className="w-5 h-5" />
                {active && (
                  <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-lg" />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;