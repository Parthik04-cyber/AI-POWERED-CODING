'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { adminContestPlans } from '@/components/admin/adminData';

const statusStyles: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Scheduled: 'bg-blue-50 text-blue-700',
  Live: 'bg-emerald-50 text-emerald-700',
};

const AdminContestsPage: React.FC = () => {
  return (
    <AdminShell
      title="Contest Management"
      description="Contest scheduling is now separated from the dashboard. This page tracks rollout status and upcoming contest operations."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Contest plans</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminContestPlans.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Scheduled</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminContestPlans.filter((item) => item.status === 'Scheduled').length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Live now</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{adminContestPlans.filter((item) => item.status === 'Live').length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Contest creation and editing APIs are not wired yet. This page is ready for that split, but publishing actions should be added on the backend before enabling form-based management.
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          {adminContestPlans.map((contest) => (
            <article key={contest.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{contest.format}</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{contest.name}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[contest.status]}`}>
                  {contest.status}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Start time</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{new Date(contest.startTime).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Target participation</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{contest.participantsTarget} users</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminContestsPage;