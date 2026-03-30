'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';
import { problemAPI } from '@/services/api';
import { useProblemStore, useAuthStore } from '@/utils/store';

type ProblemDifficultyStat = {
  _id: string;
  count: number;
  totalSubmissions: number;
  totalAccepted: number;
};

const getDifficultyStyle = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':   return 'text-emerald-600 bg-emerald-50';
    case 'Medium': return 'text-amber-600 bg-amber-50';
    case 'Hard':   return 'text-red-500 bg-red-50';
    default:       return 'text-slate-500 bg-slate-50';
  }
};

const Problems: React.FC = () => {
  const { problems, isLoading, setProblems, setIsLoading } = useProblemStore();
  const { user } = useAuthStore();

  const [loadError, setLoadError]   = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stats, setStats] = useState<ProblemDifficultyStat[]>([]);
  const [search, setSearch]         = useState('');
  const [sortBy, setSortBy]         = useState<'default' | 'acceptance' | 'difficulty'>('default');
  const [skip, setSkip]             = useState(0);
  const [total, setTotal]           = useState(0);

  const limit = 20;

  useEffect(() => {
    loadProblems();
  }, [difficulty, selectedCategory, skip]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [categoriesRes, statsRes] = await Promise.all([
          problemAPI.getCategories(),
          problemAPI.getStats(),
        ]);
        setCategories(Array.isArray(categoriesRes.data?.categories) ? categoriesRes.data.categories : []);
        setStats(Array.isArray(statsRes.data?.stats) ? statsRes.data.stats : []);
      } catch {
        setCategories([]);
        setStats([]);
      }
    };
    loadMetadata();
  }, []);

  const loadProblems = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const { data } = await problemAPI.getAllProblems(skip, limit, difficulty, selectedCategory || undefined);
      if (!Array.isArray(data?.problems)) throw new Error('Unexpected API response');
      setProblems(data.problems);
      setTotal(typeof data.total === 'number' ? data.total : data.problems.length);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to load problems';
      setProblems([]);
      setTotal(0);
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = problems
    .filter((p: any) =>
      (!search || p.title?.toLowerCase().includes(search.toLowerCase())) &&
      (!difficulty || p.difficulty === difficulty)
    )
    .sort((a: any, b: any) => {
      if (sortBy === 'acceptance') {
        const aRate = a.submissionCount ? (a.acceptedCount / a.submissionCount) : 0;
        const bRate = b.submissionCount ? (b.acceptedCount / b.submissionCount) : 0;
        return bRate - aRate;
      }
      if (sortBy === 'difficulty') {
        const order: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
      }
      return 0;
    });

  const acceptanceRate = (p: any) =>
    p.submissionCount ? Math.round((p.acceptedCount / p.submissionCount) * 100) : 0;

  const totalProblems = stats.reduce((sum, item) => sum + Number(item.count || 0), 0);
  const totalSubmissions = stats.reduce((sum, item) => sum + Number(item.totalSubmissions || 0), 0);
  const totalAccepted = stats.reduce((sum, item) => sum + Number(item.totalAccepted || 0), 0);
  const overallAcceptance = totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 100) : 0;
  const latestProblem = filtered[0];

  return (
    <Layout>
      <div className="flex h-full">

        {/* ── Left Sidebar ── */}
        <aside className="hidden lg:flex flex-col self-start h-auto w-52 shrink-0 border-r border-slate-100 bg-white pt-4 pb-1 px-3 gap-1 overflow-visible">
          {['Library', 'Study Plan', 'Favorites', 'My Lists'].map((label) => (
            <button
              key={label}
              className="flex items-center px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left w-full font-medium"
            >
              {label}
            </button>
          ))}

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</p>
            {['', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d || 'all'}
                onClick={() => { setDifficulty(d); setSkip(0); }}
                className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  difficulty === d
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {d ? (
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    d === 'Easy' ? 'bg-emerald-500' : d === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                ) : (
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-300" />
                )}
                {d || 'All'}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-5">

            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => { setSelectedCategory(''); setSkip(0); }}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  !selectedCategory
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => { setSelectedCategory(category); setSkip(0); }}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search + Sort row */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 3a6 6 0 104.472 10.001l3.263 3.264a1 1 0 001.414-1.414l-3.264-3.263A6 6 0 009 3zm-4 6a4 4 0 118 0 4 4 0 01-8 0z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1.586l-4.707 4.707A1 1 0 0012 11v5.382l-4-2V11a1 1 0 00-.293-.707L3 5.586V4z" clipRule="evenodd" />
                </svg>
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              >
                <option value="default">Default</option>
                <option value="acceptance">Acceptance</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>

            {/* Problems Table */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <svg className="animate-spin h-8 w-8 mb-3 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Loading problems…
              </div>
            ) : loadError ? (
              <div className="text-center py-20 text-red-400 text-sm">{loadError}</div>
            ) : (
              <>
                <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                  {/* Table header */}
                  <div className="grid grid-cols-[2rem_1fr_6rem_7rem_5rem] gap-x-3 px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>#</span>
                    <span>Title</span>
                    <span className="text-center">Difficulty</span>
                    <span className="text-right">Acceptance</span>
                    <span className="text-center">Status</span>
                  </div>

                  {filtered.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-sm">No problems found.</div>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {filtered.map((problem: any, idx: number) => {
                        const rate = acceptanceRate(problem);
                        const num = skip + idx + 1;
                        return (
                          <Link key={problem._id} href={`/problems/${problem._id}`}>
                            <div className="grid grid-cols-[2rem_1fr_6rem_7rem_5rem] gap-x-3 px-4 py-3 items-center hover:bg-slate-50 transition-colors cursor-pointer group">
                              <span className="text-xs text-slate-400 font-mono">{num}</span>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">
                                  {problem.title}
                                </p>
                                {problem.category && (
                                  <span className="inline-block mt-0.5 text-xs text-slate-400">{problem.category}</span>
                                )}
                              </div>
                              <span className={`justify-self-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getDifficultyStyle(problem.difficulty)}`}>
                                {problem.difficulty}
                              </span>
                              <div className="flex flex-col items-end gap-0.5">
                                <span className="text-xs font-medium text-slate-700">{rate}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${rate >= 60 ? 'bg-emerald-400' : rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                                    style={{ width: `${rate}%` }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-center">
                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                                  problem.solved ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {problem.solved ? (
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l6.879-6.879a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                  ) : (
                                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/>
                                    </svg>
                                  )}
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {total > limit && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setSkip(Math.max(0, skip - limit))}
                      disabled={skip === 0}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 111.414 1.414L9.414 10l3.293 3.293a1 1 0 010 1.414z" clipRule="evenodd"/></svg>
                      Prev
                    </button>
                    <span className="text-sm text-slate-500">
                      {skip + 1}–{Math.min(skip + limit, total)} of {total}
                    </span>
                    <button
                      onClick={() => setSkip(skip + limit)}
                      disabled={skip + limit >= total}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        {/* ── Right Sidebar ── */}
        <aside className="hidden xl:flex flex-col w-64 shrink-0 border-l border-slate-100 bg-white py-4 px-3 gap-5 overflow-y-auto">

          {/* Latest Problem */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Latest Problem</p>
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
              {latestProblem ? (
                <div>
                  <p className="text-xs font-semibold text-slate-700 truncate">{latestProblem.title}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${getDifficultyStyle(latestProblem.difficulty)}`}>
                      {latestProblem.difficulty}
                    </span>
                    <Link href={`/problems/${latestProblem._id}`} className="text-[11px] text-blue-600 font-semibold hover:underline">Solve →</Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No problems available.</p>
              )}
            </div>
          </div>

          {/* Problem Catalog */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Problem Catalog</p>
            <div className="rounded-xl border border-slate-100 p-3 bg-slate-50">
              <p className="text-2xl font-extrabold text-slate-800">{totalProblems}</p>
              <p className="text-xs text-slate-500 mt-0.5">total problems from admin catalog</p>
            </div>
          </div>

          {/* Difficulty Stats */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Difficulty Stats</p>
            <div className="space-y-2.5">
              {stats.map((item) => {
                const label = item._id || 'Unknown';
                const accepted = Number(item.totalAccepted || 0);
                const submissions = Number(item.totalSubmissions || 0);
                const ratio = submissions > 0 ? (accepted / submissions) * 100 : 0;
                const color = label === 'Easy' ? 'bg-emerald-400' : label === 'Medium' ? 'bg-amber-400' : 'bg-red-400';
                return (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{label}</span>
                    <span className="text-slate-400">{item.count} problems</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${ratio}%` }} />
                  </div>
                </div>
                );
              })}
              {stats.length === 0 && (
                <p className="text-xs text-slate-500">No stats available.</p>
              )}
            </div>
            <div className="mt-3 p-2.5 bg-blue-50 rounded-lg text-center">
              <p className="text-2xl font-extrabold text-blue-600">{overallAcceptance}%</p>
              <p className="text-xs text-slate-500 mt-0.5">overall acceptance rate</p>
            </div>
          </div>

        </aside>
      </div>
    </Layout>
  );
};

export default Problems;

