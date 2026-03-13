'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { COMPANY_SETS, MOCK_QUESTIONS, CompanyQuestionSet } from '@/types/interview';
import { createSession, getCompanyQuestions, persistSession } from '@/services/interviewService';

const COMPANY_LOGOS: Record<string, React.ReactNode> = {
  Amazon: (
    <svg viewBox="0 0 120 40" className="w-20 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#FF9900">amazon</text>
    </svg>
  ),
  Google: (
    <svg viewBox="0 0 120 40" className="w-20 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#4285F4">Go</text>
      <text x="28" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#EA4335">o</text>
      <text x="47" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#FBBC05">g</text>
      <text x="64" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#4285F4">l</text>
      <text x="74" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#34A853">e</text>
    </svg>
  ),
  Microsoft: (
    <div className="flex items-center gap-1.5">
      <div className="grid grid-cols-2 gap-px w-6 h-6">
        <div className="bg-[#F25022]" />
        <div className="bg-[#7FBA00]" />
        <div className="bg-[#00A4EF]" />
        <div className="bg-[#FFB900]" />
      </div>
      <span className="font-semibold text-slate-700 text-sm">Microsoft</span>
    </div>
  ),
  Meta: (
    <svg viewBox="0 0 120 40" className="w-16 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="30" fontFamily="Arial" fontWeight="bold" fontSize="28" fill="#0866FF">Meta</text>
    </svg>
  ),
};

