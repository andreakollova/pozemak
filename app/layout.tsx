import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hockeyrefresh.com'),
  title: {
    default: 'Hockey Refresh – Your Daily Field Hockey Hub',
    template: '%s | Hockey Refresh',
  },
  description: 'Hockey Refresh brings you the latest field hockey news, live scores, results and fixtures from FIH International, FIH Pro League, EuroHockey, and national leagues worldwide.',
  keywords: ['field hockey', 'hockey news', 'FIH Pro League', 'EuroHockey', 'hockey scores', 'hockey fixtures', 'hockey results', 'international hockey'],
  openGraph: {
    type: 'website',
    siteName: 'Hockey Refresh',
    title: 'Hockey Refresh – Your Daily Field Hockey Hub',
    description: 'Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide.',
    url: 'https://www.hockeyrefresh.com',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Hockey Refresh' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hockey Refresh – Your Daily Field Hockey Hub',
    description: 'Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide.',
    images: ['/og-image.png'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://www.hockeyrefresh.com' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — reads localStorage before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pozemak-theme');if(t!=='dark')document.documentElement.classList.add('light-init')}catch(e){}})()`,
          }}
        />
        <link rel="icon" href="/logo-light.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
      </head>
      <body suppressHydrationWarning style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', minHeight: '100vh', overflowX: 'hidden' }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
