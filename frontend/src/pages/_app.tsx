import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/utils/store';

function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const store = useAuthStore();
    store.init();
  }, []);

  return <Component {...pageProps} />;
}

export default App;