const DiffBar: React.FC<{ easy: number; medium: number; hard: number }> = ({ easy, medium, hard }) => {
  const total = easy + medium + hard;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(easy / total) * 100}%` }} />
        <div className="bg-amber-500 h-full transition-all" style={{ width: `${(medium / total) * 100}%` }} />
        <div className="bg-red-500 h-full transition-all" style={{ width: `${(hard / total) * 100}%` }} />
      </div>
      <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-shrink-0">
        <span className="text-emerald-600 font-semibold">{easy}E</span>
        <span className="text-amber-600 font-semibold">{medium}M</span>
        <span className="text-red-500 font-semibold">{hard}H</span>
      </div>
    </div>
  );
};

export default function CompanyPractice() {
  const router = useRouter();
  const [activeCompany, setActiveCompany] = useState<CompanyQuestionSet | null>(null);
  const [starting, setStarting] = useState(false);
  const [questionCount, setQuestionCount] = useState(3);
  const [filterTopic, setFilterTopic] = useState('');

  const companyQuestions = activeCompany
    ? MOCK_QUESTIONS.filter((q) => q.companies.includes(activeCompany.company as any))
    : [];

  const filteredQuestions = filterTopic
    ? companyQuestions.filter((q) => q.tags.includes(filterTopic) || q.category === filterTopic)
    : companyQuestions;

  const allTopicsForCompany = activeCompany
    ? Array.from(new Set(companyQuestions.flatMap((q) => q.tags)))
    : [];

  useEffect(() => {
    if (!router.isReady || activeCompany) {
      return;
    }

    const queryCompany = typeof router.query.company === 'string' ? router.query.company : '';
    if (!queryCompany) {
      return;
    }

    const matchedCompany = COMPANY_SETS.find(
      (companySet) => companySet.company.toLowerCase() === queryCompany.toLowerCase()
    );

    if (matchedCompany) {
      setActiveCompany(matchedCompany);
    }
  }, [activeCompany, router.isReady, router.query.company]);

  const handleStartPractice = async () => {
    if (!activeCompany) return;
    setStarting(true);
    const questions = getCompanyQuestions(activeCompany.company, questionCount);
    const session = createSession('mock', questions, activeCompany.company);
    session.status = 'in_progress';
    session.startTime = new Date();
    persistSession(session);
    router.push(`/interview/mock?session=${session.id}&company=${activeCompany.company}`);
  };

  const difficultyColors: Record<string, string> = {
    Easy: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    Medium: 'text-amber-600 bg-amber-50 border-amber-100',
    Hard: 'text-red-500 bg-red-50 border-red-100',
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div>
          <Link href="/interview" className="text-sm text-slate-500 hover:text-accent inline-flex items-center gap-1 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z" clipRule="evenodd" />
            </svg>
            Interview Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Interview Practice</h1>
          <p className="text-slate-500 mt-1.5 text-sm max-w-2xl">
            Prepare for specific company interviews with curated question sets, process insights, and insider tips.
          </p>
        </div>

        {!activeCompany ? (
          <>
            {/* Company Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {COMPANY_SETS.map((cs) => (
                <div
                  key={cs.company}
                  onClick={() => setActiveCompany(cs)}
                  className={`group cursor-pointer bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden`}
                >
                  <div className={`h-1.5 bg-gradient-to-r ${cs.bgGradient.replace('from-', 'from-').replace('to-', 'to-')}`}
                    style={{ background: cs.company === 'Amazon' ? 'linear-gradient(to right, #FF9900, #ff6600)' : cs.company === 'Google' ? 'linear-gradient(to right, #4285F4, #34A853)' : cs.company === 'Microsoft' ? 'linear-gradient(to right, #00A4EF, #7FBA00)' : 'linear-gradient(to right, #0866FF, #0a7cff)' }}
                  />
                  <div className="p-6">
                    {/* Company identity */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cs.bgGradient} flex items-center justify-center text-3xl border border-white shadow-md`}>
                          {cs.logo}
                        </div>
                        <div>
                          <h2 className="text-xl font-extrabold text-slate-900 group-hover:text-accent transition-colors duration-200">
                            {cs.company}
                          </h2>
                          <p className="text-xs text-slate-500">{cs.totalQuestions} questions · {cs.avgRounds} rounds</p>
                        </div>
                      </div>
                      <button className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-br ${cs.bgGradient} ${cs.color} border border-current/10 hover:opacity-80 transition-opacity`}>
                        Practice →
                      </button>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{cs.description}</p>

                    {/* Difficulty distribution */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Difficulty</p>
                      <DiffBar easy={cs.difficulty.easy} medium={cs.difficulty.medium} hard={cs.difficulty.hard} />
                    </div>

                    {/* Topics */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Top Topics</p>
                      <div className="flex flex-wrap gap-1.5">
                        {cs.popularTopics.map((topic) => (
                          <span key={topic} className="text-xs bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pro tip */}
                    <div className={`rounded-xl p-3 bg-gradient-to-br ${cs.bgGradient} border border-current/10`}>
                      <p className={`text-xs font-bold ${cs.color} mb-0.5`}>💡 {cs.tipTitle}</p>
                      <p className="text-xs text-slate-600">{cs.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats comparison */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Company Comparison</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Questions</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty Split</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Rounds</th>
                      <th className="text-left pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Hardest Topic</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {COMPANY_SETS.map((cs) => (
                      <tr key={cs.company} className="hover:bg-slate-50/50 transition-colors duration-150">
                        <td className="py-3">
                          <button
                            onClick={() => setActiveCompany(cs)}
                            className={`font-bold ${cs.color} hover:underline`}
                          >
                            {cs.company}
                          </button>
                        </td>
                        <td className="py-3 text-slate-600">{cs.totalQuestions}</td>
                        <td className="py-3 w-40">
                          <DiffBar easy={cs.difficulty.easy} medium={cs.difficulty.medium} hard={cs.difficulty.hard} />
                        </td>
                        <td className="py-3 text-slate-600">{cs.avgRounds}</td>
                        <td className="py-3">
                          <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-medium">
                            {cs.popularTopics[1] ?? 'System Design'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          /* ── Company Detail View ─────────────────────────────────────────── */
          <div className="space-y-6">
            {/* Back + header */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setActiveCompany(null); setFilterTopic(''); }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors duration-150"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z" clipRule="evenodd" />
                </svg>
              </button>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activeCompany.bgGradient} flex items-center justify-center text-2xl shadow-md`}>
                {activeCompany.logo}
              </div>
              <div>
                <h2 className={`text-2xl font-extrabold ${activeCompany.color}`}>{activeCompany.company}</h2>
                <p className="text-sm text-slate-500">{activeCompany.totalQuestions} questions · {activeCompany.avgRounds} rounds avg</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Questions list */}
              <div className="lg:col-span-2 space-y-4">
                {/* Topic filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500">Filter:</span>
                  <button
                    onClick={() => setFilterTopic('')}
                    className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${!filterTopic ? 'bg-accent text-white border-accent' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                  >
                    All
                  </button>
                  {allTopicsForCompany.slice(0, 8).map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setFilterTopic(topic)}
                      className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-colors ${filterTopic === topic ? 'bg-accent text-white border-accent' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                {/* Questions */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                  {filteredQuestions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No questions match this filter.
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Title</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Difficulty</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
                          <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Acceptance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredQuestions.map((q, i) => (
                          <tr key={q.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                            <td className="px-4 py-3 text-slate-400 text-xs font-mono">{i + 1}</td>
                            <td className="px-4 py-3 font-semibold text-slate-800">{q.title}</td>
                            <td className="px-4 py-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${difficultyColors[q.difficulty]}`}>
                                {q.difficulty}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">{q.category}</td>
                            <td className="px-4 py-3 text-xs text-slate-500">{q.acceptanceRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Right: Sidebar */}
              <div className="space-y-4">
                {/* Start Practice */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Start Practice</h3>
                  <div className="mb-4">
                    <label className="text-xs font-semibold text-slate-500 mb-2 block">Questions per session</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 5].map((n) => (
                        <button
                          key={n}
                          onClick={() => setQuestionCount(n)}
                          className={`flex-1 py-1.5 rounded-lg border text-sm font-bold transition-all ${questionCount === n ? 'bg-accent text-white border-accent' : 'text-slate-600 border-slate-200 hover:border-accent'}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleStartPractice}
                    disabled={starting}
                    className={`w-full py-2.5 bg-gradient-to-r ${
                      activeCompany.company === 'Amazon' ? 'from-orange-500 to-amber-500' :
                      activeCompany.company === 'Google' ? 'from-blue-500 to-cyan-500' :
                      activeCompany.company === 'Microsoft' ? 'from-green-500 to-emerald-500' :
                      'from-blue-600 to-blue-700'
                    } text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2`}
                  >
                    {starting ? (
                      <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : '🚀'}
                    {starting ? 'Starting...' : `Practice ${activeCompany.company}`}
                  </button>
                </div>

                {/* Interview Process */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Interview Process</h3>
                  <div className="space-y-2">
                    {activeCompany.interviewProcess.map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white flex-shrink-0 mt-0.5 ${
                          activeCompany.company === 'Amazon' ? 'bg-orange-500' :
                          activeCompany.company === 'Google' ? 'bg-blue-500' :
                          activeCompany.company === 'Microsoft' ? 'bg-green-500' : 'bg-blue-700'
                        }`}>
                          {i + 1}
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                  <h3 className="font-bold text-slate-900 mb-3">Difficulty Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: 'Easy', count: activeCompany.difficulty.easy, color: 'bg-emerald-500', pct: `${activeCompany.difficulty.easy}%` },
                      { label: 'Medium', count: activeCompany.difficulty.medium, color: 'bg-amber-500', pct: `${activeCompany.difficulty.medium}%` },
                      { label: 'Hard', count: activeCompany.difficulty.hard, color: 'bg-red-500', pct: `${activeCompany.difficulty.hard}%` },
                    ].map((d) => (
                      <div key={d.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-600 font-medium">{d.label}</span>
                          <span className="text-slate-400">{d.pct}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${d.color} rounded-full`} style={{ width: d.pct }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pro tip */}
                <div className={`rounded-2xl p-5 bg-gradient-to-br ${activeCompany.bgGradient} border border-slate-100`}>
                  <p className={`text-sm font-bold ${activeCompany.color} mb-1`}>💡 {activeCompany.tipTitle}</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{activeCompany.tip}</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}
