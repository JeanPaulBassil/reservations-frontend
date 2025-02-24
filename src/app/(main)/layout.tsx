import { Metadata } from 'next';

import AppWrapper from '@/components/sidebar';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your app and view your dashboard',
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppWrapper />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
