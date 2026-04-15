'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ScrollToTop from '@/components/ScrollToTop'
import BottomNav from '@/components/BottomNav'
import { Analytics } from '@vercel/analytics/react'
import { initCapacitorPush } from '@/lib/capacitor-push'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    // Set native flag when loaded with ?app=1 (from Capacitor server.url)
    if (new URLSearchParams(window.location.search).get('app') === '1') {
      sessionStorage.setItem('hockeyrefresh-native', '1')
    }
    const native = sessionStorage.getItem('hockeyrefresh-native') === '1'
    setIsNative(native)
    if (native) initCapacitorPush()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('pozemak-theme')
    if (saved) {
      setDark(saved === 'dark')
    } else {
      setDark(false)
    }
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
        <meta property="og:title" content="Hockey Refresh – Your Daily Field Hockey Hub" />
        <meta property="og:description" content="Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide." />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Hockey Refresh" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Hockey Refresh – Your Daily Field Hockey Hub" />
        <meta name="twitter:description" content="Latest field hockey news, live scores and fixtures from FIH International, FIH Pro League, EuroHockey and national leagues worldwide." />
        <link rel="icon" href="/logo-light.png" type="image/png" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/logo-dark.png" type="image/png" media="(prefers-color-scheme: dark)" />
        <link rel="apple-touch-icon" href="/logo-light.png" />
      </head>
      <body className={dark ? '' : 'light'} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', minHeight: '100vh', ...(isNative ? { overscrollBehavior: 'none' } : {}) }}>

        {isNative ? (
          /* ── Native app header: logo only, centered, sticky ── */
          <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--navbar-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, paddingTop: 'env(safe-area-inset-top)' }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={dark ? '/logo-dark.png' : '/logo-light.png'} alt="REFRESH" style={{ height: 30, width: 'auto', display: 'block' }} />
            </Link>
          </div>
        ) : (
          /* ── Web: announcement bar + full navbar, sticky ── */
          <div style={{ position: 'sticky', top: 0, zIndex: 100, willChange: 'transform' }}>
            <AnnouncementBar />
            <Navbar dark={dark} onToggle={toggle} />
          </div>
        )}

        {/* Page content — extra bottom padding in native for BottomNav */}
        <div style={isNative ? { paddingBottom: 'calc(68px + env(safe-area-inset-bottom))' } : undefined}>
          {children}
        </div>

        {isNative ? (
          <BottomNav dark={dark} onToggle={toggle} />
        ) : (
          <>
            <Footer />
            <ScrollToTop />
            <CookieBanner />
          </>
        )}

        <Analytics />
      </body>
    </html>
  )
}
