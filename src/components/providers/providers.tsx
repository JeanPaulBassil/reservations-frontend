'use client';

import { HeroUIProvider } from '@heroui/react';
import React from 'react';

import { AuthProvider } from './AuthProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <HeroUIProvider>{children}</HeroUIProvider>
    </AuthProvider>
  );
}
