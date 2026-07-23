import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Friday - AI Search Engine',
    template: '%s | Friday',
  },
  description: 'Ask anything. Get answers. Friday is an AI-powered search engine.',
  keywords: ['AI', 'Search Engine', 'Perplexity clone', 'Friday', 'Artificial Intelligence', 'Answers'],
  authors: [{ name: 'Friday Team' }],
  creator: 'Friday',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'http://localhost:3000',
    title: 'Friday - AI Search Engine',
    description: 'Ask anything. Get answers. Friday is an AI-powered search engine.',
    siteName: 'Friday',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Friday - AI Search Engine',
    description: 'Ask anything. Get answers. Friday is an AI-powered search engine.',
    creator: '@friday',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

import { AppLayout } from '@/components/AppLayout'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Friday - AI Search Engine',
    description: 'Ask anything. Get answers. Friday is an AI-powered search engine.',
    url: 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'http://localhost:3000/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`} style={{ background: '#000000' }} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground overflow-x-hidden">
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AppLayout>
          {children}
        </AppLayout>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
