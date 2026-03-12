'use client';

import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <main className="mt-16">{children}</main>
    </div>
  );
};

export default Layout;
