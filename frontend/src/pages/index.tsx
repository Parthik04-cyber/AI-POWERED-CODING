'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const Home: React.FC = () => {
  const featureCards = [
    {
      title: 'Real Problems',
      description: 'Practice coding interview problems from top companies with clear difficulty progression.',
      action: 'View Problems',
      href: '/problems',
    },
    {
      title: 'AI Feedback',
      description: 'Get instant AI-driven feedback on your approach, complexity, and code quality.',
      action: 'Try Feedback',
      href: '/explore',
    },
    {
      title: 'Coding Contests',
      description: 'Compete with developers worldwide and improve under realistic time pressure.',
      action: 'Join Contest',
      href: '/contests',
    },
  ];

  const stats = [
    { value: '500+', label: 'Coding Problems' },
    { value: '20K+', label: 'Developers' },
    { value: '50+', label: 'Companies' },
    { value: '2K+', label: 'AI Interview Sessions Daily' },
  ];

  const pricing = [
    {
      name: '7-Day Free Trial',
      price: '₹0',
      period: '',
      cta: 'Start Trial',
      href: '/register',
      items: ['Solve coding problems', 'Run code in editor', 'Access contests', 'Use AI interview features'],
      highlighted: false,
    },
    {
      name: 'CodeMaster Subscription',
      price: '₹499',
      period: '/ month',
      cta: 'Subscribe',
      href: '/premium',
      items: ['Full platform access', 'AI interview simulation', 'Coding contests', 'Advanced AI feedback'],
      highlighted: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar variant="landing" />

      <main className="pt-0">
        <section
          className="relative overflow-hidden mt-0 pt-0 scroll-mt-[70px]"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #2563EB 100%)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-10 lg:gap-14">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                  Master Coding Interviews with AI
                </h1>
                <p className="mt-5 text-slate-200 text-base sm:text-lg max-w-xl leading-relaxed">
                  Practice real coding problems, simulate AI interviews, and build confidence for top tech roles.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/problems"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-blue-950/30 transition-all duration-200"
                  >
                    Start Practicing
                  </Link>
                  <Link
                    href="/interview"
                    className="inline-flex items-center px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 font-semibold text-sm sm:text-base transition-all duration-200"
                  >
                    Try AI Interview
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-slate-900/70 backdrop-blur-sm shadow-2xl shadow-slate-900/50 p-4 sm:p-5">
                <div className="rounded-xl border border-slate-700/70 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>CodeMaster IDE</span>
                    <span>Interview Round 2</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-slate-200">
                      <p className="text-blue-300 mb-2">Prompt</p>
                      <p className="leading-relaxed">Implement LRU cache with O(1) get and put operations.</p>
                    </div>
                    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-slate-200">
                      <p className="text-emerald-300 mb-2">AI Feedback</p>
                      <p className="leading-relaxed">Good hashmap usage. Optimize node removal to reduce edge-case bugs.</p>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-slate-900 border border-slate-800 p-3 text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                    {`class LRUCache {\n  get(key) { /* O(1) */ }\n  put(key, value) { /* O(1) */ }\n}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="explore" className="bg-slate-50 py-10 md:py-12 scroll-mt-[70px]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Start Your Coding Journey</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
              Explore structured learning paths to master algorithms, system design, and interview strategy.
            </p>
            <Link
              href="/explore"
              className="mt-7 inline-flex items-center justify-center px-7 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20"
            >
              Explore Learning
            </Link>
          </div>
        </section>

        <section id="problems" className="bg-slate-100 py-10 md:py-12 scroll-mt-[70px] border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Practice Real Problems</h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Solve hand-picked coding challenges and learn the patterns that appear in real interviews.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition-shadow duration-300"
                >
                  <h3 className="text-xl font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-slate-600 leading-relaxed">{card.description}</p>
                  <Link
                    href={card.href}
                    className="mt-6 inline-flex items-center text-blue-700 hover:text-blue-600 font-semibold text-sm"
                  >
                    {card.action}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contests" className="py-10 md:py-12 scroll-mt-[70px]" style={{ backgroundColor: '#0F172A' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white">Get Ready for Top Tech Companies</h2>
                <p className="mt-4 text-slate-300 leading-relaxed max-w-xl">
                  Build interview readiness with guided practice, realistic coding environment, and company-level challenges.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200">Amazon-style rounds</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200">Google-level patterns</span>
                  <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-slate-200">Meta interview prep</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-slate-950/40">
                <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs sm:text-sm text-slate-300">
                  <p className="text-slate-400 mb-2">playground.ts</p>
                  <p>{`function twoSum(nums: number[], target: number) {`}</p>
                  <p className="pl-4">{`const map = new Map<number, number>();`}</p>
                  <p className="pl-4">{`for (let i = 0; i < nums.length; i++) {`}</p>
                  <p className="pl-8">{`const needed = target - nums[i];`}</p>
                  <p className="pl-8">{`if (map.has(needed)) return [map.get(needed), i];`}</p>
                  <p className="pl-8">{`map.set(nums[i], i);`}</p>
                  <p className="pl-4">{`}`}</p>
                  <p>{`}`}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="interview" className="bg-white py-10 md:py-12 scroll-mt-[70px] border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Interview Simulation Built for Engineers</h2>
              <p className="mt-3 text-slate-600">
                Practice timed rounds with AI prompts, structured hints, and feedback that mirrors real technical interviews.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Live Prompt Rounds</h3>
                <p className="mt-2 text-slate-600">Face realistic prompts for DSA, debugging, and design in a focused coding interface.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Structured AI Guidance</h3>
                <p className="mt-2 text-slate-600">Get hints that keep you progressing without immediately revealing the full solution.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">Post-Round Review</h3>
                <p className="mt-2 text-slate-600">Understand correctness, complexity, and communication quality after every round.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="discuss" className="bg-slate-50 py-10 md:py-12 scroll-mt-[70px] border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Discuss and Learn Together</h2>
              <p className="mt-3 text-slate-600">
                Ask questions, share solution strategies, and collaborate with a growing community of interview-focused developers.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                <h3 className="text-lg font-semibold text-slate-900">Topic Threads</h3>
                <p className="mt-2 text-slate-600">Browse discussions on arrays, graphs, system design, and interview experiences.</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
                <h3 className="text-lg font-semibold text-slate-900">Peer Reviews</h3>
                <p className="mt-2 text-slate-600">Get practical feedback from developers preparing for the same company interviews.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-10 md:py-12 scroll-mt-[70px] border-t border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 text-center">Flexible Pricing for Every Stage</h2>
            <p className="mt-3 text-slate-600 text-center max-w-2xl mx-auto">
              Start free and upgrade when you need deeper AI coaching and advanced interview simulation.
            </p>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {pricing.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-xl p-[1px] bg-gradient-to-br from-slate-200 via-slate-100 to-blue-200"
                >
                  <div
                    className={`rounded-xl h-full bg-white p-6 shadow-[0_10px_28px_rgba(2,6,23,0.1)] ${plan.highlighted ? 'border border-blue-100' : 'border border-slate-100'
                      }`}
                  >
                    <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                    <div className="mt-3 flex items-end gap-1">
                      <p className="text-4xl font-extrabold text-slate-900">{plan.price}</p>
                      <p className="text-slate-500 pb-1">{plan.period}</p>
                    </div>
                    <ul className="mt-5 space-y-2 text-slate-600">
                      {plan.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.href}
                      className={`mt-7 inline-flex w-full items-center justify-center px-5 py-3 rounded-xl font-semibold transition-colors ${plan.highlighted
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                    >
                      {plan.cta}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-6 md:py-8 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">{stat.value}</p>
                  <p className="mt-1 text-sm sm:text-base text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="py-10 md:py-12"
          style={{ background: 'linear-gradient(90deg, #2563EB, #9333EA)' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Join the Developer Community</h2>
            <p className="mt-3 text-blue-100 max-w-2xl mx-auto">
              Start practicing with CodeMaster and get interview-ready with a focused, modern workflow.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center px-8 py-3 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer style={{ backgroundColor: '#020617' }} className="text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
            <p className="text-slate-400">© 2026 CodeMaster. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/about" className="text-slate-300 hover:text-white">About</Link>
              <Link href="/about" className="text-slate-300 hover:text-white">Terms</Link>
              <Link href="/about" className="text-slate-300 hover:text-white">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
