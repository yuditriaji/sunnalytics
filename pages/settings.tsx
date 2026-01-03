/**
 * Settings Page
 * 
 * User settings, subscription management, and preferences.
 */

import { useUser, SignedIn, SignedOut, RedirectToSignIn, UserProfile } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { FaUser, FaCrown, FaBell, FaTelegram, FaCheck, FaSpinner } from 'react-icons/fa';

interface SubscriptionStatus {
  tier: string;
  isActive: boolean;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const TIER_FEATURES = {
  free: {
    name: 'Free',
    price: '$0',
    features: ['10 watchlist tokens', '3 price alerts', 'Basic analytics', '1h data refresh'],
  },
  pro: {
    name: 'Pro',
    price: '$29/mo',
    features: ['100 watchlist tokens', '50 price alerts', 'Advanced analytics', '5min data refresh', 'Export data'],
  },
  whale: {
    name: 'Whale',
    price: '$99/mo',
    features: ['Unlimited watchlist', 'Unlimited alerts', 'Real-time data', 'API access', 'Priority support'],
  },
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'notifications'>('account');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tab = router.query.tab as string;
    if (tab === 'subscription' || tab === 'notifications') {
      setActiveTab(tab);
    }
    if (router.query.success === 'true') {
      alert('Subscription updated successfully!');
      router.replace('/settings?tab=subscription', undefined, { shallow: true });
    }
  }, [router.query]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchSubscription();
    }
  }, [isLoaded, user]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/status`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription');
    }
  };

  const handleUpgrade = async (tier: 'pro' | 'whale') => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/create-portal`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <FaUser /> },
    { id: 'subscription', label: 'Subscription', icon: <FaCrown /> },
    { id: 'notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gray-900 text-white pb-24">
          <Header title="Settings" />

          <main className="pt-20 px-4 max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                      ? 'text-yellow-500 border-b-2 border-yellow-500'
                      : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Account Settings</h2>
                <UserProfile
                  appearance={{
                    elements: {
                      card: 'bg-gray-800 border-none shadow-none',
                      navbar: 'hidden',
                      pageScrollBox: 'p-0',
                    }
                  }}
                />
              </div>
            )}

            {/* Subscription Tab */}
            {activeTab === 'subscription' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Current Plan</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold capitalize">{subscription?.tier || 'Free'}</span>
                      {subscription?.subscriptionEnd && (
                        <p className="text-sm text-gray-400 mt-1">
                          {subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews'} on{' '}
                          {new Date(subscription.subscriptionEnd).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {subscription?.tier !== 'free' && (
                      <button
                        onClick={handleManageSubscription}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                      >
                        {loading ? <FaSpinner className="animate-spin" /> : 'Manage Billing'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(TIER_FEATURES).map(([tierId, tier]) => (
                    <div
                      key={tierId}
                      className={`bg-gray-800 rounded-lg p-6 border-2 ${subscription?.tier === tierId ? 'border-yellow-500' : 'border-gray-700'
                        }`}
                    >
                      <h3 className="text-lg font-bold">{tier.name}</h3>
                      <p className="text-2xl font-bold text-yellow-500 mb-4">{tier.price}</p>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                            <FaCheck className="text-green-500 text-xs" />{f}
                          </li>
                        ))}
                      </ul>
                      {subscription?.tier === tierId ? (
                        <button disabled className="w-full py-2 bg-gray-700 text-gray-400 rounded-lg">Current</button>
                      ) : tierId !== 'free' && (
                        <button
                          onClick={() => handleUpgrade(tierId as 'pro' | 'whale')}
                          disabled={loading}
                          className="w-full py-2 bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-400 font-medium"
                        >
                          {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Upgrade'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaTelegram className="text-2xl text-blue-400" />
                      <div>
                        <h3 className="font-medium">Telegram Notifications</h3>
                        <p className="text-sm text-gray-400">Receive alerts via Telegram</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400">
                      Connect Telegram
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          <BottomNav />
        </div>
      </SignedIn>
    </>
  );
}