'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('pozemak-theme')
    if (saved) setDark(saved === 'dark')
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('pozemak-theme', next ? 'dark' : 'light')
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Hockey Refresh – Your Daily Field Hockey Hub</title>
        <meta name="description" content="Hockey Refresh brings you the latest field hockey news, live scores, results and fixtures from FIH International, FIH Pro League, EuroHockey, and national leagues." />
        <meta name="keywords" content="field hockey, hockey news, FIH Pro League, EuroHockey, hockey scores, hockey fixtures, hockey results, international hockey" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        {/* Open Graph */}
        <meta property="og:title" content="Hockey Refresh – Your Daily Field Hockey Hub" />
        <meta property="og:description" content="Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hockey Refresh" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Hockey Refresh – Your Daily Field Hockey Hub" />
        <meta name="twitter:description" content="Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide." />
        <link rel="icon" href="/logo-light.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
      </head>
      <body className={dark ? '' : 'light'} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        {/* Single sticky wrapper so announcement bar + navbar scroll as one unit */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, willChange: 'transform' }}>
          <AnnouncementBar />
          <Navbar dark={dark} onToggle={toggle} />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  )
}
