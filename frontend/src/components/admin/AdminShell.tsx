'use client';

import React, { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/utils/store';
import { adminSections } from './adminData';

interface AdminShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

const isActiveLink = (pathname: string, href: string) => {
  if (href === '/admin/dashboard') {
    return pathname === href || pathname === '/admin';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

const AdminShell: React.FC<AdminShellProps> = ({ title, description, actions, children }) => {
  const router = useRouter();
  const { initialized, token, user, logout } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;
    if (!token || !user) {
      router.replace('/admin/login');
      return;
    }
    if (user.role !== 'admin') {
      router.replace('/');
    }
  }, [initialized, router, token, user]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const isAuthorized = initialized && !!token && !!user && user.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-sm text-slate-500 animate-pulse">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <header className="h-14 shrink-0 border-b border-slate-200 bg-white px-6 flex items-center justify-between z-10">
        <Link
          href="/admin/dashboard"
          className="text-lg font-bold text-sky-600 tracking-tight hover:text-sky-700 transition-colors"
        >
          CodeMaster <span className="text-slate-400 font-semibold text-base">Admin</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:block text-sm text-slate-500">
            {user.username || user.email}
          </span>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            View site
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">
          <nav className="p-3 space-y-0.5">
            {adminSections.map((section) => {
              const active = isActiveLink(router.pathname, section.href);
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className={`flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {section.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto flex flex-col min-w-0">
          {/* Page header */}
          <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-start justify-between gap-4 shrink-0">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">{title}</h1>
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>
            {actions ? <div className="shrink-0 mt-1">{actions}</div> : null}
          </div>

          {/* Page body */}
          <div className="flex-1 px-8 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminShell;