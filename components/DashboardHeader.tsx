// components/DashboardHeader.tsx
import React from 'react';
import { useUser } from '@clerk/nextjs';
import { FaBell, FaCog, FaWallet } from 'react-icons/fa';
import { useRouter } from 'next/router';

const DashboardHeader: React.FC = () => {
    const { user, isSignedIn } = useUser();
    const router = useRouter();

    return (
        <header className="relative overflow-hidden">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-purple-500/10" />

            <div className="relative px-4 py-6">
                <div className="flex items-center justify-between">
                    {/* Logo & Greeting */}
                    <div>
                        <h1 className="text-2xl font-bold">
                            <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 bg-clip-text text-transparent">
                                Sunnalytics
                            </span>
                        </h1>
                        {isSignedIn && user && (
                            <p className="text-sm text-gray-400 mt-1">
                                Welcome back, {user.firstName || 'Trader'}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        {isSignedIn ? (
                            <>
                                <button
                                    onClick={() => router.push('/alerts')}
                                    className="p-2.5 bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-xl hover:bg-gray-700/80 transition-all"
                                >
                                    <FaBell className="text-gray-400 w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => router.push('/settings')}
                                    className="p-2.5 bg-gray-800/80 backdrop-blur border border-gray-700/50 rounded-xl hover:bg-gray-700/80 transition-all"
                                >
                                    <FaCog className="text-gray-400 w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => router.push('/portfolio')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all"
                                >
                                    <FaWallet className="w-4 h-4" />
                                    <span className="hidden sm:inline">Portfolio</span>
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push('/sign-in')}
                                className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-xl transition-all"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
