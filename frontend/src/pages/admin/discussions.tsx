'use client';

import React from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { moderationGuidelines, moderationQueue } from '@/components/admin/adminData';

const severityStyles: Record<string, string> = {
  Low: 'bg-emerald-50 text-emerald-700',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-rose-50 text-rose-700',
};

const AdminDiscussionsPage: React.FC = () => {
  return (
    <AdminShell
      title="Discussion Moderation"
      description="Keep moderation work outside the dashboard. This page centralizes review queues, policy reminders, and pending community actions."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Queue size</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{moderationQueue.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Escalated</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{moderationQueue.filter((item) => item.status === 'Escalated').length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">High severity</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{moderationQueue.filter((item) => item.severity === 'High').length}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Community moderation endpoints are not exposed in the current backend. This page creates the dedicated admin surface now so review, delete, and escalation actions can be added without reworking the dashboard again.
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Moderation queue</h2>
            <div className="mt-5 space-y-3">
              {moderationQueue.map((item) => (
                <article key={item.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.category} · {item.reports} reports · {item.status}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${severityStyles[item.severity]}`}>
                      {item.severity}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Policy reminders</h2>
            <div className="mt-5 space-y-3">
              {moderationGuidelines.map((guideline) => (
                <div key={guideline} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                  {guideline}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminDiscussionsPage;