'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/utils/store';

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/course', label: 'Learn' },
  { href: '/problems', label: 'Problems' },
  { href: '/contests', label: 'Contests' },
  { href: '/discuss', label: 'Discuss' },
  { href: '/interview', label: 'Interview' },
  { href: '/store', label: 'Store' },
];

const landingNavLinks = [
  { href: '#explore', label: 'Explore' },
  { href: '#problems', label: 'Problems' },
  { href: '#contests', label: 'Contests' },
  { href: '#interview', label: 'Interview' },
  { href: '#discuss', label: 'Discuss' },
  { href: '#pricing', label: 'Pricing' },
];

interface NavbarProps {
  variant?: 'default' | 'landing';
}

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  const currentStreak = user?.codingStreak || 0;
  const currentCoins = user?.coins || 0;

  useEffect(() => {
    if (!token || !user) {
      setNotifications([]);
      return;
    }

    const baseItems: NotificationItem[] = [
      {
        id: 'n-1',
        title: 'Daily coding goal',
        description:
          currentStreak > 0
            ? `Great momentum. Your coding streak is ${currentStreak} day${currentStreak > 1 ? 's' : ''}.`
            : 'Solve one problem today to start your coding streak.',
        time: 'Today',
        read: false,
      },
      {
        id: 'n-2',
        title: 'Coin balance updated',
        description: `You currently have ${currentCoins} coins available in Store.`,
        time: 'Now',
        read: false,
      },
      {
        id: 'n-3',
        title: 'Premium features',
        description: user.isPremium
          ? 'Premium is active. Explore AI code review and advanced analytics.'
          : 'Upgrade to Premium to unlock AI review and premium interview tracks.',
        time: 'Latest',
        read: true,
      },
    ];

    setNotifications(baseItems);
  }, [token, user, currentStreak, currentCoins]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileMenuItems = useMemo(() => {
    return [
      { label: 'Profile', href: '/profile' },
      { label: 'Progress', href: '/leaderboard' },
      { label: 'Submissions', href: '/submissions' },
      { label: 'Settings', href: '/settings' },
    ];
  }, []);

  const openNotifications = () => {
    setNotificationsOpen((open) => !open);
    setProfileOpen(false);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const openProfileMenu = () => {
    setProfileOpen((open) => !open);
    setNotificationsOpen(false);
  };

  if (variant === 'landing') {
    return (
      <nav className="sticky top-0 mb-0 w-full bg-white border-b border-[#E5E7EB] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-[70px] flex items-center justify-between gap-4">
            <div className="shrink-0">
              <Link href="/" className="text-2xl font-bold text-slate-900 tracking-tight">
                CodeMaster
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-7">
              {landingNavLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[15px] font-medium text-[#374151] hover:text-[#2563EB] transition-colors duration-200"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="shrink-0 flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="px-3 sm:px-4 py-2 text-sm sm:text-[15px] font-medium text-[#374151] hover:text-[#2563EB] rounded-lg transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm sm:text-[15px] font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-navbar border-b border-slate-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-2">

          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-1 shrink-0">
            <Link href="/" className="text-xl font-bold text-accent tracking-tight mr-2">
              CodeMaster
            </Link>
            <div className="hidden lg:flex items-center">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="px-2.5 py-1.5 text-sm text-slate-600 hover:text-accent hover:bg-blue-50 rounded-md font-medium transition-all duration-200 whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Search (dashboard only for authenticated users) */}
          {token && user && (
            <div className="flex-1 flex justify-center px-2">
              <div className="relative w-52">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 3a6 6 0 104.472 10.001l3.263 3.264a1 1 0 001.414-1.414l-3.264-3.263A6 6 0 009 3zm-4 6a4 4 0 118 0 4 4 0 01-8 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search problems"
                  className="w-full h-8 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-accent"
                />
              </div>
            </div>
          )}

          {/* Right: Icons + Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {token && user && (
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={openNotifications}
                  className="relative h-8 w-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200"
                  aria-label="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082A23.848 23.848 0 0 0 18 16.25V11a6 6 0 1 0-12 0v5.25c1.095.472 2.152.751 3.143.832m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold inline-flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl p-2">
                    <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                      <p className="text-xs font-semibold text-slate-900">Notifications</p>
                      <p className="text-[11px] text-slate-500">Latest updates from your account</p>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map((item) => (
                        <div key={item.id} className="px-2 py-2 rounded-lg hover:bg-slate-50">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{item.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {token && user && (
              <div className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2 text-amber-700 text-xs font-semibold" aria-label="Daily coding streak">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-500">
                  <path d="M12.001 2.5c.74 2.13.33 3.85-1.23 5.16-1.17.98-1.7 2.33-1.57 4.05 1.53-.47 2.66-1.42 3.4-2.86 2.54 1.87 3.81 4.16 3.81 6.87 0 2.13-.72 3.84-2.15 5.12A7.066 7.066 0 0 1 9.5 22c-1.88 0-3.49-.63-4.82-1.9C3.36 18.83 2.7 17.21 2.7 15.24c0-2.58 1.01-4.8 3.03-6.65C7.35 7.11 8.63 5.74 9.57 4.48c.63-.84 1.44-1.5 2.43-1.98z" />
                </svg>
                {currentStreak}d
              </div>
            )}

            {token && user && (
              <Link href="/store" className="inline-flex px-3 h-8 items-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-all duration-200 whitespace-nowrap">
                {user.coins || 0} coins
              </Link>
            )}

            <Link href="/premium" className="inline-flex px-3 h-8 items-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200 whitespace-nowrap">
              Premium
            </Link>

            {token && user ? (
              <>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={openProfileMenu}
                    className="h-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 font-semibold hover:bg-slate-50"
                    aria-label="User profile menu"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6.75a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a8.966 8.966 0 0 1 14.998 0" />
                    </svg>
                    <span className="hidden md:inline">{user.username}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5">
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="block px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50"
                          onClick={() => setProfileOpen(false)}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        className="mt-1 w-full text-left px-3 py-2 text-xs font-medium text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 h-8 inline-flex items-center text-slate-700 border border-slate-200 hover:border-accent hover:text-accent text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap">
                  Login
                </Link>
                <Link href="/register" className="inline-flex px-3 h-8 items-center bg-accent hover:bg-accent-hover text-white text-xs rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-btn-primary hover:-translate-y-px whitespace-nowrap">
                  Sign Up
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
