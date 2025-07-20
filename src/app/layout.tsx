import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { getServerLanguage } from '@/lib/server-preferences'

import RootProvider from './provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'My Next Tools',
  description: 'My Next Tools',
  icons: {
    icon: [
      {
        url: '/brand/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/brand/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/brand/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
    apple: [
      {
        url: '/brand/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    other: [
      {
        rel: 'icon',
        url: '/brand/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/brand/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const language = await getServerLanguage()

  return (
    <>
      <html lang={language} suppressHydrationWarning>
        <head />
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <RootProvider initialLanguage={language}>{children}</RootProvider>
        </body>
      </html>
    </>
  )
}
