'use client';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import React from 'react';

import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import { AuthProvider } from './AuthProvider';
import { AuthWrapper } from './AuthWrapper';
import { RestaurantProvider } from './RestaurantProvider';
import { SidebarProvider } from './SidebarProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <AuthWrapper>
          <SidebarProvider>
            <RestaurantProvider>
              <HeroUIProvider>
                <ToastProvider />
                {children}
              </HeroUIProvider>
            </RestaurantProvider>
          </SidebarProvider>
        </AuthWrapper>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
