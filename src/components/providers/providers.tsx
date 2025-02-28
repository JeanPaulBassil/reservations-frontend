'use client';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import React from 'react';

import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { AuthProvider } from './AuthProvider';
import { AuthWrapper } from './AuthWrapper';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <AuthWrapper>
          <HeroUIProvider>
            <ToastProvider />
            {children}
          </HeroUIProvider>
        </AuthWrapper>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
