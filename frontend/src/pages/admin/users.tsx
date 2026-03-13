'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { authAPI } from '@/services/api';

interface UserRecord {
  _id?: string;
  userId?: string;
  username: string;
  email: string;
  role: string;
  score?: number;
  coins?: number;
  isPremium?: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const { data } = await authAPI.getUsers();
        setUsers(data.users || []);
      } catch (loadError: any) {
        setError(loadError.response?.data?.error || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => `${user.username} ${user.email} ${user.role}`.toLowerCase().includes(query));
  }, [searchTerm, users]);

  const adminCount = users.filter((user) => user.role === 'admin').length;
  const premiumCount = users.filter((user) => user.isPremium).length;
  const totalScore = users.reduce((sum, user) => sum + (user.score || 0), 0);

  return (
    <AdminShell
      title="User Management"
      description="Review platform users in a dedicated workspace. Mutating roles and account state still requires backend admin endpoints that are not present yet."
    >
      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total users</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : users.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Admins</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : adminCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Premium users</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : premiumCount}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Total score</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : totalScore}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          This page separates user oversight from the dashboard, but role edits, suspensions, and manual account actions need backend admin APIs before they can be implemented safely.
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">User directory</h2>
              <p className="mt-2 text-sm text-slate-600">Search by username, email, or role.</p>
            </div>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search users"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:max-w-sm"
            />
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="px-3 py-3 font-semibold">Username</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Score</th>
                  <th className="px-3 py-3 font-semibold">Coins</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-500" colSpan={5}>Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-3 py-6 text-slate-500" colSpan={5}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id || user.userId || user.email} className="border-b border-slate-100 text-slate-700">
                      <td className="px-3 py-3 font-medium text-slate-900">{user.username}</td>
                      <td className="px-3 py-3">{user.email}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-3 py-3">{user.score || 0}</td>
                      <td className="px-3 py-3">{user.coins || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminUsersPage;