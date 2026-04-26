'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, X, Check } from 'lucide-react'

const SITE_URL = 'https://www.hockeyrefresh.com'

const FREQ_OPTIONS = [
  { value: 'all', label: 'All',        desc: 'Every new article',          recommended: true  },
  { value: '3',   label: '3 per day',  desc: 'Max 3 notifications daily',  recommended: false },
  { value: '1',   label: '1 per day',  desc: 'Max 1 notification daily',   recommended: false },
  { value: 'off', label: 'Off',        desc: 'No notifications',           recommended: false },
] as const

type Freq = 'off' | '1' | '3' | 'all'

function getPush() {
  return (window as any)?.Capacitor?.Plugins?.PushNotifications ?? null
}

export default function NativePushToggle({ dark = false }: { dark?: boolean }) {
  const [frequency, setFrequency] = useState<Freq | null>(null)
  const [showModal, setShowModal]  = useState(false)
  const [toast, setToast]          = useState<string | null>(null)
  const [busy, setBusy]            = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setFrequency((localStorage.getItem('push-frequency') as Freq) ?? 'off')
  }, [])

  function showToast(msg: string) {
    if (timer.current) clearTimeout(timer.current)
    setToast(msg)
    timer.current = setTimeout(() => setToast(null), 4000)
  }

  async function getToken(Push: any): Promise<string> {
    const existing = localStorage.getItem('push-token')
    if (existing) return existing

    let resolveToken!: (v: string) => void
    let rejectToken!: (e: Error) => void
    const promise = new Promise<string>((res, rej) => { resolveToken = res; rejectToken = rej })

    await Push.addListener('registration',      (t: any) => resolveToken(t.value))
    await Push.addListener('registrationError', (e: any) => rejectToken(new Error(JSON.stringify(e))))
    setTimeout(() => rejectToken(new Error('Timed out — check APNs')), 15000)
    await Push.register().catch((e: any) => rejectToken(e))
    return promise
  }

  async function handleSelect(value: Freq) {
    setShowModal(false)
    if (value === frequency) return
    setBusy(true)

    try {
      const Push = getPush()

      // ── TURN OFF ────────────────────────────────────────────────
      if (value === 'off') {
        const token = localStorage.getItem('push-token')
        if (token) {
          await fetch(`${SITE_URL}/api/push/unsubscribe-native`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {})
          localStorage.removeItem('push-token')
        }
        localStorage.setItem('push-frequency', 'off')
        setFrequency('off')
        showToast('Notifications off')
        return
      }

      // ── TURN ON / CHANGE FREQ ────────────────────────────────────
      if (!Push) { showToast('Not available — open in app'); return }

      const permCheck = await Push.checkPermissions()
      const state: string = permCheck?.receive ?? 'prompt'

      if (state === 'denied') {
        showToast('Go to Settings → Hockey Refresh → Notifications')
        return
      }
      if (state !== 'granted') {
        const req = await Push.requestPermissions()
        if (req?.receive !== 'granted') { showToast('Permission not granted'); return }
      }

      const token = await getToken(Push)
      const maxPerDay = value === 'all' ? null : parseInt(value)

      await fetch(`${SITE_URL}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'ios', maxPerDay }),
      })

      localStorage.setItem('push-token', token)
      localStorage.setItem('push-frequency', value)
      setFrequency(value)

      const label = value === 'all' ? 'All notifications on ✓' : `${value}/day notifications on ✓`
      showToast(label)

    } catch (e: any) {
      showToast(e?.message ?? 'Error — try again')
    } finally {
      setBusy(false)
    }
  }

  if (frequency === null) return null

  const isOn = frequency !== 'off'
  const bellColor = 'var(--text-secondary)'

  return (
    <>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 130, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: '#111', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10, padding: '12px 20px', fontSize: 13, fontWeight: 700,
          color: '#fff', whiteSpace: 'nowrap', boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}

      {/* Bottom sheet modal */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001,
            background: 'var(--navbar-bg)',
            borderRadius: '20px 20px 0 0',
            paddingBottom: 'calc(90px + env(safe-area-inset-bottom))',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.3)',
          }}>
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'rgba(128,128,128,0.4)',
              margin: '0 auto 20px',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 20px 16px',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                Notifications
              </span>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'rgba(128,128,128,0.15)', border: 'none', cursor: 'pointer',
                  borderRadius: '50%', width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} color="var(--text-secondary)" strokeWidth={2.5} />
              </button>
            </div>

            {/* Options */}
            {FREQ_OPTIONS.map(({ value, label, desc, recommended }) => {
              const selected = frequency === value
              const accentColor = dark ? 'var(--green)' : '#003ad0'
              return (
                <button
                  key={value}
                  onClick={() => handleSelect(value as Freq)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: selected ? accentColor : 'var(--text-primary)' }}>
                        {label}
                      </span>
                      {recommended && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: accentColor,
                          border: `1px solid ${accentColor}`, borderRadius: 4,
                          padding: '1px 5px', letterSpacing: 0.3,
                        }}>
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {desc}
                    </div>
                  </div>
                  {/* Radio dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${selected ? accentColor : 'var(--border)'}`,
                    background: selected ? accentColor : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </button>
              )
            })}

            <div style={{ height: 8 }} />
          </div>
        </>
      )}

      {/* Bell button */}
      <button
        onClick={() => !busy && setShowModal(true)}
        disabled={busy}
        style={{
          background: 'none', border: 'none',
          cursor: busy ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 44, minHeight: 44,
          opacity: busy ? 0.4 : 1,
          transition: 'opacity .15s',
        }}
        aria-label="Notification settings"
      >
        {isOn ? (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color={bellColor} strokeWidth={1.8} />
            <div style={{
              position: 'absolute', bottom: -3, right: -4,
              background: 'var(--navbar-bg)',
              borderRadius: '50%', width: 12, height: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Check size={8} color={bellColor} strokeWidth={3} />
            </div>
          </div>
        ) : (
          <BellOff size={20} color={bellColor} strokeWidth={1.8} />
        )}
      </button>
    </>
  )
}
