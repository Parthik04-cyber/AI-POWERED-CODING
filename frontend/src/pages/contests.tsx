'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Layout from '@/layouts/MainLayout';
import { contestAPI } from '@/services/api';

type ContestStatus = 'Draft' | 'Scheduled' | 'Live' | 'Completed';

type ContestItem = {
  id: string;
  title: string;
  description?: string;
  status: ContestStatus;
  startsAt?: string;
  endsAt?: string;
  durationMinutes: number;
  participantsTarget: number;
  problemCount: number;
};

const statusStyles: Record<ContestStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
  Live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Completed: 'bg-amber-50 text-amber-700 border-amber-200',
};

const formatDateTime = (value?: string) => {
  if (!value) return 'TBD';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const ContestsPage: React.FC = () => {
  const [contests, setContests] = useState<ContestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContests = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await contestAPI.getContests();
        const serverContests = Array.isArray(res.data?.contests) ? res.data.contests : [];
        setContests(serverContests);
      } catch (err: any) {
        setContests([]);
        setError(err?.response?.data?.error || 'Failed to load contests.');
      } finally {
        setIsLoading(false);
      }
    };

    loadContests();
  }, []);

  const totals = useMemo(() => {
    return contests.reduce(
      (acc, contest) => {
        acc.total += 1;
        if (contest.status === 'Scheduled') acc.scheduled += 1;
        if (contest.status === 'Live') acc.live += 1;
        if (contest.status === 'Completed') acc.completed += 1;
        return acc;
      },
      { total: 0, scheduled: 0, live: 0, completed: 0 }
    );
  }, [contests]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Contests</h1>
          <p className="mt-2 text-sm text-slate-600">Showing contests configured from the backend admin panel.</p>

          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total</p>
              <p className="text-2xl font-bold text-slate-900">{totals.total}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-blue-50 p-3">
              <p className="text-xs text-blue-600">Scheduled</p>
              <p className="text-2xl font-bold text-blue-700">{totals.scheduled}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-600">Live</p>
              <p className="text-2xl font-bold text-emerald-700">{totals.live}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-amber-50 p-3">
              <p className="text-xs text-amber-600">Completed</p>
              <p className="text-2xl font-bold text-amber-700">{totals.completed}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading contests...</div>
          ) : error ? (
            <div className="py-12 text-center text-rose-600">{error}</div>
          ) : contests.length === 0 ? (
            <div className="py-12 text-center text-slate-500">No contests available.</div>
          ) : (
            <div className="space-y-3">
              {contests.map((contest) => (
                <article key={contest.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{contest.title}</h2>
                      {contest.description && (
                        <p className="mt-1 text-sm text-slate-600">{contest.description}</p>
                      )}
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[contest.status]}`}>
                      {contest.status}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-slate-600">
                    <p>Starts: {formatDateTime(contest.startsAt)}</p>
                    <p>Ends: {formatDateTime(contest.endsAt)}</p>
                    <p>Problems: {contest.problemCount}</p>
                    <p>Duration: {contest.durationMinutes} mins</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ContestsPage;
