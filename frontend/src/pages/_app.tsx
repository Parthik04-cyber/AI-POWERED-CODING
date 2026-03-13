import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/utils/store';

function App({ Component, pageProps }: AppProps) {
  const initAuth = useAuthStore((state) => state.init);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <Component {...pageProps} />;
}

export default App;
