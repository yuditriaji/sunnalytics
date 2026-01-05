// components/DashboardHeader.tsx
import React from 'react';
import { useUser } from '@clerk/nextjs';
import { FaBell, FaUserCircle } from 'react-icons/fa';
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
        sticky top-0 z-30 h-16
        bg-[#0B0F1A]/80 backdrop-blur-xl
        border-b border-white/5
        transition-all duration-300
        ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[240px]'}
      `}
        >
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left side - Page title (visible on mobile) */}
                <div className="lg:hidden flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="text-white font-semibold">Sunnalytics</span>
                </div>

                {/* Center - Market summary (desktop) */}
                <div className="hidden lg:flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">BTC</span>
                        <span className="text-white font-medium">$91,295</span>
                        <span className="text-cyan-400 text-sm">+1.51%</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">ETH</span>
                        <span className="text-white font-medium">$3,138</span>
                        <span className="text-cyan-400 text-sm">+7.11%</span>
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-sm">Market Cap</span>
                        <span className="text-white font-medium">$3.2T</span>
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <button
                        onClick={() => router.push('/alerts')}
                        className="relative p-2.5 text-gray-400 hover:text-white 
              bg-white/5 hover:bg-white/10 
              border border-white/5 hover:border-white/10
              rounded-xl transition-all"
                    >
                        <FaBell className="w-4 h-4" />
                        {/* Notification dot */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-400 rounded-full" />
                    </button>

                    {/* User */}
                    {isSignedIn && user ? (
                        <button
                            onClick={() => router.push('/settings')}
                            className="flex items-center gap-2 px-3 py-2
                bg-white/5 hover:bg-white/10 
                border border-white/5 hover:border-white/10
                rounded-xl transition-all"
                        >
                            {user.imageUrl ? (
                                <img
                                    src={user.imageUrl}
                                    alt={user.firstName || 'User'}
                                    className="w-6 h-6 rounded-full"
                                />
                            ) : (
                                <FaUserCircle className="w-6 h-6 text-gray-400" />
                            )}
                            <span className="hidden sm:inline text-sm text-white">
                                {user.firstName || 'Account'}
                            </span>
                        </button>
                    ) : (
                        <button
                            onClick={() => router.push('/sign-in')}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 
                text-black font-semibold text-sm rounded-xl transition-all"
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
