'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { storeAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  section: 'redeem' | 'premium';
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface Transaction {
  _id: string;
  title: string;
  type: string;
  coinsDelta: number;
  balanceAfter: number;
  createdAt: string;
}

const StorePage: React.FC = () => {
  const router = useRouter();
  const { user, token, initialized, setUser } = useAuthStore();

  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activityRef, setActivityRef] = useState('');

  const premiumFeatures = useMemo(
    () => [
      'AI code review',
      'Premium interview questions',
      'Advanced analytics',
      'Exclusive learning content',
    ],
    []
  );

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!token) {
      router.push('/login');
      return;
    }

    loadOverview();
  }, [initialized, token, router]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await storeAPI.getOverview();
      setOverview(data);

      if (user) {
        const updatedUser = {
          ...user,
          coins: data.user?.coins ?? user.coins,
          isPremium: data.user?.isPremium ?? user.isPremium,
          premiumExpiresAt: data.user?.premiumExpiresAt ?? user.premiumExpiresAt,
          badges: data.user?.badges ?? user.badges,
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const runAction = async (id: string, action: () => Promise<any>) => {
    try {
      setError('');
      setSuccess('');
      setProcessingItem(id);
      const { data } = await action();
      setSuccess(data.message || 'Action completed');
      await loadOverview();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Action failed');
    } finally {
      setProcessingItem(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="h-8 w-56 rounded bg-slate-100" />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
              <div className="h-28 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const redeemItems = (overview?.sections?.redeem || []) as StoreItem[];
  const premiumPlans = (overview?.sections?.premium || []) as StoreItem[];
  const achievements = (overview?.achievements || []) as Achievement[];
  const history = (overview?.purchaseHistory || []) as Transaction[];
  const leaderboard = overview?.coinLeaderboard || [];

  return (
    <Layout>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
          <div className="absolute top-32 -right-16 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          <section className="rounded-3xl border border-slate-100 bg-white/95 shadow-card p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">CodeMaster Store</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">Redeem rewards with your coins</h1>
                <p className="mt-3 text-slate-600 max-w-2xl">
                  Earn coins by solving problems, joining contests, and completing interview tracks. Spend them on premium access, merchandise, and curated coding resources.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-4 border border-amber-200 min-w-[150px]">
                  <p className="text-xs text-amber-700 font-medium">Coin Balance</p>
                  <p className="text-2xl font-black text-amber-800">{overview?.user?.coins || 0}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100 p-4 border border-sky-200 min-w-[150px]">
                  <p className="text-xs text-sky-700 font-medium">Daily Streak</p>
                  <p className="text-2xl font-black text-sky-800">{overview?.user?.dailyLoginStreak || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                <p className="text-xs text-emerald-700">Easy problem reward</p>
                <p className="font-bold text-emerald-900">5 coins</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <p className="text-xs text-blue-700">Medium problem reward</p>
                <p className="font-bold text-blue-900">10 coins</p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
                <p className="text-xs text-rose-700">Hard problem reward</p>
                <p className="font-bold text-rose-900">20 coins</p>
              </div>
            </div>
          </section>

          {(error || success) && (
            <section className="space-y-2">
              {error && <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">{error}</div>}
              {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm">{success}</div>}
            </section>
          )}

          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Redeem Section</h2>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">Resources & Merchandise</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {redeemItems.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-slate-200 p-4 flex flex-col gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                      </div>
                      <div className="mt-auto flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-amber-700">{item.cost} coins</span>
                        <button
                          onClick={() => runAction(item.id, () => storeAPI.redeemItem(item.id))}
                          disabled={processingItem === item.id || (overview?.user?.coins || 0) < item.cost}
                          className="rounded-lg bg-slate-900 text-white text-sm px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
                        >
                          {processingItem === item.id ? 'Redeeming...' : 'Redeem'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">Premium Section</h2>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">Monthly & Yearly plans</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {premiumPlans.map((plan) => {
                    const isMonthly = plan.id.includes('monthly');
                    return (
                      <article key={plan.id} className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4">
                        <h3 className="font-semibold text-slate-900">{isMonthly ? 'Monthly Plan' : 'Yearly Plan'}</h3>
                        <p className="text-sm text-slate-600 mt-1">{plan.description}</p>
                        <p className="mt-3 text-lg font-black text-amber-700">{plan.cost} coins</p>
                        <button
                          onClick={() =>
                            runAction(plan.id, () =>
                              storeAPI.subscribePremium(isMonthly ? 'monthly' : 'yearly')
                            )
                          }
                          disabled={processingItem === plan.id || (overview?.user?.coins || 0) < plan.cost}
                          className="mt-3 w-full rounded-lg bg-amber-600 text-white text-sm py-2 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingItem === plan.id ? 'Processing...' : 'Get Premium'}
                        </button>
                      </article>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">Premium unlocks</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {premiumFeatures.map((feature) => (
                      <span key={feature} className="text-xs rounded-full bg-slate-100 text-slate-700 px-3 py-1">
                        {feature}
                      </span>
                    ))}
                  </div>
                  {overview?.user?.isPremium && (
                    <p className="mt-3 text-sm text-emerald-700 font-medium">
                      Active plan: {overview?.user?.premiumPlan || 'premium'}
                      {overview?.user?.premiumExpiresAt ? ` · expires ${new Date(overview.user.premiumExpiresAt).toLocaleDateString()}` : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
                <h3 className="text-lg font-bold text-slate-900">Gamification</h3>
                <div className="mt-4 space-y-3">
                  <button
                    onClick={() => runAction('daily-login', () => storeAPI.claimDailyLogin())}
                    disabled={processingItem === 'daily-login'}
                    className="w-full rounded-lg bg-emerald-600 text-white py-2 text-sm hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {processingItem === 'daily-login' ? 'Claiming...' : 'Claim Daily Login Reward'}
                  </button>
                  <button
                    onClick={() => runAction('lucky-spin', () => storeAPI.spinLuckyWheel())}
                    disabled={processingItem === 'lucky-spin'}
                    className="w-full rounded-lg bg-fuchsia-600 text-white py-2 text-sm hover:bg-fuchsia-700 disabled:opacity-60"
                  >
                    {processingItem === 'lucky-spin' ? 'Spinning...' : 'Try Lucky Spin'}
                  </button>
                </div>

                <div className="mt-4 border-t border-slate-200 pt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase">Manual Activity Rewards</p>
                  <input
                    value={activityRef}
                    onChange={(e) => setActivityRef(e.target.value)}
                    placeholder="Contest/Interview ID"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => runAction('contest', () => storeAPI.rewardActivity('contest', activityRef))}
                      disabled={!activityRef || processingItem === 'contest'}
                      className="rounded-lg border border-slate-300 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      Contest +30
                    </button>
                    <button
                      onClick={() => runAction('interview', () => storeAPI.rewardActivity('interview', activityRef))}
                      disabled={!activityRef || processingItem === 'interview'}
                      className="rounded-lg border border-slate-300 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                    >
                      Interview +25
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
                <h3 className="text-lg font-bold text-slate-900">Achievement Badges</h3>
                <div className="mt-3 space-y-2">
                  {achievements.map((badge) => (
                    <div key={badge.id} className={`rounded-lg border px-3 py-2 ${badge.unlocked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-sm font-semibold ${badge.unlocked ? 'text-emerald-700' : 'text-slate-700'}`}>{badge.title}</p>
                      <p className="text-xs text-slate-500">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
                <h3 className="text-lg font-bold text-slate-900">Coin Leaderboard</h3>
                <div className="mt-3 space-y-2">
                  {leaderboard.map((entry: any, index: number) => (
                    <div key={entry._id || entry.username} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">#{index + 1} {entry.username}</p>
                        <p className="text-xs text-slate-500">{entry.isPremium ? 'Premium' : 'Free'} user</p>
                      </div>
                      <p className="text-sm font-bold text-amber-700">{entry.coins || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Purchase & Reward History</h2>
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No store activity yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500 border-b border-slate-200">
                      <th className="py-2 pr-2">Action</th>
                      <th className="py-2 pr-2">Coins</th>
                      <th className="py-2 pr-2">Balance</th>
                      <th className="py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry) => (
                      <tr key={entry._id} className="border-b border-slate-100">
                        <td className="py-2 pr-2 text-slate-700">{entry.title}</td>
                        <td className={`py-2 pr-2 font-semibold ${entry.coinsDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {entry.coinsDelta > 0 ? `+${entry.coinsDelta}` : entry.coinsDelta}
                        </td>
                        <td className="py-2 pr-2 text-slate-700">{entry.balanceAfter}</td>
                        <td className="py-2 text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default StorePage;
