'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '@/layouts/MainLayout';
import { authAPI } from '@/services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [manualResetUrl, setManualResetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setManualResetUrl('');
    setIsLoading(true);

    try {
      const { data } = await authAPI.forgotPassword({ email });
      setSuccessMessage(data?.message || 'If an account exists for that email, a reset link has been sent.');

      if (typeof data?.resetUrl === 'string' && data.resetUrl.trim()) {
        setManualResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process password reset request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center h-full px-4 py-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Forgot password</h2>
            <p className="text-sm text-slate-500 mt-0.5">Enter your email to receive a reset link</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              {successMessage}
            </div>
          )}

          {manualResetUrl && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm break-all">
              <p className="font-medium mb-1">Development reset link:</p>
              <a href={manualResetUrl} className="underline" target="_blank" rel="noreferrer">
                {manualResetUrl}
              </a>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-btn-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-500">
            Remembered your password?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
