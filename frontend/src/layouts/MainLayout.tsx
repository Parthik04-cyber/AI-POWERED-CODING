'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const footerLinks = [
  { href: '/about', label: 'Help Center' },
  { href: '/about', label: 'Jobs' },
  { href: '/about', label: 'Bug Bounty' },
  { href: '/about', label: 'Assessments' },
  { href: '/about', label: 'Students' },
  { href: '/about', label: 'Terms' },
  { href: '/about', label: 'Privacy Policy' },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="h-screen text-slate-900 flex flex-col overflow-hidden">
      <Navbar />
      <main className="mt-16 flex-1 overflow-y-auto">{children}</main>
      <footer className="border-t border-slate-200 bg-white text-slate-500 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4 text-xs sm:text-sm">
            <div className="min-w-0 overflow-x-auto">
              <div className="flex items-center whitespace-nowrap">
                {footerLinks.map((item, index) => (
                  <React.Fragment key={item.label}>
                    <Link href={item.href} className="hover:text-slate-700 transition-colors duration-200">
                      {item.label}
                    </Link>
                    <span className="mx-2 text-slate-300" aria-hidden="true">|</span>
                    {index === footerLinks.length - 1 && (
                      <>
                        <span className="mx-2 text-slate-300" aria-hidden="true">|</span>
                        <span className="text-slate-500">© 2026 CodeMaster.</span>
                      </>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm text-white transition-colors duration-200 whitespace-nowrap">
              <span className="h-5 w-5 rounded-full overflow-hidden inline-flex shrink-0 border border-slate-600">
                <svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <rect width="900" height="200" fill="#FF9933"/>
                  <rect y="200" width="900" height="200" fill="#FFFFFF"/>
                  <rect y="400" width="900" height="200" fill="#138808"/>
                  <circle cx="450" cy="300" r="60" fill="none" stroke="#000080" strokeWidth="10"/>
                  <circle cx="450" cy="300" r="8" fill="#000080"/>
                  {Array.from({ length: 24 }).map((_, i) => {
                    const angle = (i * 360) / 24;
                    const rad = (angle * Math.PI) / 180;
                    const x2 = 450 + 58 * Math.sin(rad);
                    const y2 = 300 - 58 * Math.cos(rad);
                    return <line key={i} x1="450" y1="300" x2={x2} y2={y2} stroke="#000080" strokeWidth="4"/>;
                  })}
                </svg>
              </span>
              <span>In India</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
