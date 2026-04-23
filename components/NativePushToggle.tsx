'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const SITE_URL = 'https://www.hockeyrefresh.com'

export default function NativePushToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [msg, setMsg]         = useState<string | null>(null)
  const [busy, setBusy]       = useState(false)
  const msgTimer              = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setEnabled(localStorage.getItem('push-enabled') === '1')
  }, [])

  function showMsg(text: string) {
    if (msgTimer.current) clearTimeout(msgTimer.current)
    setMsg(text)
    msgTimer.current = setTimeout(() => setMsg(null), 4000)
  }

  async function toggle() {
    if (busy || enabled === null) return
    setBusy(true)

    try {
      // Must dynamic-import inside native context
      const mod = await import('@capacitor/push-notifications').catch(() => null)
      if (!mod) { showMsg('Push not available'); return }
      const { PushNotifications } = mod

      // ── TURN OFF ──────────────────────────────────────
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
        showMsg('Notifications off')
        return
      }

      // ── TURN ON ───────────────────────────────────────
      const perm = await PushNotifications.checkPermissions()

      if (perm.receive === 'denied') {
        showMsg('Go to Settings → Hockey Refresh → Notifications to enable')
        return
      }

      if (perm.receive !== 'granted') {
        const req = await PushNotifications.requestPermissions()
        if (req.receive !== 'granted') {
          showMsg('Permission not granted')
          return
        }
      }

      // Listen for token — set up listener first, then register
      const token = await new Promise<string>((resolve, reject) => {
        let done = false

        PushNotifications.addListener('registration', (t) => {
          if (done) return
          done = true
          resolve(t.value)
        })

        PushNotifications.addListener('registrationError', (err) => {
          if (done) return
          done = true
          reject(new Error(JSON.stringify(err)))
        })

        setTimeout(() => {
          if (done) return
          done = true
          reject(new Error('Registration timed out'))
        }, 12000)

        PushNotifications.register().catch(reject)
      })

      await fetch(`${SITE_URL}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'ios' }),
      })

      localStorage.setItem('push-token', token)
      localStorage.setItem('push-enabled', '1')
      setEnabled(true)
      showMsg('Notifications on!')

    } catch (err: any) {
      showMsg(err?.message ?? 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  if (enabled === null) return null

  return (
    <div style={{ position: 'relative' }}>
      {msg && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '6px 10px',
          fontSize: 11, fontWeight: 700, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', zIndex: 999,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          {msg}
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
          opacity: busy ? 0.4 : 1,
          transition: 'opacity .15s',
        }}
        aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {enabled
          ? <Bell size={20} color="var(--green)" strokeWidth={1.8} fill="var(--green)" />
          : <BellOff size={20} color="var(--text-secondary)" strokeWidth={1.8} />
        }
      </button>
    </div>
  )
}
