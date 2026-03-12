'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/utils/store';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { user, token, logout, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="fixed top-0 w-full bg-dark-secondary border-b border-dark-tertiary z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-accent">
            CodeMaster
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/problems" className="hover:text-accent transition">
              Problems
            </Link>
            <Link href="/leaderboard" className="hover:text-accent transition">
              Leaderboard
            </Link>
          </div>

          <div className="flex space-x-4">
            {token && user ? (
              <>
                <Link href="/profile" className="hover:text-accent transition">
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 border border-accent text-accent hover:bg-accent-hover hover:text-white transition rounded-lg">
                  Login
                </Link>
                <Link href="/register" className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
