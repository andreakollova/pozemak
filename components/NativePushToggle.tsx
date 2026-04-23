'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const SITE_URL = 'https://www.hockeyrefresh.com'

/** Access Capacitor plugin via native bridge — works in live-URL Capacitor apps */
function getPush() {
  return (window as any)?.Capacitor?.Plugins?.PushNotifications ?? null
}

export default function NativePushToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [toast, setToast]     = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)
  const timer                 = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setEnabled(localStorage.getItem('push-enabled') === '1')
  }, [])

  function showToast(msg: string) {
    if (timer.current) clearTimeout(timer.current)
    setToast(msg)
    timer.current = setTimeout(() => setToast(null), 4000)
  }

  async function registerAndStore(): Promise<string> {
    const Push = getPush()
    if (!Push) throw new Error('Push plugin not available')

    return new Promise((resolve, reject) => {
      let done = false

      const onToken = (token: any) => {
        if (done) return
        done = true
        resolve(token.value)
      }
      const onError = (err: any) => {
        if (done) return
        done = true
        reject(new Error(JSON.stringify(err)))
      }

      Push.addListener('registration', onToken)
      Push.addListener('registrationError', onError)
      setTimeout(() => {
        if (done) return
        done = true
        reject(new Error('Timeout — check APNs setup'))
      }, 12000)

      Push.register().catch(onError)
    })
  }

  async function toggle() {
    if (busy || enabled === null) return
    setBusy(true)

    try {
      const Push = getPush()

      // ── TURN OFF ──────────────────────────────────────────────────────
      if (enabled) {
        const token = localStorage.getItem('push-token')
        if (token) {
          await fetch(`${SITE_URL}/api/push/unsubscribe-native`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {})
          localStorage.removeItem('push-token')
        }
        localStorage.setItem('push-enabled', '0')
        setEnabled(false)
        showToast('Notifications turned off')
        return
      }

      // ── TURN ON ───────────────────────────────────────────────────────
      if (!Push) {
        showToast('Not available (open in app)')
        return
      }

      // Check / request permission
      const permCheck = await Push.checkPermissions()
      const state: string = permCheck?.receive ?? 'prompt'

      if (state === 'denied') {
        showToast('Go to iPhone Settings → Hockey Refresh → Notifications')
        return
      }

      if (state !== 'granted') {
        const req = await Push.requestPermissions()
        if (req?.receive !== 'granted') {
          showToast('Permission not granted')
          return
        }
      }

      // If initCapacitorPush already registered on app start, token is in localStorage
      let token = localStorage.getItem('push-token')

      if (!token) {
        showToast('Registering…')
        token = await registerAndStore()
      }

      await fetch(`${SITE_URL}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'ios' }),
      })

      localStorage.setItem('push-token', token)
      localStorage.setItem('push-enabled', '1')
      setEnabled(true)
      showToast('Notifications on ✓')

    } catch (e: any) {
      showToast(e?.message ?? 'Error — try again')
    } finally {
      setBusy(false)
    }
  }

  if (enabled === null) return null

  return (
    <>
      {/* Toast — fixed at top-center, above everything, outside header flow */}
      {toast && (
        <div style={{
          position: 'fixed', top: 120, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 8, padding: '10px 18px',
          fontSize: 13, fontWeight: 700, color: '#fff',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }}>
          {toast}
        </div>
      )}

      <button
        onClick={toggle}
        disabled={busy}
        style={{
          background: 'none', border: 'none',
          cursor: busy ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 44, minHeight: 44,
          opacity: busy ? 0.35 : 1,
          transition: 'opacity .15s',
        }}
        aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {enabled
          ? <Bell    size={20} color="var(--green)"          strokeWidth={1.8} fill="var(--green)" />
          : <BellOff size={20} color="var(--text-secondary)" strokeWidth={1.8} />
        }
      </button>
    </>
  )
}
