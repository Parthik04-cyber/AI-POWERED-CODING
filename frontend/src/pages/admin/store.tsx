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
  isActive: boolean;
}

interface Transaction {
  _id: string;
  userId: string;
  title: string;
  type: string;
  coinsDelta: number;
  balanceAfter: number;
  createdAt: string;
  username?: string;
  fullName?: string;
}

interface AdminOverviewState {
  catalogItems: StoreItem[];
  recentTransactions: Transaction[];
  coinLeaderboard: Array<{ _id: string; username: string; coins: number; isPremium?: boolean }>;
}

interface CatalogFormState {
  title: string;
  description: string;
  cost: string;
  section: 'redeem' | 'premium';
  isActive: boolean;
}

const emptyCreateForm: CatalogFormState = {
  title: '',
  description: '',
  cost: '',
  section: 'redeem',
  isActive: true,
};

const AdminStorePage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverviewState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CatalogFormState>(emptyCreateForm);
  const [editForm, setEditForm] = useState<CatalogFormState>(emptyCreateForm);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await storeAPI.getAdminOverview(30);
      setOverview({
        catalogItems: data.catalogItems || [],
        recentTransactions: data.recentTransactions || [],
        coinLeaderboard: data.coinLeaderboard || [],
      });
    } catch (loadError: any) {
      setError(loadError.response?.data?.error || 'Failed to load store data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOverview();
  }, []);

  const catalogItems = overview?.catalogItems || [];
  const history = overview?.recentTransactions || [];
  const leaderboard = overview?.coinLeaderboard || [];
  const redeemItems = useMemo(() => catalogItems.filter((item) => item.section === 'redeem'), [catalogItems]);
  const premiumPlans = useMemo(() => catalogItems.filter((item) => item.section === 'premium'), [catalogItems]);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const toNumberCost = (value: string): number => Number(value);

  const applyCreateItem = async () => {
    try {
      resetMessages();
      setSaving(true);
      await storeAPI.createCatalogItem({
        title: createForm.title,
        description: createForm.description,
        cost: toNumberCost(createForm.cost),
        section: createForm.section,
      });
      setSuccess('Catalog item created successfully.');
      setCreateForm(emptyCreateForm);
      await loadOverview();
    } catch (saveError: any) {
      setError(saveError.response?.data?.error || 'Failed to create catalog item.');
    } finally {
      setSaving(false);
    }
  };

  const startEditItem = (item: StoreItem) => {
    resetMessages();
    setEditingItemId(item.id);
    setEditForm({
      title: item.title,
      description: item.description,
      cost: String(item.cost),
      section: item.section,
      isActive: item.isActive,
    });
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditForm(emptyCreateForm);
  };

  const applyEditItem = async () => {
    if (!editingItemId) {
      return;
    }

    try {
      resetMessages();
      setSaving(true);
      await storeAPI.updateCatalogItem(editingItemId, {
        title: editForm.title,
        description: editForm.description,
        cost: toNumberCost(editForm.cost),
        section: editForm.section,
        isActive: editForm.isActive,
      });
      setSuccess('Catalog item updated successfully.');
      cancelEdit();
      await loadOverview();
    } catch (saveError: any) {
      setError(saveError.response?.data?.error || 'Failed to update catalog item.');
    } finally {
      setSaving(false);
    }
  };

  const applyDeleteItem = async (itemId: string) => {
    try {
      resetMessages();
      setSaving(true);
      await storeAPI.deleteCatalogItem(itemId);
      setSuccess('Catalog item removed successfully.');
      if (editingItemId === itemId) {
        cancelEdit();
      }
      await loadOverview();
    } catch (saveError: any) {
      setError(saveError.response?.data?.error || 'Failed to remove catalog item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="Store Management"
      description="Manage live catalog items and monitor real-time redemption transactions and coin leaderboard activity."
    >
      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
        {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}

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
            <p className="text-sm font-semibold text-slate-500">Redeem items</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : redeemItems.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Recent transactions</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : history.length}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Catalog management</h2>

            <div className="mt-5 rounded-2xl border border-slate-200 p-4 bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">Add new catalog item</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={createForm.title}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Item name"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  value={createForm.cost}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, cost: event.target.value }))}
                  placeholder="Coin price"
                  type="number"
                  min={0}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <input
                  value={createForm.description}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
                  placeholder="Description"
                  className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                />
                <select
                  value={createForm.section}
                  onChange={(event) =>
                    setCreateForm((prev) => ({ ...prev, section: event.target.value as 'redeem' | 'premium' }))
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="redeem">Redeem</option>
                  <option value="premium">Premium</option>
                </select>
                <button
                  onClick={applyCreateItem}
                  disabled={saving}
                  className="rounded-lg bg-slate-900 text-white text-sm font-semibold px-4 py-2 hover:bg-slate-700 disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Add item'}
                </button>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading catalog...</div>
              ) : catalogItems.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No catalog items available.</div>
              ) : (
                catalogItems.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    {editingItemId === item.id ? (
                      <div className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <input
                            value={editForm.title}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                          <input
                            value={editForm.cost}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, cost: event.target.value }))}
                            type="number"
                            min={0}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                          <input
                            value={editForm.description}
                            onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
                            className="sm:col-span-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          />
                          <select
                            value={editForm.section}
                            onChange={(event) =>
                              setEditForm((prev) => ({ ...prev, section: event.target.value as 'redeem' | 'premium' }))
                            }
                            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="redeem">Redeem</option>
                            <option value="premium">Premium</option>
                          </select>
                          <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(event) =>
                                setEditForm((prev) => ({ ...prev, isActive: event.target.checked }))
                              }
                            />
                            Active item
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={applyEditItem}
                            disabled={saving}
                            className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                          <p className="mt-1 text-xs text-slate-500 uppercase">
                            {item.section} {item.isActive ? '' : '· inactive'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{item.cost} coins</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditItem(item)}
                              className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => applyDeleteItem(item.id)}
                              disabled={saving}
                              className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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
                  history.slice(0, 8).map((item) => (
                    <article key={item._id} className="rounded-2xl border border-slate-200 px-4 py-4">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.username || item.userId} · {item.type} · {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">
                        {item.coinsDelta > 0 ? `+${item.coinsDelta}` : item.coinsDelta} coins · balance {item.balanceAfter}
                      </p>
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
                    <div key={`${entry._id}-${index}`} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">#{index + 1} {entry.username}</p>
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