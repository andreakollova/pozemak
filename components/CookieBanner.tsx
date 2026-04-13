'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type ConsentState = {
  analytics: boolean
  marketing: boolean
}

const CONSENT_KEY = 'cookie-consent-v1'

export default function CookieBanner() {
  const [visible, setVisible]     = useState(false)
  const [expanded, setExpanded]   = useState(false)
  const [consent, setConsent]     = useState<ConsentState>({ analytics: false, marketing: false })

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (!saved) setVisible(true)
  }, [])

  function saveConsent(state: ConsentState) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...state, timestamp: Date.now() }))
    setVisible(false)
  }

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true })
  }

  function rejectAll() {
    saveConsent({ analytics: false, marketing: false })
  }

  function saveCustom() {
    saveConsent(consent)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0d0d0d', borderTop: '1px solid rgba(255,255,255,0.1)',
      padding: expanded ? '28px 24px' : '20px 24px',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {!expanded ? (
          /* ── Compact banner ── */
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: 0, maxWidth: 640 }}>
              We use cookies to improve your experience and analyse site traffic. By clicking{' '}
              <strong style={{ color: '#fff' }}>Accept all</strong>, you consent to our use of cookies.{' '}
              <Link href="/cookies" style={{ color: '#95ff03', textDecoration: 'none', fontWeight: 600 }}>Cookie Policy</Link>
            </p>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
              <button onClick={() => setExpanded(true)}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#95ff03'; e.currentTarget.style.color = '#95ff03' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >
                Manage preferences
              </button>
              <button onClick={rejectAll}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, cursor: 'pointer', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
              >
                Reject all
              </button>
              <button onClick={acceptAll}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#95ff03', color: '#000', fontSize: 12, fontWeight: 800, letterSpacing: 0.5, cursor: 'pointer', transition: 'opacity .15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Accept all
              </button>
            </div>
          </div>
        ) : (
          /* ── Expanded preferences ── */
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>Cookie preferences</h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
                  Choose which cookies you allow. Essential cookies are always active.{' '}
                  <Link href="/cookies" style={{ color: '#95ff03', textDecoration: 'none' }}>Learn more</Link>
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>

              {/* Essential — always on */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Essential cookies</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Required for the site to work (theme preference, session). Cannot be disabled.</p>
                </div>
                <div style={{ flexShrink: 0, padding: '4px 12px', borderRadius: 20, background: 'rgba(149,255,3,0.15)', color: '#95ff03', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
                  Always on
                </div>
              </div>

              {/* Analytics */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Analytics cookies</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Help us understand how visitors use the site (page views, traffic sources).</p>
                </div>
                <button
                  onClick={() => setConsent(c => ({ ...c, analytics: !c.analytics }))}
                  style={{
                    flexShrink: 0, width: 48, height: 26, borderRadius: 13,
                    background: consent.analytics ? '#95ff03' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s',
                  }}
                  aria-label="Toggle analytics cookies"
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: consent.analytics ? 24 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    background: consent.analytics ? '#000' : '#fff',
                    transition: 'left .2s',
                  }} />
                </button>
              </div>

              {/* Marketing */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>Marketing cookies</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: 0 }}>Used to show relevant content and measure the effectiveness of our social channels.</p>
                </div>
                <button
                  onClick={() => setConsent(c => ({ ...c, marketing: !c.marketing }))}
                  style={{
                    flexShrink: 0, width: 48, height: 26, borderRadius: 13,
                    background: consent.marketing ? '#95ff03' : 'rgba(255,255,255,0.15)',
                    border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s',
                  }}
                  aria-label="Toggle marketing cookies"
                >
                  <span style={{
                    position: 'absolute', top: 3,
                    left: consent.marketing ? 24 : 3,
                    width: 20, height: 20, borderRadius: '50%',
                    background: consent.marketing ? '#000' : '#fff',
                    transition: 'left .2s',
                  }} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={rejectAll}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Reject all
              </button>
              <button onClick={saveCustom}
                style={{ padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Save preferences
              </button>
              <button onClick={acceptAll}
                style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#95ff03', color: '#000', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
              >
                Accept all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
