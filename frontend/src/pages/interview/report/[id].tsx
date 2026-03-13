'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { getReportById } from '@/services/interviewService';
import { InterviewReport, QuestionAttempt } from '@/types/interview';

// ─── Score Ring ───────────────────────────────────────────────────────────────
const AnimatedScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const [animated, setAnimated] = useState(0);
  const size = 140;
  const strokeWidth = 10;
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (animated / 100) * circumference;

  const color =
    score >= 85 ? '#10b981' :
    score >= 70 ? '#3b82f6' :
    score >= 50 ? '#f59e0b' :
    '#ef4444';

  const label =
    score >= 85 ? 'Excellent' :
    score >= 70 ? 'Good' :
    score >= 50 ? 'Fair' :
    'Poor';

  const labelColor =
    score >= 85 ? 'text-emerald-600' :
    score >= 70 ? 'text-blue-600' :
    score >= 50 ? 'text-amber-600' :
    'text-red-500';

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 200);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-3xl font-extrabold text-slate-900">{score}</span>
          <span className="text-xs text-slate-400 font-medium">/ 100</span>
        </div>
      </div>
      <span className={`text-sm font-bold mt-1 ${labelColor}`}>{label}</span>
    </div>
  );
};

// ─── Category bar ─────────────────────────────────────────────────────────────
const CategoryBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(value), 300); return () => clearTimeout(t); }, [value]);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500 font-semibold">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full`}
          style={{ width: `${width}%`, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
};

// ─── Time complexity badge ────────────────────────────────────────────────────
const ComplexityBadge: React.FC<{ value: string; isOptimal: boolean }> = ({ value, isOptimal }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
    isOptimal ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
  }`}>
    {isOptimal ? '✓' : '⚡'} {value}
  </span>
);

// ─── Main component ───────────────────────────────────────────────────────────
export default function InterviewReportPage() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'complexity' | 'feedback'>('overview');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    const r = getReportById(id);
    setReport(r);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="animate-spin w-8 h-8 text-accent mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-slate-500 text-sm">Generating your report...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">This interview session may not exist or hasn't been completed yet.</p>
          <Link href="/interview" className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
            Back to Interview Hub
          </Link>
        </div>
      </Layout>
    );
  }

  const totalMinutes = Math.floor(report.totalTimeSeconds / 60);
  const avgTimePerQ = report.attempts.length > 0
    ? Math.round(report.attempts.reduce((sum, a) => sum + a.timeTaken, 0) / report.attempts.length / 60)
    : 0;

  const rankColors = {
    Poor: 'from-red-500 to-rose-600',
    Fair: 'from-amber-500 to-orange-500',
    Good: 'from-blue-500 to-indigo-500',
    Excellent: 'from-emerald-500 to-teal-500',
  };

  const rankBg = {
    Poor: 'bg-red-50 border-red-100',
    Fair: 'bg-amber-50 border-amber-100',
    Good: 'bg-blue-50 border-blue-100',
    Excellent: 'bg-emerald-50 border-emerald-100',
  };

  const statusColor: Record<string, string> = {
    solved: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    attempted: 'text-amber-600 bg-amber-50 border-amber-100',
    skipped: 'text-slate-500 bg-slate-50 border-slate-100',
    unattempted: 'text-slate-400 bg-slate-50 border-slate-100',
  };

  const diffColor: Record<string, string> = {
    Easy: 'text-emerald-600',
    Medium: 'text-amber-600',
    Hard: 'text-red-500',
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'questions', label: '📝 Questions' },
    { id: 'complexity', label: '⚡ Complexity' },
    { id: 'feedback', label: '🤖 AI Feedback' },
  ] as const;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/interview" className="text-sm text-slate-500 hover:text-accent inline-flex items-center gap-1 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z" clipRule="evenodd" />
              </svg>
              Interview Hub
            </Link>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Interview Report</h1>
            <p className="text-sm text-slate-500 mt-0.5">{report.title} · {new Date(report.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          </div>
          <Link
            href="/interview/mock"
            className="inline-flex items-center gap-2 bg-accent text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-accent-hover transition-colors shadow-btn-primary"
          >
            Practice Again →
          </Link>
        </div>

        {/* ── Hero Score Bar ─────────────────────────────────────────────────── */}
        <div className={`rounded-2xl bg-gradient-to-r ${rankColors[report.rank]} p-0.5 shadow-lg`}>
          <div className="bg-white rounded-[14px] p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Score ring */}
              <AnimatedScoreRing score={report.score} />

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                {[
                  { label: 'Solved', value: `${report.solved}/${report.totalQuestions}`, icon: '✅' },
                  { label: 'Total Time', value: `${totalMinutes}m`, icon: '⏱' },
                  { label: 'Avg per Q', value: `${avgTimePerQ}m`, icon: '📈' },
                  { label: 'Rank', value: report.rank, icon: '🏅' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-extrabold text-slate-900">{s.value}</p>
                    <p className="text-xs text-slate-500 font-medium">{s.icon} {s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                  activeTab === tab.id
                    ? 'text-accent border-b-2 border-accent bg-blue-50/50'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── OVERVIEW TAB ──────────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Performance by category */}
                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Performance Breakdown</h3>
                  <div className="space-y-3">
                    <CategoryBar label="Code Correctness" value={Math.min(100, report.score + 5)} color="bg-blue-500" />
                    <CategoryBar label="Code Efficiency" value={Math.max(30, report.score - 10)} color="bg-purple-500" />
                    <CategoryBar label="Code Readability" value={Math.min(100, report.score + 8)} color="bg-teal-500" />
                    <CategoryBar label="Problem-Solving Speed" value={Math.max(20, report.score - 15)} color="bg-orange-500" />
                    <CategoryBar label="Edge Case Handling" value={Math.max(25, report.score - 5)} color="bg-rose-500" />
                  </div>
                </div>

                {/* Weak & strong areas */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-3">Topic Analysis</h3>
                    {report.weakAreas.length > 0 ? (
                      <div className="mb-3">
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2">⚠ Weak Areas</p>
                        <div className="flex flex-wrap gap-2">
                          {report.weakAreas.map((area) => (
                            <span key={area} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full font-semibold">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mb-3">No significant weak areas detected.</p>
                    )}

                    {report.strongAreas.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">✓ Strengths</p>
                        <div className="flex flex-wrap gap-2">
                          {report.strongAreas.map((area) => (
                            <span key={area} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-semibold">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Overall feedback */}
                  <div className={`rounded-xl p-4 border ${rankBg[report.rank]}`}>
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Overall Feedback</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{report.overallFeedback}</p>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="md:col-span-2">
                  <h3 className="font-bold text-slate-900 mb-3">Recommendations</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {report.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-sm text-slate-600 leading-snug">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── QUESTIONS TAB ─────────────────────────────────────────────── */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                {report.attempts.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No questions attempted.</p>
                ) : (
                  report.attempts.map((attempt, i) => (
                    <div key={attempt.questionId} className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-slate-400">Q{i + 1}</span>
                          <span className="font-semibold text-slate-800">{attempt.question.title}</span>
                          <span className={`text-xs font-semibold ${diffColor[attempt.question.difficulty]}`}>
                            {attempt.question.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor[attempt.status]}`}>
                            {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            Score: <strong>{attempt.score}</strong>/100
                          </span>
                        </div>
                      </div>
                      {attempt.code && (
                        <div className="px-4 py-3">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Your Code ({attempt.language})
                          </p>
                          <pre className="bg-slate-900 text-slate-100 text-xs rounded-lg p-4 overflow-x-auto font-mono leading-relaxed max-h-40">
                            {attempt.code}
                          </pre>
                        </div>
                      )}
                      {attempt.aiFeedback && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            {[
                              { label: 'Correctness', val: attempt.aiFeedback.correctness },
                              { label: 'Efficiency', val: attempt.aiFeedback.efficiency },
                              { label: 'Readability', val: attempt.aiFeedback.readability },
                            ].map((m) => (
                              <div key={m.label} className="bg-slate-50 rounded-lg p-2.5 text-center">
                                <p className="text-base font-extrabold text-slate-800">{m.val}</p>
                                <p className="text-[11px] text-slate-400">{m.label}</p>
                              </div>
                            ))}
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed bg-blue-50 rounded-lg p-3 border border-blue-100">
                            {attempt.aiFeedback.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── COMPLEXITY TAB ────────────────────────────────────────────── */}
            {activeTab === 'complexity' && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-sm text-slate-600 mb-2">
                  <p className="font-semibold text-slate-700 mb-1">Time Complexity Analysis</p>
                  <p>Compare your solution's complexity against the optimal approach for each problem.</p>
                </div>

                {report.timeComplexityAnalysis.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No complexity data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Problem</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Your Complexity</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Optimal</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {report.timeComplexityAnalysis.map((row, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors duration-150">
                            <td className="px-4 py-3 font-medium text-slate-700">{row.question}</td>
                            <td className="px-4 py-3">
                              <ComplexityBadge value={row.yourComplexity} isOptimal={row.isOptimal} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-mono text-xs text-slate-600">{row.optimalComplexity}</span>
                            </td>
                            <td className="px-4 py-3">
                              {row.isOptimal ? (
                                <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                  </svg>
                                  Optimal
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                    <path fillRule="evenodd" d="M8 1.75a.75.75 0 0 1 .692.462l1.41 3.393 3.664.293a.75.75 0 0 1 .428 1.317l-2.791 2.39.853 3.575a.75.75 0 0 1-1.12.814L8 11.82l-3.136 1.174a.75.75 0 0 1-1.12-.814l.853-3.574-2.79-2.39a.75.75 0 0 1 .427-1.318l3.663-.293 1.412-3.393A.75.75 0 0 1 8 1.75Z" clipRule="evenodd" />
                                  </svg>
                                  Can improve
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Big O cheat sheet */}
                <div className="mt-6 bg-slate-900 rounded-xl p-5">
                  <p className="text-sm font-bold text-slate-200 mb-3">Big O Quick Reference</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { notation: 'O(1)', name: 'Constant', color: 'text-emerald-400' },
                      { notation: 'O(log n)', name: 'Logarithmic', color: 'text-teal-400' },
                      { notation: 'O(n)', name: 'Linear', color: 'text-blue-400' },
                      { notation: 'O(n log n)', name: 'Linearithmic', color: 'text-yellow-400' },
                      { notation: 'O(n²)', name: 'Quadratic', color: 'text-orange-400' },
                      { notation: 'O(2ⁿ)', name: 'Exponential', color: 'text-red-400' },
                    ].map((row) => (
                      <div key={row.notation} className="flex items-center gap-2">
                        <span className={`font-mono text-sm font-bold ${row.color}`}>{row.notation}</span>
                        <span className="text-xs text-slate-400">{row.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── AI FEEDBACK TAB ───────────────────────────────────────────── */}
            {activeTab === 'feedback' && (
              <div className="space-y-6">
                {report.attempts.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-8">No feedback available.</p>
                ) : (
                  report.attempts.map((attempt, i) => (
                    attempt.aiFeedback ? (
                      <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                        <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100">
                          <span className="text-lg">🤖</span>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{attempt.question.title}</p>
                            <p className="text-xs text-slate-400">AI Interviewer Feedback</p>
                          </div>
                          <div className="ml-auto flex items-center gap-2">
                            <div className="text-center">
                              <p className="text-lg font-extrabold text-slate-900">{attempt.aiFeedback.overallScore}</p>
                              <p className="text-[10px] text-slate-400">Score</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* Metrics */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <CategoryBar label="Code Quality" value={attempt.aiFeedback.codeQuality} color="bg-blue-500" />
                              <CategoryBar label="Correctness" value={attempt.aiFeedback.correctness} color="bg-emerald-500" />
                              <CategoryBar label="Efficiency" value={attempt.aiFeedback.efficiency} color="bg-purple-500" />
                            </div>
                            <div className="space-y-2">
                              <CategoryBar label="Readability" value={attempt.aiFeedback.readability} color="bg-teal-500" />
                              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Time Complexity</span>
                                  <ComplexityBadge value={attempt.aiFeedback.timeComplexity} isOptimal={attempt.score >= 80} />
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-slate-500">Space Complexity</span>
                                  <ComplexityBadge value={attempt.aiFeedback.spaceComplexity} isOptimal={attempt.score >= 75} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1.5">Interviewer Note</p>
                            <p className="text-sm text-slate-700 leading-relaxed">{attempt.aiFeedback.explanation}</p>
                          </div>

                          {/* Strengths & Improvements */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Strengths</p>
                              <ul className="space-y-1.5">
                                {attempt.aiFeedback.strengths.map((s, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5">
                                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                                    </svg>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2">Improve</p>
                              <ul className="space-y-1.5">
                                {attempt.aiFeedback.improvements.map((s, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5">
                                      <path fillRule="evenodd" d="M8.914 6.025a.75.75 0 0 1 1.06 0 .75.75 0 0 1 0 1.06L8.06 9l1.913 1.914a.75.75 0 1 1-1.06 1.061L7 10.061l-1.914 1.914a.75.75 0 1 1-1.06-1.06L5.939 9 4.026 7.086a.75.75 0 1 1 1.06-1.06L7 7.94l1.914-1.915Z" clipRule="evenodd" />
                                    </svg>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Suggestions */}
                          {attempt.aiFeedback.suggestions.length > 0 && (
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Suggestions</p>
                              <ul className="space-y-1.5">
                                {attempt.aiFeedback.suggestions.map((s, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                                    <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div>
            <p className="font-bold text-slate-900">Ready to improve?</p>
            <p className="text-sm text-slate-500">Start another session to work on your weak areas.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/interview/mock"
              className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors shadow-btn-primary"
            >
              New Mock Interview
            </Link>
            <Link
              href="/interview/company"
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Company Practice
            </Link>
          </div>
        </div>

      </div>
    </Layout>
  );
}
