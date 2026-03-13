'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import { authAPI, problemAPI, submissionAPI } from '@/services/api';

interface UserRecord {
  _id?: string;
  userId?: string;
  username: string;
  score?: number;
}

interface ProblemRecord {
  _id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface ProblemCategoryStat {
  _id: string;
  count: number;
  totalSubmissions: number;
  totalAccepted: number;
}

interface SubmissionRecord {
  _id: string;
  status: string;
  language: string;
}

const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [stats, setStats] = useState<ProblemCategoryStat[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const [usersRes, problemsRes, statsRes, submissionsRes] = await Promise.all([
          authAPI.getUsers(),
          problemAPI.getAllProblems(0, 100),
          problemAPI.getStats(),
          submissionAPI.getAllSubmissionsAdmin(0, 100),
        ]);

        setUsers(usersRes.data.users || []);
        setProblems(problemsRes.data.problems || []);
        setStats(statsRes.data.stats || []);
        setSubmissions(submissionsRes.data.submissions || []);
      } catch (loadError: any) {
        setError(loadError.response?.data?.error || 'Failed to load analytics.');
      } finally {
        setLoading(false);
      }
    };

    void loadAnalytics();
  }, []);

  const acceptedCount = submissions.filter((item) => item.status?.toLowerCase() === 'accepted').length;
  const acceptanceRate = submissions.length ? Math.round((acceptedCount / submissions.length) * 100) : 0;
  const activeUsers = users.filter((user) => (user.score || 0) > 0).length;
  const averageScore = users.length
    ? Math.round(users.reduce((sum, user) => sum + (user.score || 0), 0) / users.length)
    : 0;

  const languageBreakdown = useMemo(() => {
    const counts = submissions.reduce<Record<string, number>>((accumulator, submission) => {
      const key = submission.language || 'unknown';
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts).sort((first, second) => second[1] - first[1]);
  }, [submissions]);

  const difficultyBreakdown = useMemo(() => {
    const counts = problems.reduce<Record<string, number>>((accumulator, problem) => {
      const key = problem.difficulty || 'Unknown';
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(counts);
  }, [problems]);

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
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : submissions.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Acceptance rate</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : `${acceptanceRate}%`}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Active users</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : activeUsers}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Average user score</p>
            <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '...' : averageScore}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr,1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">Problem category performance</h2>
            <div className="mt-5 space-y-3">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">Loading analytics...</div>
              ) : stats.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No category stats available.</div>
              ) : (
                stats.map((item) => (
                  <article key={item._id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-900">{item._id || 'Uncategorized'}</p>
                      <span className="text-sm text-slate-500">{item.count} problems</span>
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
                ) : languageBreakdown.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No submission data available.</div>
                ) : (
                  languageBreakdown.map(([language, count]) => (
                    <div key={language} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">{language}</p>
                      <p className="text-sm text-slate-600">{count} submissions</p>
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
                ) : difficultyBreakdown.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">No problems available.</div>
                ) : (
                  difficultyBreakdown.map(([difficulty, count]) => (
                    <div key={difficulty} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">{difficulty}</p>
                      <p className="text-sm text-slate-600">{count} problems</p>
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