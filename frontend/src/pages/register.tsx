'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/layouts/MainLayout';
import { authAPI } from '@/services/api';
import { useAuthStore } from '@/utils/store';

const Register: React.FC = () => {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data } = await authAPI.register(formData);
      
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      setToken(data.token);
      
      router.push('/problems');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center h-full px-4 py-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <div className="mb-4 text-center">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create an account</h2>
            <p className="text-sm text-slate-500 mt-0.5">Start mastering coding interviews today</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="janedoe"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="jane@example.com"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs text-accent hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:border-accent focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 mt-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-btn-primary hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
