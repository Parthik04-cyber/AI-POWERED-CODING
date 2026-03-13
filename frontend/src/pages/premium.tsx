'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { storeAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

const PremiumPage: React.FC = () => {
  const router = useRouter();
  const { token, user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState(0);
  const [processingPlan, setProcessingPlan] = useState<'monthly' | 'yearly' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const features = useMemo(
    () => [
      'AI code review assistant',
      'Premium interview questions',
      'Advanced performance analytics',
      'Exclusive learning content',
    ],
    []
  );

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const { data } = await storeAPI.getPremiumOverview();
        setCoins(data.user?.coins || 0);
        if (user) {
          const updated = {
            ...user,
            coins: data.user?.coins ?? user.coins,
            isPremium: data.user?.isPremium ?? user.isPremium,
            premiumExpiresAt: data.user?.premiumExpiresAt ?? user.premiumExpiresAt,
          };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load premium details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, token, setUser, user]);

  const subscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setError('');
      setSuccess('');
      setProcessingPlan(plan);
      const { data } = await storeAPI.subscribePremiumPlan(plan);
      setSuccess(data.message || 'Premium activated');
      setCoins(data.coins || coins);

      if (user) {
        const updated = {
          ...user,
          coins: data.coins ?? user.coins,
          isPremium: true,
          premiumExpiresAt: data.premiumExpiresAt ?? user.premiumExpiresAt,
        };
        setUser(updated);
        localStorage.setItem('user', JSON.stringify(updated));
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to subscribe');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="animate-pulse rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
            <div className="h-8 w-56 rounded bg-slate-100" />
            <div className="mt-5 h-5 w-80 rounded bg-slate-100" />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-52 rounded-2xl bg-slate-100" />
              <div className="h-52 rounded-2xl bg-slate-100" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
        <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-8 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-amber-700">Premium Subscription</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">Upgrade your coding prep</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Unlock premium features and accelerate your interview preparation with advanced insights, curated content, and AI-enhanced workflows.
          </p>
          <div className="mt-5 inline-flex rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700">
            Current coins: {coins}
          </div>
        </section>

        {(error || success) && (
          <section className="space-y-2">
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
            {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>}
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <article className="lg:col-span-1 rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <h2 className="text-lg font-bold text-slate-900">Included Features</h2>
            <div className="mt-4 space-y-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-emerald-600 mt-0.5">✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-slate-500">Plan</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Monthly</h3>
            <p className="text-sm text-slate-600 mt-1">Best for trying premium features quickly.</p>
            <p className="mt-4 text-3xl font-black text-amber-700">120 coins</p>
            <button
              onClick={() => subscribe('monthly')}
              disabled={processingPlan !== null || coins < 120}
              className="mt-5 w-full rounded-xl bg-slate-900 text-white py-2.5 text-sm font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPlan === 'monthly' ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </article>

          <article className="rounded-3xl border border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-card">
            <p className="text-xs uppercase tracking-[0.18em] font-semibold text-amber-700">Plan</p>
            <h3 className="mt-2 text-2xl font-black text-slate-900">Yearly</h3>
            <p className="text-sm text-slate-600 mt-1">Maximum value for serious preparation.</p>
            <p className="mt-4 text-3xl font-black text-amber-700">1200 coins</p>
            <button
              onClick={() => subscribe('yearly')}
              disabled={processingPlan !== null || coins < 1200}
              className="mt-5 w-full rounded-xl bg-amber-600 text-white py-2.5 text-sm font-semibold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingPlan === 'yearly' ? 'Processing...' : 'Subscribe Yearly'}
            </button>
          </article>
        </section>
      </div>
    </Layout>
  );
};

export default PremiumPage;
