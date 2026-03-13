'use client';

import React, { useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';

const AdminSettingsPage: React.FC = () => {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminShell
      title="Settings"
      description="Platform configuration and admin preferences."
    >
      <div className="space-y-6 max-w-2xl">
        {saved && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Settings saved successfully.
          </div>
        )}

        {/* General settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">General</h2>
          <p className="mt-1 text-sm text-slate-500">Basic platform configuration.</p>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Platform name
              </label>
              <input
                type="text"
                defaultValue="CodeMaster"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Support email
              </label>
              <input
                type="email"
                defaultValue="support@codemaster.dev"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default user role
              </label>
              <select
                defaultValue="user"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none transition"
              >
                <option value="user">User</option>
                <option value="premium">Premium</option>
              </select>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              Save changes
            </button>
          </form>
        </section>

        {/* Feature flags */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">Feature flags</h2>
          <p className="mt-1 text-sm text-slate-500">Enable or disable platform features.</p>

          <div className="mt-5 space-y-3">
            {[
              { label: 'User registrations', description: 'Allow new users to create accounts.', defaultOn: true },
              { label: 'Contest submissions', description: 'Allow code submissions during contests.', defaultOn: true },
              { label: 'AI learning assistant', description: 'Show the AI assistant in the editor.', defaultOn: true },
              { label: 'Store purchases', description: 'Allow users to spend coins in the store.', defaultOn: false },
            ].map((flag) => (
              <div key={flag.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{flag.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{flag.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" defaultChecked={flag.defaultOn} className="sr-only peer" />
                  <div className="w-10 h-5 bg-slate-200 peer-checked:bg-sky-500 rounded-full transition-colors peer-focus:ring-2 peer-focus:ring-sky-100 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6">
          <h2 className="text-base font-bold text-rose-800">Danger zone</h2>
          <p className="mt-1 text-sm text-rose-600">Irreversible platform-wide operations. Proceed with caution.</p>

          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Clear submission cache</p>
                <p className="text-xs text-slate-500 mt-0.5">Flushes cached submission results.</p>
              </div>
              <button className="shrink-0 px-4 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition-colors">
                Clear
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Reset leaderboard</p>
                <p className="text-xs text-slate-500 mt-0.5">Zeroes all user scores. Cannot be undone.</p>
              </div>
              <button className="shrink-0 px-4 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 text-sm font-semibold rounded-xl transition-colors">
                Reset
              </button>
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminSettingsPage;
