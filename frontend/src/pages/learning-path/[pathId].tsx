'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';

const LearningPathPage: React.FC = () => {
  const router = useRouter();
  const pathId = typeof router.query.pathId === 'string' ? router.query.pathId : '';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">Learning Path</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Path: {pathId || 'Overview'}</h1>
          <p className="mt-3 text-slate-600">
            Continue your structured learning path. Start this module to resume your course journey.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/course"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
            >
              Open Module
            </Link>
            <Link
              href="/explore"
              className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors"
            >
              Back to Explore
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LearningPathPage;
