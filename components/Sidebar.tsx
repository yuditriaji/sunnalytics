import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    FiHome,
    FiTrendingUp,
    FiStar,
    FiBriefcase,
    FiBell,
    FiSettings,
    FiSearch,
    FiChevronLeft,
} from 'react-icons/fi';

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome, href: '/' },
    { id: 'market', label: 'Market', icon: FiTrendingUp, href: '/charts' },
    { id: 'watchlist', label: 'Watchlist', icon: FiStar, href: '/watchlist' },
    { id: 'portfolio', label: 'Portfolio', icon: FiBriefcase, href: '/portfolio' },
    { id: 'alerts', label: 'Alerts', icon: FiBell, href: '/alerts' },
    { id: 'settings', label: 'Settings', icon: FiSettings, href: '/settings' },
];

export default function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const isActive = (href: string) => {
        if (href === '/') return router.pathname === '/';
        return router.pathname.startsWith(href);
    };

    return (
        <aside
            className={`
        fixed left-0 top-0 h-screen z-50
        bg-[#0D1117] border-r border-white/5
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-[200px]'}
        hidden lg:flex flex-col
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    {!collapsed && (
                        <span className="text-white font-semibold text-base">Sunnalytics</span>
                    )}
                </Link>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="px-3 py-4">
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-[#1F2937] border border-white/5 rounded-lg
                text-white text-sm placeholder-gray-500
                focus:border-cyan-500/30 transition-colors"
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-2 py-2">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                flex items-center gap-3 h-10 px-3 mb-1 rounded-lg
                transition-all duration-150
                ${active
                                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
                        >
                            <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                            {!collapsed && (
                                <span className="text-sm font-medium">{item.label}</span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Collapse Button */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={onToggle}
                    className={`
            flex items-center gap-2 w-full h-9 px-3 rounded-lg
            text-gray-400 hover:text-white hover:bg-white/5
            transition-all
            ${collapsed ? 'justify-center px-0' : ''}
          `}
                >
                    <FiChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
                    {!collapsed && <span className="text-sm">Collapse</span>}
                </button>
            </div>
        </aside>
    );
}
