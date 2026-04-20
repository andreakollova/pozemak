'use client'
import { useEffect, useState, useRef } from 'react'

const SCROLL_DURATION = 5000

export default function AppDownloadSection() {
  const [isNative, setIsNative] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsNative(localStorage.getItem('hockeyrefresh-native') === '1')
  }, [])

  useEffect(() => {
    if (isNative) return
    timerRef.current = setTimeout(() => setShowVideo(true), SCROLL_DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isNative])

  const onVideoEnded = () => {
    setShowVideo(false)
    timerRef.current = setTimeout(() => setShowVideo(true), SCROLL_DURATION)
  }

  // 3D tilt
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`
    }
    const onLeave = () => { el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [isNative])

  if (isNative) return null

  const features = [
    { icon: '🔔', text: 'Breaking news push notifications' },
    { icon: '🏆', text: 'Live scores — FIH, EuroHockey & national leagues' },
    { icon: '🎥', text: 'Video highlights from Hoofdklasse & FIH' },
    { icon: '🎮', text: 'Mini games built right into the app' },
    { icon: '🌍', text: 'Coverage from 10+ countries worldwide' },
  ]

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(135deg, #000d3d 0%, #002da8 50%, #003ad0 100%)', padding: '60px 0 70px', overflow: 'hidden' }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: -100, right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(149,255,3,0.07)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,82,255,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(149,255,3,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Left */}
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(149,255,3,0.12)', border: '1px solid rgba(149,255,3,0.3)', borderRadius: 100, padding: '5px 14px', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#95ff03', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#95ff03', textTransform: 'uppercase' }}>Now on App Store</span>
          </div>

          {/* Headline */}
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#ffffff', margin: '0 0 4px', lineHeight: 1.05, letterSpacing: '-1px' }}>
            Field hockey
          </h2>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 900, color: '#95ff03', margin: '0 0 16px', lineHeight: 1.05, letterSpacing: '-1px' }}>
            in your pocket.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: '0 0 28px', maxWidth: 400 }}>
            The only app you need for international and national field hockey — news, scores, highlights and more.
          </p>

          {/* Features — 2 per row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 36 }}>
            {features.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '11px 13px', backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.3 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* App Store button */}
          <a
            href="https://apps.apple.com/hu/app/hockeyrefresh/id6762254165"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#95ff03', color: '#000000', borderRadius: 16, padding: '14px 26px', textDecoration: 'none', fontWeight: 800, fontSize: 15, boxShadow: '0 8px 32px rgba(149,255,3,0.25)', transition: 'transform .15s, box-shadow .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 48px rgba(149,255,3,0.35)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(149,255,3,0.25)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Download on the App Store
          </a>
        </div>

        {/* Right — iPhone */}
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div ref={frameRef} style={{ transition: 'transform .12s ease-out', willChange: 'transform' }}>
            {/* Outer glow ring */}
            <div style={{ padding: 3, borderRadius: 48, background: 'linear-gradient(135deg, rgba(149,255,3,0.3), rgba(255,255,255,0.05))', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
              {/* iPhone 15 Pro frame — 393×852 ratio ≈ 1:2.17 */}
              <div style={{ width: 220, height: 476, background: '#1c1c1e', borderRadius: 50, overflow: 'hidden', position: 'relative', padding: 10, border: '1px solid #2a2a2a' }}>
                {/* Dynamic Island */}
                <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', width: 90, height: 30, background: '#000', borderRadius: 20, zIndex: 10 }} />
                {/* Screen */}
                <div style={{ width: '100%', height: '100%', borderRadius: 40, overflow: 'hidden', background: '#000' }}>
                  <style>{`
                    @keyframes phoneScroll {
                      0%   { object-position: center 0%; }
                      50%  { object-position: center 100%; }
                      100% { object-position: center 0%; }
                    }
                  `}</style>
                  {showVideo ? (
                    <video
                      ref={videoRef}
                      src="/hockeyrefresh.mp4"
                      autoPlay muted playsInline
                      onEnded={onVideoEnded}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <img
                      src="/hockeyrefresh.png"
                      alt="HockeyRefresh app"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 0%', display: 'block', animation: 'phoneScroll 5s ease-in-out' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.objectFit = 'contain'; (e.currentTarget as HTMLImageElement).style.padding = '40px' }}
                    />
                  )}
                </div>
                {/* Side button (right) */}
                <div style={{ position: 'absolute', right: -3, top: 110, width: 3, height: 64, background: '#333', borderRadius: '0 3px 3px 0' }} />
                {/* Volume (left) */}
                <div style={{ position: 'absolute', left: -3, top: 90, width: 3, height: 36, background: '#333', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: -3, top: 136, width: 3, height: 36, background: '#333', borderRadius: '3px 0 0 3px' }} />
                {/* Mute switch */}
                <div style={{ position: 'absolute', left: -3, top: 60, width: 3, height: 20, background: '#333', borderRadius: '3px 0 0 3px' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
