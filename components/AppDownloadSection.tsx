'use client'
import { useEffect, useState, useRef } from 'react'

const SCROLL_DURATION = 3000 // ms before switching to video

export default function AppDownloadSection() {
  const [isNative, setIsNative] = useState(true)
  const [showVideo, setShowVideo] = useState(false)
  const frameRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setIsNative(localStorage.getItem('hockeyrefresh-native') === '1')
  }, [])

  // Alternate: 8s PNG scroll → video → repeat
  useEffect(() => {
    if (isNative) return
    timerRef.current = setTimeout(() => setShowVideo(true), SCROLL_DURATION)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isNative])

  const onVideoEnded = () => {
    setShowVideo(false)
    timerRef.current = setTimeout(() => setShowVideo(true), 3000)
  }

  // 3D tilt effect
  useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2)
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2)
      el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
    }
    const onLeave = () => { el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)' }
    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [isNative])

  if (isNative) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #002da8 0%, #003ad0 50%, #0047ff 100%)', padding: '80px 0 90px', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Left — text */}
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 20, padding: '4px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#ffffff', textTransform: 'uppercase', marginBottom: 20 }}>
            Now on App Store
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#ffffff', margin: '0 0 16px', lineHeight: 1.1, letterSpacing: '-1px' }}>
            Field hockey <span style={{ color: '#95ff03' }}>in your pocket</span>
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 32px', maxWidth: 420 }}>
            Get the latest field hockey news, live scores and match highlights — all in one app. Never miss a goal.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 40 }}>
            {[
              { icon: '🔔', text: 'Push notifications for breaking news' },
              { icon: '🏆', text: 'Live scores from FIH, EuroHockey & national leagues' },
              { icon: '🎥', text: 'Video highlights from Hoofdklasse & FIH' },
              { icon: '🎮', text: 'Mini games built right into the app' },
              { icon: '🌍', text: 'Coverage from 10+ countries worldwide' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20, width: 32, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* App Store button */}
          <a
            href="https://apps.apple.com/hu/app/hockeyrefresh/id6762254165"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#ffffff', color: '#000000', borderRadius: 14, padding: '12px 24px', textDecoration: 'none', fontWeight: 700, fontSize: 15, transition: 'transform .15s, box-shadow .15s', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)' }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Download on the App Store
          </a>
        </div>

        {/* Right — iPhone mockup */}
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
          <div
            ref={frameRef}
            style={{ transition: 'transform .1s ease-out', willChange: 'transform' }}
          >
            {/* iPhone frame */}
            <div style={{
              width: 220, height: 440,
              background: '#1a1a1a',
              borderRadius: 38,
              boxShadow: '0 0 0 2px #1a3a8f, 0 0 0 4px #001a6e, 0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(255,255,255,0.1)',
              position: 'relative',
              overflow: 'hidden',
              padding: 8,
            }}>
              {/* Dynamic Island */}
              <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 80, height: 26, background: '#000', borderRadius: 20, zIndex: 10 }} />
              {/* Screen */}
              <div style={{ width: '100%', height: '100%', borderRadius: 30, overflow: 'hidden', background: '#000' }}>
                <style>{`
                  @keyframes phoneScroll {
                    0%   { transform: translateY(0); }
                    50%  { transform: translateY(-30%); }
                    100% { transform: translateY(0); }
                  }
                `}</style>
                {showVideo ? (
                  <video
                    ref={videoRef}
                    src="/hockeyrefresh.mp4"
                    autoPlay
                    muted
                    playsInline
                    onEnded={onVideoEnded}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <img
                    src="/hockeyrefresh.png"
                    alt="HockeyRefresh app"
                    style={{ width: '100%', height: 'auto', display: 'block', animation: 'phoneScroll 3s ease-in-out' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).src = '/logo-dark.png'; (e.currentTarget as HTMLImageElement).style.height = '100%'; (e.currentTarget as HTMLImageElement).style.objectFit = 'contain'; (e.currentTarget as HTMLImageElement).style.padding = '40px' }}
                  />
                )}
              </div>
              {/* Side button */}
              <div style={{ position: 'absolute', right: -3, top: 80, width: 3, height: 60, background: '#2a2a2a', borderRadius: '0 3px 3px 0' }} />
              {/* Volume buttons */}
              <div style={{ position: 'absolute', left: -3, top: 70, width: 3, height: 36, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
              <div style={{ position: 'absolute', left: -3, top: 116, width: 3, height: 36, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
