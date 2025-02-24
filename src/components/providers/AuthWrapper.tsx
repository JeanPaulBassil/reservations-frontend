'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from './AuthProvider';

import RootLoading from '@/app/loading';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isInitializing, user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      if (!user && pathname !== '/login') {
        router.replace('/login');
      } else if (user && pathname === '/login') {
        router.replace('/');
      } else {
        setIsReady(true); // Only allow rendering after checking auth
      }
    }
  }, [isInitializing, user, pathname, router]);

  if (isInitializing || !isReady) {
    return <RootLoading />;
  }

  return <>{children}</>;
}
