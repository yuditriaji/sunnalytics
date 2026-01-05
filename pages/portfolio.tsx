import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { FiPlus, FiRefreshCw, FiTrash2, FiBriefcase, FiFolder } from 'react-icons/fi';

interface WalletHolding {
    id: string;
    tokenMint: string;
    symbol: string;
    name: string | null;
    logoUrl: string | null;
    amount: number;
    priceUsd: number | null;
    valueUsd: number | null;
}

interface Wallet {
    id: string;
    address: string;
    chain: string;
    label: string | null;
    lastSynced: string | null;
    syncStatus: string;
    holdings: WalletHolding[];
}

interface PortfolioData {
    wallets: Wallet[];
    summary: {
        totalWallets: number;
        portfolioValueUsd: number;
    };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const tokenColors = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-teal-400 to-cyan-500',
    'bg-gradient-to-br from-orange-400 to-amber-500',
    'bg-gradient-to-br from-emerald-400 to-green-500',
];

export default function Portfolio() {
    const { isSignedIn } = useUser();
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [newWalletAddress, setNewWalletAddress] = useState('');
    const [newWalletLabel, setNewWalletLabel] = useState('');
    const [addingWallet, setAddingWallet] = useState(false);
    const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const fetchPortfolio = useCallback(async () => {
        if (!isSignedIn) return;
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/wallets`, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed to fetch portfolio');
            setPortfolio(await res.json());
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => { fetchPortfolio(); }, [fetchPortfolio]);

    const handleAddWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWalletAddress.trim()) return;
        try {
            setAddingWallet(true);
            const res = await fetch(`${API_URL}/api/wallets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ address: newWalletAddress.trim(), chain: 'solana', label: newWalletLabel.trim() || undefined }),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            setNewWalletAddress('');
            setNewWalletLabel('');
            setShowAddWallet(false);
            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setAddingWallet(false);
        }
    };

    const handleSyncWallet = async (walletId: string) => {
        try {
            setSyncingWalletId(walletId);
            await fetch(`${API_URL}/api/wallets/${walletId}/sync`, { method: 'POST', credentials: 'include' });
            fetchPortfolio();
        } finally {
            setSyncingWalletId(null);
        }
    };

    const handleDeleteWallet = async (walletId: string) => {
        if (!confirm('Remove this wallet?')) return;
        await fetch(`${API_URL}/api/wallets/${walletId}`, { method: 'DELETE', credentials: 'include' });
        fetchPortfolio();
    };

    const formatNumber = (value?: number | null) => {
        if (!value) return '$0.00';
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
        return `$${value.toFixed(2)}`;
    };

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
                <div className="text-center">
                    <FiBriefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Portfolio</h1>
                    <p className="text-gray-500 mb-6">Sign in to track your wallet holdings</p>
                    <a href="/sign-in" className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg">
                        Sign In
                    </a>
                </div>
                <div className="lg:hidden"><BottomNav /></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0E17]">
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'} pb-20 lg:pb-0`}>
                <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

                <main className="p-4 lg:p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-bold text-white">Portfolio</h1>
                            {portfolio && (
                                <p className="text-3xl font-bold text-cyan-400 mt-1">{formatNumber(portfolio.summary.portfolioValueUsd)}</p>
                            )}
                        </div>
                        <button
                            onClick={() => setShowAddWallet(!showAddWallet)}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Wallet
                        </button>
                    </div>

                    {/* Add Wallet Form */}
                    {showAddWallet && (
                        <form onSubmit={handleAddWallet} className="bg-[#111827] border border-white/5 rounded-xl p-4 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Wallet Address</label>
                                    <input
                                        type="text"
                                        value={newWalletAddress}
                                        onChange={(e) => setNewWalletAddress(e.target.value)}
                                        placeholder="Enter Solana address..."
                                        className="w-full px-4 py-2.5 bg-[#1F2937] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 uppercase mb-2">Label (optional)</label>
                                    <input
                                        type="text"
                                        value={newWalletLabel}
                                        onChange={(e) => setNewWalletLabel(e.target.value)}
                                        placeholder="e.g., Main Wallet"
                                        className="w-full px-4 py-2.5 bg-[#1F2937] border border-white/5 rounded-lg text-white placeholder-gray-500 focus:border-cyan-500/30"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowAddWallet(false)} className="px-4 py-2 text-gray-400 hover:text-white">
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addingWallet || !newWalletAddress.trim()}
                                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg disabled:opacity-50"
                                >
                                    {addingWallet ? 'Adding...' : 'Connect Wallet'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Wallets */}
                    {!loading && portfolio && (
                        <div className="space-y-4">
                            {portfolio.wallets.length === 0 ? (
                                <div className="bg-[#111827] border border-white/5 rounded-xl p-8 text-center">
                                    <FiFolder className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                    <p className="text-gray-400">No wallets connected</p>
                                    <p className="text-sm text-gray-600 mt-1">Add a Solana wallet to track your holdings</p>
                                </div>
                            ) : (
                                portfolio.wallets.map((wallet) => (
                                    <div key={wallet.id} className="bg-[#111827] border border-white/5 rounded-xl overflow-hidden">
                                        {/* Wallet Header */}
                                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">{wallet.label || shortenAddress(wallet.address)}</span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded uppercase">
                                                        {wallet.chain}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">{shortenAddress(wallet.address)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleSyncWallet(wallet.id)}
                                                    disabled={syncingWalletId === wallet.id}
                                                    className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                                                >
                                                    <FiRefreshCw className={`w-4 h-4 ${syncingWalletId === wallet.id ? 'animate-spin' : ''}`} />
                                                </button>
                                                <button onClick={() => handleDeleteWallet(wallet.id)} className="p-2 text-gray-400 hover:text-red-400">
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Holdings */}
                                        <div className="divide-y divide-white/[0.03]">
                                            {wallet.holdings.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                                    {wallet.syncStatus === 'syncing' ? 'Syncing...' : 'No tokens found'}
                                                </div>
                                            ) : (
                                                wallet.holdings.map((holding, index) => (
                                                    <div key={holding.id} className="px-4 py-3 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${tokenColors[index % tokenColors.length]}`}>
                                                                {holding.symbol.slice(0, 2).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-medium text-white">{holding.symbol}</p>
                                                                <p className="text-xs text-gray-500">{holding.name || 'Unknown'}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-white">{formatNumber(holding.valueUsd)}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </main>
            </div>

            <div className="lg:hidden"><BottomNav /></div>
        </div>
    );
}
