'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminShell from '@/components/admin/AdminShell';
import { adminContestPlans, adminSections } from '@/components/admin/adminData';
import { authAPI, problemAPI, submissionAPI } from '@/services/api';

interface ProblemCategoryStat {
  _id: string;
  count: number;
  totalSubmissions: number;
  totalAccepted: number;
}

interface ProblemRecord {
  _id: string;
  title: string;
  difficulty: string;
  category: string;
}

interface UserRecord {
  _id?: string;
  userId?: string;
  username: string;
  email: string;
  role: string;
  score?: number;
}

interface SubmissionRecord {
  _id: string;
  status: string;
  language: string;
  createdAt: string;
  userId?: {
    username?: string;
  };
  problemId?: {
    title?: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<ProblemCategoryStat[]>([]);
  const [problems, setProblems] = useState<ProblemRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [statsRes, problemsRes, usersRes, submissionsRes] = await Promise.all([
          problemAPI.getStats(),
          problemAPI.getAllProblems(0, 100),
          authAPI.getUsers(),
          submissionAPI.getAllSubmissionsAdmin(0, 20),
        ]);

        setStats(statsRes.data.stats || []);
        setProblems(problemsRes.data.problems || []);
        setUsers(usersRes.data.users || []);
        setSubmissions(submissionsRes.data.submissions || []);
      } catch (loadError: any) {
        setError(loadError.response?.data?.error || 'Failed to load dashboard.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const acceptedSubmissions = useMemo(
    () => submissions.filter((item) => item.status?.toLowerCase() === 'accepted').length,
    [submissions]
  );

  const summaryCards = useMemo(
    () => [
      {
        label: 'Users',
        value: users.length,
        note: `${users.filter((u) => u.role === 'admin').length} admins`,
        tone: 'from-blue-500 to-cyan-400',
      },
      {
        label: 'Problems',
        value: problems.length,
        note: `${stats.length} active categories`,
        tone: 'from-emerald-500 to-teal-400',
      },
      {
        label: 'Contests',
        value: adminContestPlans.length,
        note: `${adminContestPlans.filter((c) => c.status === 'Scheduled').length} scheduled`,
        tone: 'from-amber-500 to-orange-400',
      },
      {
        label: 'Submissions',
        value: submissions.length,
        note: `${acceptedSubmissions} accepted`,
        tone: 'from-violet-500 to-purple-400',
      },
    ],
    [acceptedSubmissions, problems.length, stats.length, submissions.length, users]
  );

  const recentSubmissions = submissions.slice(0, 6);
  const topCategories = stats.slice(0, 4);

  return (
    <AdminShell
      title="Dashboard"
      description="Platform summary, recent activity, and quick links to management sections."
    >
      <div className="space-y-6">
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        {/* Summary stat cards */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <article key={card.label} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className={`h-1 bg-gradient-to-r ${card.tone}`} />
              <div className="p-5">
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <p className="mt-3 text-3xl font-black text-slate-900">{loading ? '—' : card.value}</p>
                <p className="mt-1 text-sm text-slate-500">{loading ? 'Loading...' : card.note}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Recent submissions + Category snapshot */}
        <section className="grid gap-6 xl:grid-cols-[1.4fr,0.6fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-slate-900">Latest submissions</h2>
              <Link href="/admin/analytics" className="text-sm font-semibold text-sky-600 hover:text-sky-700">
                Analytics →
              </Link>
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading recent submissions...</p>
              ) : recentSubmissions.length === 0 ? (
                <p className="text-sm text-slate-500">No recent submissions yet.</p>
              ) : (
                recentSubmissions.map((s) => (
                  <div key={s._id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{s.problemId?.title || 'Unknown'}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {s.userId?.username || 'Unknown user'} · {s.language}
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status?.toLowerCase() === 'accepted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900">Problem categories</h2>
            <div className="mt-4 space-y-2">
              {loading ? (
                <p className="text-sm text-slate-500">Loading...</p>
              ) : topCategories.length === 0 ? (
                <p className="text-sm text-slate-500">No category data.</p>
              ) : (
                topCategories.map((item) => (
                  <div key={item._id} className="rounded-xl border border-slate-100 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item._id || 'Uncategorized'}</p>
                      <span className="text-xs text-slate-500">{item.count}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{item.totalAccepted} accepted</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Quick links to all sections */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-base font-bold text-slate-900">Management sections</h2>
            <p className="text-xs text-slate-400">Use dedicated pages for all management actions.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {adminSections
              .filter((section) => section.href !== '/admin/dashboard')
              .map((section) => (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-sky-200 hover:bg-sky-50/40"
                >
                  <div className={`inline-flex rounded-lg bg-gradient-to-r ${section.accent} px-2.5 py-0.5 text-xs font-semibold text-white`}>
                    {section.label}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-800">{section.description}</p>
                  <p className="mt-2 text-xs font-semibold text-sky-600 group-hover:text-sky-700">Open →</p>
                </Link>
              ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
