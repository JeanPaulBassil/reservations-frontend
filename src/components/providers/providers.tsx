'use client';

import { HeroUIProvider } from '@heroui/react';
import React from 'react';

import { AuthProvider } from './AuthProvider';
import { AuthWrapper } from './AuthWrapper';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <HeroUIProvider>{children}</HeroUIProvider>
      </AuthWrapper>
    </AuthProvider>
  );
}
