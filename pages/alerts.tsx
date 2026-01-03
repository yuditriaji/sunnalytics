/**
 * Alerts Page
 * 
 * Manage price alerts and notifications.
 */

import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { FaBell, FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaCrown, FaTelegram, FaEnvelope } from 'react-icons/fa';

interface Alert {
    id: string;
    tokenId: string;
    alertType: string;
    threshold: number;
    channels: string[];
    isActive: boolean;
    token?: {
        name: string;
        symbol: string;
        price: number;
    };
}

export default function AlertsPage() {
    const { user, isLoaded } = useUser();
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isLoaded && user) {
            fetchAlerts();
        }
    }, [isLoaded, user]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/alerts`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (res.ok) {
                const data = await res.json();
                setAlerts(data.alerts || []);
            } else {
                setError('Failed to fetch alerts');
            }
        } catch (err) {
            setError('Failed to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const toggleAlert = async (alertId: string, isActive: boolean) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/alerts/${alertId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ isActive: !isActive }),
            });

            setAlerts(alerts.map(a =>
                a.id === alertId ? { ...a, isActive: !isActive } : a
            ));
        } catch (err) {
            console.error('Failed to toggle alert');
        }
    };

    const deleteAlert = async (alertId: string) => {
        if (!confirm('Are you sure you want to delete this alert?')) return;

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/alerts/${alertId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            setAlerts(alerts.filter(a => a.id !== alertId));
        } catch (err) {
            console.error('Failed to delete alert');
        }
    };

    const getAlertTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            price_above: 'Price Above',
            price_below: 'Price Below',
            volume_spike: 'Volume Spike',
            whale_move: 'Whale Movement',
        };
        return labels[type] || type;
    };

    return (
        <>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>

            <SignedIn>
                <div className="min-h-screen bg-gray-900 text-white pb-24">
                    <Header title="Alerts" />

                    <main className="pt-20 px-4 max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <FaBell className="text-yellow-500" />
                                    Your Alerts
                                </h1>
                                <p className="text-gray-400 text-sm mt-1">
                                    Get notified when tokens hit your target prices
                                </p>
                            </div>
                            <button
                                onClick={() => {/* TODO: Open create alert modal */ }}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors font-medium"
                            >
                                <FaPlus /> New Alert
                            </button>
                        </div>

                        {/* Upgrade Banner for Free Users */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FaCrown className="text-yellow-500 text-xl" />
                                <div className="flex-1">
                                    <p className="font-medium">Upgrade to Pro for more alerts</p>
                                    <p className="text-sm text-gray-400">Free plan: 3 alerts • Pro: 50 alerts • Whale: Unlimited</p>
                                </div>
                                <button className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg text-sm font-medium hover:bg-yellow-400">
                                    Upgrade
                                </button>
                            </div>
                        </div>

                        {/* Alerts List */}
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2" />
                                        <div className="h-3 bg-gray-700 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : alerts.length === 0 ? (
                            <div className="text-center py-12">
                                <FaBell className="text-5xl text-gray-600 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-400 mb-2">No alerts yet</h3>
                                <p className="text-gray-500 mb-4">Create your first alert to get notified about price changes</p>
                                <button className="px-6 py-3 bg-yellow-500 text-gray-900 rounded-lg font-medium hover:bg-yellow-400">
                                    Create Alert
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div
                                        key={alert.id}
                                        className={`bg-gray-800 rounded-lg p-4 border transition-colors ${alert.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-medium">{alert.token?.symbol || 'Unknown'}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                                                        {getAlertTypeLabel(alert.alertType)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-400">
                                                    {alert.alertType.includes('above') ? '>' : '<'} ${alert.threshold.toLocaleString()}
                                                    {alert.token?.price && (
                                                        <span className="ml-2 text-gray-500">
                                                            (Current: ${alert.token.price.toLocaleString()})
                                                        </span>
                                                    )}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {alert.channels.includes('email') && (
                                                        <FaEnvelope className="text-gray-500 text-sm" title="Email" />
                                                    )}
                                                    {alert.channels.includes('telegram') && (
                                                        <FaTelegram className="text-blue-400 text-sm" title="Telegram" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleAlert(alert.id, alert.isActive)}
                                                    className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                                                >
                                                    {alert.isActive ? (
                                                        <FaToggleOn className="text-2xl text-yellow-500" />
                                                    ) : (
                                                        <FaToggleOff className="text-2xl" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => deleteAlert(alert.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>

                    <BottomNav />
                </div>
            </SignedIn>
        </>
    );
}
