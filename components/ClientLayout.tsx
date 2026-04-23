'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Globe, Sun, Moon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import AnnouncementBar from '@/components/AnnouncementBar'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import ScrollToTop from '@/components/ScrollToTop'
import BottomNav from '@/components/BottomNav'
import NativeFooter from '@/components/NativeFooter'
import { Analytics } from '@vercel/analytics/react'
import { initCapacitorPush } from '@/lib/capacitor-push'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false)
  const [isNative] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('hockeyrefresh-native') === '1'
  })
  const [nativeHeaderH, setNativeHeaderH] = useState(0)

  const webNavbarRef = useRef<HTMLDivElement>(null)
  const nativeHeaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isNative) initCapacitorPush()
  }, [isNative])

  useEffect(() => {
    if (!isNative || !nativeHeaderRef.current) return
    const el = nativeHeaderRef.current
    const update = () => setNativeHeaderH(el.offsetHeight)
    const obs = new ResizeObserver(update)
    obs.observe(el)
    update()
    return () => obs.disconnect()
  }, [isNative])

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
    setDark(saved === 'dark')
  }, [])

  useEffect(() => {
    if (dark) {
      document.body.classList.remove('light')
      document.documentElement.classList.remove('light')
    } else {
      document.body.classList.add('light')
      document.documentElement.classList.add('light')
    }
  }, [dark])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('pozemak-theme', next ? 'dark' : 'light')
  }

  return (
    <div style={{ overflowX: 'clip', width: '100%', maxWidth: '100%', position: 'relative' }}>
      {isNative ? (
        <div ref={nativeHeaderRef} style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: '#003ad0' }}>
          <div style={{ height: 'max(47px, calc(env(safe-area-inset-top) + 16px))', background: '#003ad0' }} />
          <div style={{ paddingTop: 10, marginBottom: 8 }}>
            <AnnouncementBar />
          </div>
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
        <div ref={webNavbarRef} className="web-navbar-wrapper" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          <AnnouncementBar />
          <Navbar dark={dark} onToggle={toggle} />
        </div>
      )}

      <div className={!isNative ? 'web-content' : undefined} style={isNative ? { paddingTop: nativeHeaderH || 120, paddingBottom: 'calc(90px + env(safe-area-inset-bottom))' } : undefined}>
        {children}
        {isNative && <NativeFooter />}
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
    </div>
  )
}
