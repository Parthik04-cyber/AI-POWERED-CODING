'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

// /admin redirects to /admin/dashboard
const AdminIndex: React.FC = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);
  return null;
};

export default AdminIndex;

