'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            Master Coding Interviews
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Practice coding problems, get AI-powered feedback, and prepare for your dream job.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/problems"
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-lg transition"
            >
              Start Practicing
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border-2 border-accent text-accent hover:bg-accent-hover hover:text-white font-semibold rounded-lg transition"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-dark-secondary p-8 rounded-lg border border-dark-tertiary">
            <h3 className="text-xl font-bold mb-4">💻 Real Problems</h3>
            <p className="text-gray-400">
              Practice with real coding interview problems from top tech companies.
            </p>
          </div>

          <div className="bg-dark-secondary p-8 rounded-lg border border-dark-tertiary">
            <h3 className="text-xl font-bold mb-4">🤖 AI Feedback</h3>
            <p className="text-gray-400">
              Get intelligent feedback on your solutions to improve faster.
            </p>
          </div>

          <div className="bg-dark-secondary p-8 rounded-lg border border-dark-tertiary">
            <h3 className="text-xl font-bold mb-4">🏆 Compete</h3>
            <p className="text-gray-400">
              Climb the leaderboard and see how you rank against other developers.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
