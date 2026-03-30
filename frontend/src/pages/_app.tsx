import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/utils/store';
import { useRouter } from 'next/router';
import { getUserAccessState, isFeaturePath } from '@/utils/access';

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const initAuth = useAuthStore((state) => state.init);
  const initialized = useAuthStore((state) => state.initialized);
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!initialized) {
      return;
    }

    if (!isFeaturePath(router.pathname)) {
      return;
    }

    if (!token) {
      const nextPath = `${router.pathname}${router.asPath.includes('?') ? router.asPath.slice(router.pathname.length) : ''}`;
      void router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    const access = getUserAccessState(user);
    if (user?.role !== 'admin' && !access.hasAccess && router.pathname !== '/premium') {
      void router.replace('/premium?reason=trial-expired');
    }
  }, [initialized, token, user, router]);

  return <Component {...pageProps} />;
}

export default App;
