'use client';

import React, { useEffect, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { submissionAPI } from '@/services/api';

interface AnalyticsOverview {
  totalSubmissions: number;
  acceptanceRate: number;
  activeUsers: number;
  averageUserScore: number;
}

interface DifficultyPerformance {
  difficulty: string;
  totalSubmissions: number;
  totalAccepted: number;
  acceptanceRate: number;
}

interface LanguageDistribution {
  language: string;
  count: number;
}

interface DifficultyMix {
  difficulty: string;
  count: number;
}

interface AdminAnalyticsResponse {
  overview: AnalyticsOverview;
  problemCategoryPerformance: DifficultyPerformance[];
  submissionLanguagesDistribution: LanguageDistribution[];
  difficultyMix: DifficultyMix[];
}

const REFRESH_INTERVAL_MS = 30000;

const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState<AdminAnalyticsResponse | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setError('');
        const analyticsRes = await submissionAPI.getAdminAnalytics();
        setAnalytics(analyticsRes.data as AdminAnalyticsResponse);
      } catch (loadError: any) {
        setError(loadError.response?.data?.error || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();

    const intervalId = window.setInterval(() => {
      void loadAnalytics();
    }, REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const overview = analytics?.overview;

  return (
    <AdminShell
      title="Analytics"
      description="Use this page for platform metrics and trend checks. The dashboard stays focused on quick summaries while analytics carries the detail."
    >
      <div className="space-y-6">
        {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Submissions</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : overview?.totalSubmissions ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Acceptance rate</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : `${overview?.acceptanceRate ?? 0}%`}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Active users</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : overview?.activeUsers ?? 0}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Average user score</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : overview?.averageUserScore ?? 0}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Problem category performance</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading analytics...</div>
              ) : (analytics?.problemCategoryPerformance || []).length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No category stats available.</div>
              ) : (
                (analytics?.problemCategoryPerformance || []).map((item) => (
                  <article key={item.difficulty} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{item.difficulty}</p>
                      <span className="text-sm text-slate-500">{item.acceptanceRate}% accepted</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{item.totalSubmissions} submissions · {item.totalAccepted} accepted</p>
                  </article>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Submission languages</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading languages...</div>
                ) : (analytics?.submissionLanguagesDistribution || []).length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No submission data available.</div>
                ) : (
                  (analytics?.submissionLanguagesDistribution || []).map((item) => (
                    <div key={item.language} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.language}</p>
                      <p className="text-sm text-slate-600">{item.count} submissions</p>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900">Difficulty mix</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading difficulty mix...</div>
                ) : (analytics?.difficultyMix || []).length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No problems available.</div>
                ) : (
                  (analytics?.difficultyMix || []).map((item) => (
                    <div key={item.difficulty} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">{item.difficulty}</p>
                      <p className="text-sm text-slate-600">{item.count} problems</p>
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

export default AdminAnalyticsPage;