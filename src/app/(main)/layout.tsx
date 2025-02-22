import AppWrapper from '@/components/sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppWrapper />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
