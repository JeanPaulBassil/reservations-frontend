import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './calendarStyles.scss'
import { NextUIProvider } from '@nextui-org/system'
import ReactQueryClientProvider from '@/providers/ReactQueryProvider'
import LayoutWrapper from './_components/Notifications'
import { ToastProvider } from '@/providers/ToastProvider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { UserProvider } from './providers/SessionProvider'
const inter = Inter({ subsets: ['latin'] })

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
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryClientProvider>
          <NextUIProvider locale="fr-US">
            <LayoutWrapper>
              <ToastProvider>
                {children}
                <SpeedInsights />
              </ToastProvider>
            </LayoutWrapper>
          </NextUIProvider>
        </ReactQueryClientProvider>
      </body>
    </html>
  )
}
