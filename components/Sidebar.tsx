import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    FaHome,
    FaChartLine,
    FaBriefcase,
    FaNewspaper,
    FaCog,
    FaSearch,
    FaBell,
    FaStar,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome, href: '/' },
    { id: 'market', label: 'Market', icon: FaChartLine, href: '/charts' },
    { id: 'watchlist', label: 'Watchlist', icon: FaStar, href: '/watchlist' },
    { id: 'portfolio', label: 'Portfolio', icon: FaBriefcase, href: '/portfolio' },
    { id: 'alerts', label: 'Alerts', icon: FaBell, href: '/alerts' },
    { id: 'settings', label: 'Settings', icon: FaCog, href: '/settings' },
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
        fixed left-0 top-0 h-screen z-40
        bg-[#0D1321] border-r border-white/5
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[240px]'}
        hidden lg:flex flex-col
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    {!collapsed && (
                        <span className="text-white font-semibold text-lg">Sunnalytics</span>
                    )}
                </Link>
            </div>

            {/* Search */}
            {!collapsed && (
                <div className="p-4">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                text-white placeholder-gray-500 text-sm
                focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30
                transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 px-3 py-2 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                            <li key={item.id}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200
                    ${active
                                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                                        }
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${active ? 'text-cyan-400' : ''}`} />
                                    {!collapsed && (
                                        <span className="text-sm font-medium">{item.label}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Collapse Toggle */}
            <div className="p-3 border-t border-white/5">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 
            text-gray-400 hover:text-white hover:bg-white/5 
            rounded-xl transition-all"
                >
                    {collapsed ? (
                        <FaChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <FaChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
