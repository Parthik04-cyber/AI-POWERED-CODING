'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { createSession, getRandomQuestions, persistSession } from '@/services/interviewService';
import { InterviewType } from '@/types/interview';

interface AssessmentMode {
  id: InterviewType;
  title: string;
  icon: string;
  tagline: string;
  description: string;
  duration: string;
  questions: number;
  rounds: number;
  features: string[];
  gradient: string;
  border: string;
  difficulty: string;
  format: string[];
  sampleTopics: string[];
}

const ASSESSMENT_MODES: AssessmentMode[] = [
  {
    id: 'online_assessment',
    title: 'Online Assessment',
    icon: '💻',
    tagline: 'Replicate real OA conditions',
    description: 'Simulate the timed online assessments used by top tech companies. Solve algorithmic problems under time pressure — just like the real thing.',
    duration: '90 min',
    questions: 3,
    rounds: 1,
    features: [
      'Timed coding challenges',
      'Auto-graded test cases',
      'No hints allowed',
      'AI analysis after submission',
    ],
    gradient: 'from-blue-500 to-cyan-600',
    border: 'border-blue-100',
    difficulty: 'Medium',
    format: ['Algorithm coding (2–3 problems)', 'Automated judge', 'Time limit enforced'],
    sampleTopics: ['Array', 'String', 'DP', 'Graph', 'Sorting'],
  },
  {
    id: 'phone',
    title: 'Phone Interview',
    icon: '📞',
    tagline: 'Sharpen your verbal explanation',
    description: 'Practice the classic technical phone screen format — one problem, real-time code, think out loud while the AI plays a senior engineer screening you.',
    duration: '45 min',
    questions: 1,
    rounds: 1,
    features: [
      'Single focused problem',
      'AI interviewer responses',
      'Verbal walkthrough practice',
      'Edge case probing',
    ],
    gradient: 'from-teal-500 to-emerald-600',
    border: 'border-teal-100',
    difficulty: 'Medium',
    format: ['1 coding problem', 'Think-aloud required', 'Behavioral follow-ups'],
    sampleTopics: ['Array', 'String', 'Hash Table', 'Tree', 'Recursion'],
  },
  {
    id: 'onsite',
    title: 'Onsite Simulation',
    icon: '🏢',
    tagline: 'Full interview loop experience',
    description: 'Go through a complete multi-round onsite simulation. Coding rounds + system design concepts + behavioral questions — the whole package.',
    duration: '3–4 hrs',
    questions: 5,
    rounds: 4,
    features: [
      'Multiple coding rounds',
      'System design questions',
      'Behavioral round',
      'Comprehensive AI report',
    ],
    gradient: 'from-orange-500 to-rose-500',
    border: 'border-orange-100',
    difficulty: 'Hard',
    format: ['4 rounds: 2 coding, 1 system design, 1 behavioral', 'Round-by-round feedback', 'Hire/No-hire decision score'],
    sampleTopics: ['All topics', 'System Design', 'OOP', 'Concurrency', 'Leadership'],
  },
];

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: 'text-emerald-600 bg-emerald-50',
  Medium: 'text-amber-600 bg-amber-50',
  Hard: 'text-red-500 bg-red-50',
};

