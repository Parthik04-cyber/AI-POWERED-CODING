'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { storeAPI } from '@/services/api';

interface StoreItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  section: 'redeem' | 'premium';
}

interface Transaction {
  _id: string;
  title: string;
  type: string;
  coinsDelta: number;
  balanceAfter: number;
  createdAt: string;
}

interface OverviewState {
  sections?: {
    redeem?: StoreItem[];
    premium?: StoreItem[];
  };
  achievements?: Array<{ id: string; title: string }>;
  purchaseHistory?: Transaction[];
  coinLeaderboard?: Array<{ username: string; coins: number }>;
}

const AdminStorePage: React.FC = () => {
  const [overview, setOverview] = useState<OverviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadOverview = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await storeAPI.getOverview();
        setOverview(data);
      } catch (loadError: any) {
        setError(loadError.response?.data?.error || 'Failed to load store data.');
      } finally {
        setLoading(false);
      }
    };

    void loadOverview();
  }, []);

  const redeemItems = overview?.sections?.redeem || [];
  const premiumPlans = overview?.sections?.premium || [];
  const achievements = overview?.achievements || [];
  const history = overview?.purchaseHistory || [];
  const leaderboard = overview?.coinLeaderboard || [];

  const catalogItems = useMemo(() => [...redeemItems, ...premiumPlans], [premiumPlans, redeemItems]);

  return (
    <AdminShell
      title="Store Management"
      description="Review reward catalog, premium plans, and transaction activity in a dedicated area instead of the dashboard."
    >
      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Catalog items</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : catalogItems.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Premium plans</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : premiumPlans.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Achievements</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : achievements.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Leaderboard entries</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : leaderboard.length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Catalog edits and coin-policy changes are not exposed as admin APIs yet. This page shows the current live configuration and transaction activity so those controls can be added cleanly later.
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Active catalog</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading catalog...</div>
              ) : catalogItems.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No catalog items available.</div>
              ) : (
                catalogItems.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{item.cost} coins</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Recent transactions</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading transactions...</div>
                ) : history.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No transaction history available.</div>
                ) : (
                  history.slice(0, 6).map((item) => (
                    <article key={item._id} className="rounded-2xl border border-slate-200 px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.type} · {new Date(item.createdAt).toLocaleString()}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{item.coinsDelta} coins · balance {item.balanceAfter}</p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Coin leaderboard</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading leaderboard...</div>
                ) : leaderboard.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No leaderboard entries available.</div>
                ) : (
                  leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={`${entry.username}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">{entry.username}</p>
                      <p className="text-sm font-semibold text-amber-700">{entry.coins} coins</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminStorePage;