'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const CompanyRedirectPage = () => {
  const router = useRouter();
  const companyName = typeof router.query.companyName === 'string' ? router.query.companyName : '';

  useEffect(() => {
    if (!router.isReady || !companyName) {
      return;
    }

    router.replace(`/interview/company?company=${encodeURIComponent(companyName)}`);
  }, [companyName, router]);

  return null;
};

export default CompanyRedirectPage;