export default function Assessment() {
  const router = useRouter();
  const [selected, setSelected] = useState<AssessmentMode | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const handleSelect = (mode: AssessmentMode) => {
    setSelected(mode);
    setConfirmModal(true);
  };

  const handleStart = async () => {
    if (!selected) return;
    setStarting(true);
    const questions = getRandomQuestions(selected.questions, undefined, undefined, undefined);
    const session = createSession(selected.id, questions);
    session.status = 'in_progress';
    session.startTime = new Date();
    persistSession(session);
    router.push(`/interview/mock?session=${session.id}&type=${selected.id}`);
  };

  const previousSessions = [
    { type: 'online_assessment', date: '—', score: '—', status: 'No sessions yet' },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div>
          <Link href="/interview" className="text-sm text-slate-500 hover:text-accent inline-flex items-center gap-1 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M14 8a.75.75 0 01-.75.75H4.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L4.56 7.25H13.25A.75.75 0 0114 8z" clipRule="evenodd" />
            </svg>
            Interview Hub
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assessments</h1>
          <p className="text-slate-500 mt-1.5 text-sm max-w-2xl">
            Choose your assessment format. Each simulation mirrors real-world interview conditions to prepare you optimally.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ASSESSMENT_MODES.map((mode) => (
            <div
              key={mode.id}
              className={`group bg-white rounded-2xl border ${mode.border} shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 overflow-hidden cursor-pointer`}
              onClick={() => handleSelect(mode)}
            >
              {/* Card top gradient banner */}
              <div className={`h-2 bg-gradient-to-r ${mode.gradient}`} />

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mode.gradient} flex items-center justify-center text-2xl shadow-md`}>
                    {mode.icon}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFFICULTY_STYLE[mode.difficulty]}`}>
                      {mode.difficulty}
                    </span>
                    <span className="text-xs text-slate-400">{mode.duration}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-0.5 group-hover:text-accent transition-colors duration-200">
                  {mode.title}
                </h3>
                <p className="text-xs font-medium text-slate-400 mb-3">{mode.tagline}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{mode.description}</p>

                <div className="space-y-1.5 mb-4">
                  {mode.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs text-slate-600">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      {feat}
                    </div>
                  ))}
                </div>

                {/* Topics */}
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {mode.sampleTopics.slice(0, 4).map((topic) => (
                    <span key={topic} className="text-[11px] bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {topic}
                    </span>
                  ))}
                </div>

                <button
                  className={`w-full py-2.5 bg-gradient-to-r ${mode.gradient} text-white font-bold text-sm rounded-xl hover:opacity-90 transition-opacity duration-150 shadow-md`}
                >
                  Start {mode.title}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* What to expect */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ASSESSMENT_MODES.map((mode) => (
              <div key={mode.id} className="space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{mode.icon}</span>
                  <h3 className="font-bold text-slate-800 text-sm">{mode.title}</h3>
                </div>
                {mode.format.map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${mode.gradient} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-600 leading-snug">{step}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Tips section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>🎯</span> OA Strategy
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Read all problems first, start with the easiest</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Don't get stuck — a partial solution is better than none</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Handle edge cases: empty array, null, duplicates</li>
              <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">→</span> Test with the given examples before submitting</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100 p-5">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>📞</span> Phone Screen Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Always clarify requirements before writing any code</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Narrate your thinking process continuously</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Start with brute force, then optimize step by step</li>
              <li className="flex items-start gap-2"><span className="text-teal-500 mt-0.5">→</span> Ask about time/space complexity expectations</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-rose-50 rounded-2xl border border-orange-100 p-5 md:col-span-2">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span>🏢</span> Onsite Survival Guide
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
              {[
                { icon: '⏰', title: 'Time Management', desc: 'Spend no more than 35 min per coding problem' },
                { icon: '🗣️', title: 'Communicate', desc: 'Talk through every decision, even tradeoffs' },
                { icon: '🧪', title: 'Test Your Code', desc: 'Walk through examples manually after writing' },
                { icon: '😌', title: 'Stay Calm', desc: 'Interviewers want to see how you handle pressure' },
              ].map((tip) => (
                <div key={tip.title} className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{tip.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-700 text-xs">{tip.title}</p>
                    <p className="text-xs text-slate-500 leading-snug mt-0.5">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* Confirmation Modal */}
      {confirmModal && selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${selected.gradient}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selected.gradient} flex items-center justify-center text-2xl`}>
                  {selected.icon}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">{selected.title}</h2>
                  <p className="text-sm text-slate-500">{selected.tagline}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-700">{selected.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Questions</span>
                  <span className="font-semibold text-slate-700">{selected.questions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rounds</span>
                  <span className="font-semibold text-slate-700">{selected.rounds}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Difficulty</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${DIFFICULTY_STYLE[selected.difficulty]}`}>
                    {selected.difficulty}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Once started, the clock begins. Ensure you have a stable environment, a quiet space, and enough time to complete the session.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 transition-colors duration-150"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className={`flex-1 py-2.5 bg-gradient-to-r ${selected.gradient} text-white font-bold text-sm rounded-xl hover:opacity-90 disabled:opacity-60 transition-opacity duration-150 flex items-center justify-center gap-2`}
                >
                  {starting ? (
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : null}
                  {starting ? 'Launching...' : 'Begin Assessment →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
