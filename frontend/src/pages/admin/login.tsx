'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const { initialized, token, user, setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in as admin, go straight to dashboard
  useEffect(() => {
    if (!initialized) return;
    if (token && user && user.role === 'admin') {
      router.replace('/admin/dashboard');
    }
  }, [initialized, token, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await authAPI.login(formData);

      if (data.user?.role !== 'admin') {
        setError('Access denied. Admin accounts only.');
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);

      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <p className="text-2xl font-bold text-sky-600 tracking-tight">
          CodeMaster <span className="text-slate-400 font-semibold text-xl">Admin</span>
        </p>
        <p className="mt-1 text-sm text-slate-500">Restricted access — administrators only</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h1 className="text-xl font-bold text-slate-900">Sign in to Admin Panel</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your admin credentials below.</p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Your password"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-sky-400 focus:ring-2 focus:ring-sky-100 focus:outline-none transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Not an admin?{' '}
          <a href="/login" className="text-sky-600 hover:underline font-medium">
            User login
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
