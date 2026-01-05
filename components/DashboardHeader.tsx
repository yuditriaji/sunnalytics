import React from 'react';
import { useUser } from '@clerk/nextjs';
import { FiBell, FiChevronDown } from 'react-icons/fi';
import { useRouter } from 'next/router';

interface DashboardHeaderProps {
    sidebarCollapsed?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ sidebarCollapsed = false }) => {
    const { user, isSignedIn } = useUser();
    const router = useRouter();

    return (
        <header
            className={`
        sticky top-0 z-40 h-16 bg-[#0A0E17] border-b border-white/5
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'}
      `}
        >
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-white font-semibold">Sunnalytics</span>
                </div>

                {/* Market Ticker - Desktop */}
                <div className="hidden lg:flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">BTC</span>
                        <span className="text-white font-medium">$91,295</span>
                        <span className="text-emerald-400 text-xs">+1.51%</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">ETH</span>
                        <span className="text-white font-medium">$3,138</span>
                        <span className="text-emerald-400 text-xs">+7.11%</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Market Cap</span>
                        <span className="text-white font-medium">$3.2T</span>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button
                        onClick={() => router.push('/alerts')}
                        className="relative w-9 h-9 flex items-center justify-center rounded-lg
              text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <FiBell className="w-[18px] h-[18px]" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
                    </button>

                    {/* User */}
                    {isSignedIn && user ? (
                        <button
                            onClick={() => router.push('/settings')}
                            className="flex items-center gap-2 h-9 px-2 rounded-lg
                hover:bg-white/5 transition-all"
                        >
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                                {user.imageUrl ? (
                                    <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-white text-xs font-medium">
                                        {user.firstName?.[0] || 'U'}
                                    </span>
                                )}
                            </div>
                            <span className="hidden sm:block text-sm text-white font-medium">
                                {user.firstName || 'User'}
                            </span>
                            <FiChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/sign-in')}
                            className="h-9 px-4 bg-cyan-500 hover:bg-cyan-400 
                text-black text-sm font-semibold rounded-lg transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
