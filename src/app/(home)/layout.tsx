import type { Metadata } from 'next'
import AppLayout from '../_components/AppLayout'
import { UserProvider } from '../providers/SessionProvider'
import { EntityProvider } from '../contexts/EntityContext'

export const metadata: Metadata = {
  title: 'Reservation',
  description: 'Reservation system',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <UserProvider>
      <EntityProvider>
        <AppLayout>{children}</AppLayout>
      </EntityProvider>
    </UserProvider>
  )
}
