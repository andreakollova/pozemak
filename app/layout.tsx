'use client'

import './globals.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Globe, Sun, Moon } from 'lucide-react'
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
  const [isNative] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('hockeyrefresh-native') === '1'
  })

  const webNavbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isNative) initCapacitorPush()
  }, [isNative])

  // Keep --web-navbar-h in sync so fixed navbar offset is always correct
  useEffect(() => {
    if (isNative || !webNavbarRef.current) return
    const el = webNavbarRef.current
    const update = () => {
      if (window.innerWidth <= 640) {
        document.documentElement.style.setProperty('--web-navbar-h', el.offsetHeight + 'px')
      } else {
        document.documentElement.style.removeProperty('--web-navbar-h')
      }
    }
    const obs = new ResizeObserver(update)
    obs.observe(el)
    window.addEventListener('resize', update)
    update()
    return () => { obs.disconnect(); window.removeEventListener('resize', update) }
  }, [isNative])

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
          /* ── Native app header ── */
          <div style={{ position: 'sticky', top: 0, zIndex: 100, background: '#003ad0' }}>
            {/* Blue status bar area — at least 80px so announcement bar clears time/wifi/battery */}
            <div style={{ height: 'max(47px, calc(env(safe-area-inset-top) + 16px))', background: '#003ad0' }} />
            {/* Announcement bar */}
            <div style={{ paddingTop: 10, marginBottom: 8 }}>
              <AnnouncementBar />
            </div>
            {/* Header: Countries | Logo | Dark/Light */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--navbar-bg)', borderBottom: '1px solid var(--border)' }}>
              <Link href="/countries" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}>
                <Globe size={22} color="var(--text-secondary)" strokeWidth={1.8} />
              </Link>
              <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dark ? '/logo-dark.png' : '/logo-light.png'} alt="REFRESH" style={{ height: 28, width: 'auto', display: 'block' }} />
              </Link>
              <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 44, minHeight: 44 }}>
                {dark ? <Sun size={20} color="var(--text-secondary)" strokeWidth={1.8} /> : <Moon size={20} color="var(--text-secondary)" strokeWidth={1.8} />}
              </button>
            </div>
          </div>
        ) : (
          /* ── Web: announcement bar + full navbar, fixed on mobile ── */
          <div ref={webNavbarRef} className="web-navbar-wrapper" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
            <AnnouncementBar />
            <Navbar dark={dark} onToggle={toggle} />
          </div>
        )}

        {/* Page content — extra bottom padding in native for BottomNav */}
        <div className={!isNative ? 'web-content' : undefined} style={isNative ? { paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' } : undefined}>
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
