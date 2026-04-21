'use client'
import { useEffect, useState, useRef } from 'react'

const SCROLL_DURATION = 8000

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

  // Control video playback — play from start when shown, reset when hidden
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (showVideo) {
      vid.currentTime = 0
      vid.play().catch(() => {})
    } else {
      vid.pause()
      vid.currentTime = 0
    }
  }, [showVideo])

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
    { icon: '🏆', text: 'Live scores from top competitions' },
    { icon: '🎥', text: 'Video highlights on demand' },
    { icon: '🎮', text: 'Mini games built into the app' },
    { icon: '🌍', text: 'Coverage from 10+ countries worldwide' },
  ]

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(160deg, #002da8 0%, #003ad0 100%)', padding: '60px 0 70px', overflow: 'hidden' }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: -100, right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(149,255,3,0.07)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(0,82,255,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '40%', left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(149,255,3,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', gap: 80, flexWrap: 'wrap', justifyContent: 'center' }}>

        {/* Left */}
        <div style={{ flex: '1 1 340px', minWidth: 280 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 100, padding: '7px 16px 7px 10px', marginBottom: 24 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: '50%', background: '#95ff03' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.3 }}>Now on App Store</span>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {features.map(({ icon, text }) => (
              <div key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '6px 14px 6px 8px', backdropFilter: 'blur(10px)' }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 600, lineHeight: 1.3 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* App Store button */}
          <a
            href="https://apps.apple.com/hu/app/hockeyrefresh/id6762254165"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#000', color: '#fff', borderRadius: 40, padding: '10px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
        </div>

        {/* Right — iPhone */}
        <div style={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div ref={frameRef} style={{ transition: 'transform .12s ease-out', willChange: 'transform' }}>
            {/* Outer glow ring */}
            <div style={{ padding: 3, borderRadius: 48, background: 'linear-gradient(135deg, rgba(149,255,3,0.3), rgba(255,255,255,0.05))', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
              {/* iPhone 15 Pro frame — 393×852 ratio = 200×434 */}
              <div style={{ width: 200, height: 434, background: '#1c1c1e', borderRadius: 46, overflow: 'hidden', position: 'relative', padding: 9, border: '1px solid #2a2a2a' }}>
                {/* Screen */}
                <div style={{ width: '100%', height: '100%', borderRadius: 37, overflow: 'hidden', background: '#000' }}>
                  <style>{`
                    @keyframes phoneScroll {
                      0%   { object-position: center 0%; }
                      50%  { object-position: center 100%; }
                      100% { object-position: center 0%; }
                    }
                  `}</style>
                  {/* Always render both — crossfade with opacity to avoid black flash */}
                  <img
                    src="/hockeyrefresh.png"
                    alt="HockeyRefresh app"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 0%', display: 'block', animation: showVideo ? 'none' : 'phoneScroll 8s ease-in-out', opacity: showVideo ? 0 : 1, transition: 'opacity 0.4s ease' }}
                  />
                  <video
                    ref={videoRef}
                    src="/hockeyrefresh.mp4"
                    muted playsInline
                    onEnded={onVideoEnded}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: showVideo ? 1 : 0, transition: 'opacity 0.4s ease' }}
                  />
                </div>
                {/* Side button (right) */}
                <div style={{ position: 'absolute', right: -3, top: 106, width: 3, height: 62, background: '#3a3a3a', borderRadius: '0 3px 3px 0' }} />
                {/* Volume (left) */}
                <div style={{ position: 'absolute', left: -3, top: 87, width: 3, height: 34, background: '#3a3a3a', borderRadius: '3px 0 0 3px' }} />
                <div style={{ position: 'absolute', left: -3, top: 131, width: 3, height: 34, background: '#3a3a3a', borderRadius: '3px 0 0 3px' }} />
                {/* Action button (left, replaces mute switch on 15 Pro) */}
                <div style={{ position: 'absolute', left: -3, top: 57, width: 3, height: 19, background: '#3a3a3a', borderRadius: '3px 0 0 3px' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
