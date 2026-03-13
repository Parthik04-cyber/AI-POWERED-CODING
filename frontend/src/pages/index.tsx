'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">

        {/* Hero Section */}
        <div className="text-center mb-8 py-8 px-6 rounded-2xl bg-gradient-to-b from-blue-50/70 via-white to-white border border-slate-100">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
            Master Coding Interviews
          </h1>
          <p className="text-base text-slate-500 max-w-xl mx-auto leading-relaxed mb-4">
            Practice coding problems, get AI-powered feedback, and prepare for your dream job.
          </p>

          <div className="flex justify-center gap-2.5">
            <Link
              href="/problems"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-btn-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Start Practicing
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-sm font-semibold rounded-xl shadow-btn-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Explore Learning
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 text-sm font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-[12px] border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-default">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Real Problems</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Practice with real coding interview problems from top tech companies.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[12px] border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-default">
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI Feedback</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Get intelligent feedback on your solutions to improve faster.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[12px] border border-slate-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-default">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Compete</h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              Climb the leaderboard and see how you rank against other developers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
