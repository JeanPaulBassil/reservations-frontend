import type { Metadata } from 'next'
import AppLayout from '../_components/AppLayout'
import { UserProvider } from '../providers/SessionProvider'

export const metadata: Metadata = {
  title: 'Reservation',
  description: 'Reservation system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <UserProvider><AppLayout>{children}</AppLayout></UserProvider>
}
