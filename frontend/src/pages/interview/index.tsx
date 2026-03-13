'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { getUserStats, getInterviewHistory, loadStreak } from '@/services/interviewService';
import { UserInterviewStats, InterviewHistory } from '@/types/interview';

const difficultyColor: Record<string, string> = {
  Poor: 'text-red-500 bg-red-50',
  Fair: 'text-amber-600 bg-amber-50',
  Good: 'text-blue-600 bg-blue-50',
  Excellent: 'text-emerald-600 bg-emerald-50',
};

const typeLabel: Record<string, string> = {
  mock: 'Mock',
  online_assessment: 'OA',
  phone: 'Phone',
  onsite: 'Onsite',
};

const typeColor: Record<string, string> = {
  mock: 'bg-purple-100 text-purple-700',
  online_assessment: 'bg-blue-100 text-blue-700',
  phone: 'bg-teal-100 text-teal-700',
  onsite: 'bg-orange-100 text-orange-700',
};

// Minimal circular progress ring
const ScoreRing: React.FC<{ score: number; size?: number; strokeWidth?: number }> = ({
  score,
  size = 64,
  strokeWidth = 5,
}) => {
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const cx = size / 2;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
      <circle
        cx={cx} cy={cx} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
};

export default function InterviewDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<UserInterviewStats | null>(null);
  const [history, setHistory] = useState<InterviewHistory[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setStats(getUserStats());
    setHistory(getInterviewHistory());
    setStreak(loadStreak());
  }, []);

  const quickActions = [
    {
      title: 'Mock Interview',
      desc: 'Random DSA questions with AI feedback',
      icon: '🤖',
      href: '/interview/mock',
      color: 'from-purple-500 to-indigo-600',
      badge: 'Most Popular',
    },
    {
      title: 'Assessment',
      desc: 'OA, phone & onsite simulations',
      icon: '📋',
      href: '/interview/assessment',
      color: 'from-blue-500 to-cyan-600',
      badge: null,
    },
    {
      title: 'Company Practice',
      desc: 'FAANG-specific question sets',
      icon: '🏢',
      href: '/interview/company',
      color: 'from-orange-500 to-rose-500',
      badge: 'New',
    },
  ];

  const statCards = [
    {
      label: 'Interviews Done',
      value: stats?.completedInterviews ?? 0,
      icon: '🎯',
      sub: `${stats?.totalInterviews ?? 0} total`,
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Avg Score',
      value: `${stats?.averageScore ?? 0}%`,
      icon: '📊',
      sub: `Best: ${stats?.bestScore ?? 0}%`,
      color: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Problems Solved',
      value: stats?.totalProblemsSolved ?? 0,
      icon: '✅',
      sub: `${stats?.totalProblemsAttempted ?? 0} attempted`,
      color: 'bg-violet-50 text-violet-700',
    },
    {
      label: 'Current Streak',
      value: streak,
      icon: '🔥',
      sub: `Best: ${stats?.longestStreak ?? 0} days`,
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white px-8 py-10">
          {/* Decorative circles */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-blue-500/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-500/10 rounded-full" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚡</span>
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-300">Interview Prep</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
                Your Interview HQ
              </h1>
              <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                Practice mock interviews, tackle company-specific questions, and get AI-powered feedback to land your dream job.
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-3">
              {/* Streak widget */}
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-400/30 rounded-xl px-4 py-2">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-xl font-bold text-orange-300">{streak}</p>
                  <p className="text-xs text-orange-400/80">day streak</p>
                </div>
              </div>

              <Link
                href="/interview/mock"
                className="inline-flex items-center gap-2 bg-white text-slate-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors duration-200 shadow-lg"
              >
                <span>Start Interview</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-slate-100 shadow-card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow duration-200"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${card.color} flex-shrink-0`}>
                {card.icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
                <p className="text-xs font-medium text-slate-500 truncate">{card.label}</p>
                <p className="text-xs text-slate-400">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 p-6"
              >
                {action.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-2 py-0.5 rounded-full">
                    {action.badge}
                  </span>
                )}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-4 shadow-md`}>
                  {action.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-1 group-hover:text-accent transition-colors duration-200">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-500">{action.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent">
                  <span>Start now</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform">
                    <path fillRule="evenodd" d="M2 8a.75.75 0 01.75-.75h8.69L8.22 4.03a.75.75 0 011.06-1.06l4.5 4.25a.75.75 0 010 1.06l-4.5 4.25a.75.75 0 01-1.06-1.06l3.22-3.22H2.75A.75.75 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Features Highlights ───────────────────────────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🎙️', label: 'AI Interviewer', desc: 'Real follow-up questions' },
            { icon: '📤', label: 'Resume-Based Qs', desc: 'Tailored to your experience' },
            { icon: '🔴', label: 'Interview Recording', desc: 'Review your sessions' },
            { icon: '📈', label: 'Weak Area Detection', desc: 'Know what to improve' },
          ].map((feat) => (
            <div key={feat.label} className="bg-white rounded-xl border border-slate-100 shadow-card p-4 text-center hover:shadow-card-hover transition-shadow duration-200">
              <div className="text-2xl mb-2">{feat.icon}</div>
              <p className="text-xs font-bold text-slate-800">{feat.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* ── Performance Overview ──────────────────────────────────────────── */}
        {stats && stats.completedInterviews > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Score ring + overall */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Overall Performance</h3>
              <div className="flex items-center gap-6">
                <div className="relative flex-shrink-0">
                  <ScoreRing score={stats.averageScore} size={80} strokeWidth={6} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">{stats.averageScore}%</span>
                  </div>
                </div>
                <div className="space-y-2 flex-1">
                  {[
                    { label: 'Easy', val: stats.byDifficulty.easy, color: 'bg-emerald-500' },
                    { label: 'Medium', val: stats.byDifficulty.medium, color: 'bg-amber-500' },
                    { label: 'Hard', val: stats.byDifficulty.hard, color: 'bg-red-500' },
                  ].map((d) => {
                    const pct = d.val.attempted > 0 ? Math.round((d.val.solved / d.val.attempted) * 100) : 0;
                    return (
                      <div key={d.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{d.label}</span>
                          <span className="text-slate-500">{d.val.solved}/{d.val.attempted}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${d.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weak & Strong Areas */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h3 className="font-bold text-slate-900 mb-4">Topic Analysis</h3>
              {stats.weakAreas.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Needs Work</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.weakAreas.map((area) => (
                      <span key={area} className="text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full font-medium">
                        ⚠ {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {stats.strongAreas.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.strongAreas.map((area) => (
                      <span key={area} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-full font-medium">
                        ✓ {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {stats.weakAreas.length === 0 && stats.strongAreas.length === 0 && (
                <p className="text-sm text-slate-400 italic">Complete an interview to see your topic analysis.</p>
              )}
            </div>
          </section>
        )}

        {/* ── Interview History ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Interview History</h2>
            {history.length > 5 && (
              <button className="text-xs text-accent font-semibold hover:underline">View All</button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
              <div className="text-4xl mb-3">🎤</div>
              <h3 className="font-bold text-slate-700 mb-1">No interviews yet</h3>
              <p className="text-sm text-slate-400 mb-4">Start your first mock interview to build your history.</p>
              <Link
                href="/interview/mock"
                className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors duration-200"
              >
                Start Mock Interview
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Interview</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Solved</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.slice(0, 8).map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="px-4 py-3 font-medium text-slate-800">{session.title}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${typeColor[session.type]}`}>
                            {typeLabel[session.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <ScoreRing score={session.score} size={28} strokeWidth={3} />
                            <span className="font-semibold text-slate-700">{session.score}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {session.solved}/{session.totalQuestions}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {session.duration < 60 ? `${session.duration}m` : `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor[session.rank]}`}>
                            {session.rank}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/interview/report/${session.id}`}
                            className="text-xs text-accent font-semibold hover:underline"
                          >
                            Report →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* ── Tips ─────────────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <h3 className="font-bold text-slate-900 mb-3">💡 Interview Tips</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { tip: 'Think out loud — interviewers value your reasoning process, not just the answer.', icon: '🗣️' },
              { tip: "Clarify the problem before coding. Ask about edge cases and constraints first.", icon: '❓' },
              { tip: "Start with a brute force, then optimize. Show you can iterate on your approach.", icon: '⚡' },
            ].map((t) => (
              <div key={t.tip} className="flex gap-3">
                <span className="text-xl flex-shrink-0">{t.icon}</span>
                <p className="text-slate-600 leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </Layout>
  );
}
