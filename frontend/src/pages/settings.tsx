'use client';

import React from 'react';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { useAuthStore } from '@/utils/store';

const SettingsPage: React.FC = () => {
  const router = useRouter();
  const { token } = useAuthStore();

  React.useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [router, token]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-card">
          <h1 className="text-3xl font-black text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">Manage account preferences and notification options.</p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-800">Email notifications</p>
              <p className="text-sm text-slate-500 mt-1">Receive updates on contests, streaks, and premium events.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-800">Privacy and account</p>
              <p className="text-sm text-slate-500 mt-1">Control profile visibility and account security preferences.</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-800">Theme and UI</p>
              <p className="text-sm text-slate-500 mt-1">Customize visual preferences for your coding workspace.</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default SettingsPage;
