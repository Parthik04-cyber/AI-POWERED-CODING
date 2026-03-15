'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { authAPI } from '@/services/api';

const ResetPassword: React.FC = () => {
  const router = useRouter();
  const token = useMemo(() => {
    if (!router.isReady) {
      return '';
    }

    const rawToken = router.query.token;
    if (Array.isArray(rawToken)) {
      return rawToken[0] || '';
    }

    return typeof rawToken === 'string' ? rawToken : '';
  }, [router.isReady, router.query.token]);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!token) {
      setError('Missing reset token. Please use the password reset link from your email.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await authAPI.resetPassword({ token, newPassword });
      setSuccessMessage('Password reset successful. You can now log in with your new password.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center h-full px-4 py-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset password</h2>
            <p className="text-sm text-slate-500 mt-0.5">Set a new password for your account</p>
          </div>

          {!token && router.isReady && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
              Invalid or missing reset token. Request a new reset link.
            </div>
          )}

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

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
                placeholder="Re-enter your new password"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-btn-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-500">
            <Link href="/login" className="text-accent font-medium hover:underline">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
