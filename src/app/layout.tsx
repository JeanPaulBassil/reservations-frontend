import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: 'KLYO ASO | %s',
    default: 'KLYO ASO',
  },
  description: 'KLYO ASO | App Store Optimization Platform',
  metadataBase: new URL('https://klyoaso.com'),
  keywords: [
    'ASO',
    'App Store Optimization',
    'Mobile Growth',
    'App Marketing',
    'Keyword Optimization',
    'KLYO',
  ],
  openGraph: {
    title: 'KLYO ASO',
    description: "Optimize your app's performance with AI-driven ASO insights.",
    url: 'https://klyoaso.com',
    siteName: 'KLYO ASO',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KLYO ASO Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://klyoaso.com',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: {
      url: '/apple-touch-icon.png',
      type: 'image/png',
    },
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
