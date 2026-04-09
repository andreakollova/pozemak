'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)

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
        <title>Pozemak – Field Hockey</title>
        <meta name="description" content="Latest news from the world of field hockey" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="/logo-light.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
      </head>
      <body className={dark ? '' : 'light'} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        {/* Single sticky wrapper so announcement bar + navbar scroll as one unit */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <AnnouncementBar />
          <Navbar dark={dark} onToggle={toggle} />
        </div>
        {children}
        <Footer />
      </body>
    </html>
  )
}
