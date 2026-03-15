'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { contestAPI } from '@/services/api';

const statusStyles: Record<string, string> = {
  Draft: 'bg-slate-100 text-slate-700',
  Scheduled: 'bg-blue-50 text-blue-700',
  Live: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-violet-50 text-violet-700',
};

type ContestStatus = 'Draft' | 'Scheduled' | 'Live' | 'Completed';

interface ContestAdminCard {
  id: string;
  title: string;
  description?: string;
  status: ContestStatus;
  startsAt?: string;
  endsAt?: string;
  durationMinutes: number;
  participantsTarget: number;
  problemCount: number;
}

interface ContestAdminOverview {
  totals: {
    plans: number;
    scheduled: number;
    live: number;
  };
  contests: ContestAdminCard[];
}

const formatDuration = (durationMinutes: number): string => {
  if (durationMinutes <= 0) {
    return 'TBD';
  }

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}m`;
};

const formatStartTime = (startsAt?: string): string => {
  if (!startsAt) {
    return 'Not scheduled';
  }

  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) {
    return 'Invalid time';
  }

  return parsed.toLocaleString();
};

const AdminContestsPage: React.FC = () => {
  const [overview, setOverview] = useState<ContestAdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchContests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contestAPI.getAdminOverview();
        if (!mounted) {
          return;
        }
        setOverview(response.data as ContestAdminOverview);
      } catch (err: any) {
        if (!mounted) {
          return;
        }
        setError(err?.response?.data?.error || 'Failed to load contest management data.');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchContests();

    return () => {
      mounted = false;
    };
  }, []);

  const totals = useMemo(
    () =>
      overview?.totals || {
        plans: 0,
        scheduled: 0,
        live: 0,
      },
    [overview]
  );

  const contests = overview?.contests || [];

  return (
    <AdminShell
      title="Contest Management"
      description="Live contest operations from the database, including schedules, active windows, and rollout goals."
    >
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Contest plans</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{totals.plans}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Scheduled</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{totals.scheduled}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Live now</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{totals.live}</p>
          </div>
        </section>

        {loading && (
          <section className="rounded-3xl border border-sky-200 bg-sky-50 px-5 py-4 text-sm text-sky-800">
            Loading latest contest metrics...
          </section>
        )}

        {error && (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
            {error}
          </section>
        )}

        {!loading && !error && contests.length === 0 && (
          <section className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
            No contests found in the database yet.
          </section>
        )}

        <section className="grid gap-4 xl:grid-cols-2">
          {contests.map((contest) => (
            <article key={contest.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{contest.problemCount} problems</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">{contest.title}</h2>
                  {contest.description && <p className="mt-2 text-sm text-slate-600">{contest.description}</p>}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[contest.status]}`}>
                  {contest.status}
                </span>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Start time</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatStartTime(contest.startsAt)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Duration</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDuration(contest.durationMinutes)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Problems</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{contest.problemCount}</p>
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