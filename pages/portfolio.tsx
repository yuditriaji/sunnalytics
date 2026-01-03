// pages/portfolio.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import BottomNav from '../components/BottomNav';

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

export default function Portfolio() {
    const { isSignedIn, user } = useUser();
    const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddWallet, setShowAddWallet] = useState(false);
    const [newWalletAddress, setNewWalletAddress] = useState('');
    const [newWalletLabel, setNewWalletLabel] = useState('');
    const [addingWallet, setAddingWallet] = useState(false);
    const [syncingWalletId, setSyncingWalletId] = useState<string | null>(null);

    const fetchPortfolio = useCallback(async () => {
        if (!isSignedIn) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/wallets`, {
                headers: {
                    'Content-Type': 'application/json',
                    // Auth header will be added by middleware
                },
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to fetch portfolio');

            const data = await res.json();
            setPortfolio(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [isSignedIn]);

    useEffect(() => {
        fetchPortfolio();
    }, [fetchPortfolio]);

    const handleAddWallet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWalletAddress.trim()) return;

        try {
            setAddingWallet(true);
            const res = await fetch(`${API_URL}/api/wallets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    address: newWalletAddress.trim(),
                    chain: 'solana',
                    label: newWalletLabel.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to add wallet');
            }

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
            const res = await fetch(`${API_URL}/api/wallets/${walletId}/sync`, {
                method: 'POST',
                credentials: 'include',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Sync failed');
            }

            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSyncingWalletId(null);
        }
    };

    const handleDeleteWallet = async (walletId: string) => {
        if (!confirm('Remove this wallet?')) return;

        try {
            const res = await fetch(`${API_URL}/api/wallets/${walletId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Failed to remove wallet');

            fetchPortfolio();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const formatNumber = (value: number | null | undefined): string => {
        if (value === undefined || value === null || value === 0) return '$0.00';
        if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
        return `$${value.toFixed(2)}`;
    };

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                <h1 className="text-2xl font-bold mb-4">Portfolio</h1>
                <p className="text-gray-400 mb-6">Sign in to track your wallet holdings</p>
                <a
                    href="/sign-in"
                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition"
                >
                    Sign In
                </a>
                <BottomNav onFilterClick={() => { }} onSearchFocus={() => { }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white pb-20">
            {/* Header */}
            <div className="p-4 border-b border-gray-800">
                <h1 className="text-2xl font-bold">Portfolio</h1>
                {portfolio && (
                    <p className="text-3xl font-bold text-yellow-400 mt-2">
                        {formatNumber(portfolio.summary.portfolioValueUsd)}
                    </p>
                )}
            </div>

            {/* Add Wallet Button */}
            <div className="p-4">
                <button
                    onClick={() => setShowAddWallet(!showAddWallet)}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Wallet
                </button>
            </div>

            {/* Add Wallet Form */}
            {showAddWallet && (
                <form onSubmit={handleAddWallet} className="mx-4 p-4 bg-gray-800 rounded-lg mb-4">
                    <div className="mb-3">
                        <label className="block text-sm text-gray-400 mb-1">Solana Wallet Address</label>
                        <input
                            type="text"
                            value={newWalletAddress}
                            onChange={(e) => setNewWalletAddress(e.target.value)}
                            placeholder="Enter Solana address..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-1">Label (optional)</label>
                        <input
                            type="text"
                            value={newWalletLabel}
                            onChange={(e) => setNewWalletLabel(e.target.value)}
                            placeholder="e.g., Main Wallet, Trading..."
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowAddWallet(false)}
                            className="flex-1 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={addingWallet || !newWalletAddress.trim()}
                            className="flex-1 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50"
                        >
                            {addingWallet ? 'Adding...' : 'Connect'}
                        </button>
                    </div>
                </form>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-yellow-400"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mx-4 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <p className="text-red-400">{error}</p>
                </div>
            )}

            {/* Wallets List */}
            {!loading && portfolio && (
                <div className="flex-1 p-4 space-y-4">
                    {portfolio.wallets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">💼</div>
                            <p className="text-gray-400">No wallets connected yet</p>
                            <p className="text-sm text-gray-500 mt-2">Add a Solana wallet to track your holdings</p>
                        </div>
                    ) : (
                        portfolio.wallets.map((wallet) => (
                            <div key={wallet.id} className="bg-gray-800 rounded-lg overflow-hidden">
                                {/* Wallet Header */}
                                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg font-semibold">
                                                {wallet.label || shortenAddress(wallet.address)}
                                            </span>
                                            <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                                                {wallet.chain.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{shortenAddress(wallet.address)}</p>
                                        {wallet.lastSynced && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Last synced: {new Date(wallet.lastSynced).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleSyncWallet(wallet.id)}
                                            disabled={syncingWalletId === wallet.id}
                                            className="p-2 hover:bg-gray-700 rounded-lg transition"
                                            title="Sync wallet"
                                        >
                                            <svg
                                                className={`w-5 h-5 ${syncingWalletId === wallet.id ? 'animate-spin' : ''}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWallet(wallet.id)}
                                            className="p-2 hover:bg-red-900/30 text-red-400 rounded-lg transition"
                                            title="Remove wallet"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Holdings */}
                                <div className="divide-y divide-gray-700">
                                    {wallet.holdings.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">
                                            {wallet.syncStatus === 'syncing' ? 'Syncing holdings...' : 'No tokens found'}
                                        </div>
                                    ) : (
                                        wallet.holdings.map((holding) => (
                                            <div key={holding.id} className="p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {holding.logoUrl ? (
                                                        <img
                                                            src={holding.logoUrl}
                                                            alt={holding.symbol}
                                                            className="w-10 h-10 rounded-full"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                                                            {holding.symbol.slice(0, 2)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold">{holding.symbol}</p>
                                                        <p className="text-sm text-gray-400">{holding.name || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatNumber(holding.valueUsd)}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {holding.symbol}
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

            <BottomNav onFilterClick={() => { }} onSearchFocus={() => { }} />
        </div>
    );
}
