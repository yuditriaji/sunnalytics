import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import BottomNav from '../components/BottomNav';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { FiUser, FiCreditCard, FiBell, FiCheck, FiLoader, FiChevronRight } from 'react-icons/fi';

interface SubscriptionStatus {
  tier: string;
  isActive: boolean;
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

const TIER_FEATURES = {
  free: { name: 'Free', price: '$0', features: ['10 watchlist tokens', '3 price alerts', 'Basic analytics', '1h data refresh'] },
  pro: { name: 'Pro', price: '$29/mo', features: ['100 watchlist tokens', '50 price alerts', 'Advanced analytics', '5min data refresh', 'Export data'] },
  whale: { name: 'Whale', price: '$99/mo', features: ['Unlimited watchlist', 'Unlimited alerts', 'Real-time data', 'API access', 'Priority support'] },
};

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'account' | 'subscription' | 'notifications'>('account');
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const tab = router.query.tab as string;
    if (tab === 'subscription' || tab === 'notifications') setActiveTab(tab);
  }, [router.query]);

  useEffect(() => {
    if (isLoaded && user) fetchSubscription();
  }, [isLoaded, user]);

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/status`, { credentials: 'include' });
      if (res.ok) setSubscription(await res.json());
    } catch (err) { console.error('Failed to fetch subscription'); }
  };

  const handleUpgrade = async (tier: 'pro' | 'whale') => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/create-checkout`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert('Failed to start checkout'); } finally { setLoading(false); }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/subscription/create-portal`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { alert('Failed'); } finally { setLoading(false); }
  };

  const tabs = [
    { id: 'account' as const, label: 'Account', icon: FiUser },
    { id: 'subscription' as const, label: 'Subscription', icon: FiCreditCard },
    { id: 'notifications' as const, label: 'Notifications', icon: FiBell },
  ];

  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-[#0A0E17]">
          <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

          <div className={`min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-[200px]'} pb-20 lg:pb-0`}>
            <DashboardHeader sidebarCollapsed={sidebarCollapsed} />

            <main className="p-4 lg:p-6">
              <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 bg-[#111827] border border-white/5 rounded-xl p-1 w-fit">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h2 className="text-sm font-medium text-white mb-4">Account Information</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">{user?.firstName?.[0] || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.fullName || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/user')}
                      className="flex items-center justify-between w-full px-4 py-3 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      Manage Account <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {activeTab === 'subscription' && (
                <div className="space-y-4">
                  {/* Current Plan */}
                  <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                    <h2 className="text-sm font-medium text-white mb-4">Current Plan</h2>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-cyan-400 capitalize">{subscription?.tier || 'Free'}</p>
                        <p className="text-sm text-gray-500">
                          {subscription?.subscriptionEnd ? `Renews ${new Date(subscription.subscriptionEnd).toLocaleDateString()}` : 'No subscription'}
                        </p>
                      </div>
                      {subscription?.tier !== 'free' && (
                        <button onClick={handleManageSubscription} disabled={loading} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm">
                          Manage
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plans */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(TIER_FEATURES).map(([key, tier]) => (
                      <div key={key} className={`bg-[#111827] border rounded-xl p-4 ${subscription?.tier === key ? 'border-cyan-500' : 'border-white/5'}`}>
                        <p className="text-lg font-bold text-white">{tier.name}</p>
                        <p className="text-2xl font-bold text-cyan-400 mb-4">{tier.price}</p>
                        <ul className="space-y-2 mb-4">
                          {tier.features.map((f, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-400">
                              <FiCheck className="w-4 h-4 text-emerald-400" /> {f}
                            </li>
                          ))}
                        </ul>
                        {subscription?.tier === key ? (
                          <div className="px-4 py-2 bg-cyan-500/10 text-cyan-400 text-center rounded-lg text-sm">Current Plan</div>
                        ) : key !== 'free' && (
                          <button onClick={() => handleUpgrade(key as 'pro' | 'whale')} disabled={loading} className="w-full px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg text-sm disabled:opacity-50">
                            {loading ? <FiLoader className="w-4 h-4 animate-spin mx-auto" /> : 'Upgrade'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-[#111827] border border-white/5 rounded-xl p-6">
                  <h2 className="text-sm font-medium text-white mb-4">Notification Preferences</h2>
                  <div className="space-y-4">
                    {['Price Alerts', 'Watchlist Updates', 'News & Announcements', 'Weekly Reports'].map(item => (
                      <div key={item} className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-400">{item}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-cyan-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </main>
          </div>

          <div className="lg:hidden"><BottomNav /></div>
        </div>
      </SignedIn>
    </>
  );
}