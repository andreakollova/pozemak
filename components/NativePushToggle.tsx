'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const SITE_URL = 'https://www.hockeyrefresh.com'

function getPush() {
  return (window as any)?.Capacitor?.Plugins?.PushNotifications ?? null
}

export default function NativePushToggle({ dark = false }: { dark?: boolean }) {
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
    timer.current = setTimeout(() => setToast(null), 5000)
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
        showToast('Not available — open in app')
        return
      }

      // 1. Check permission
      const permCheck = await Push.checkPermissions()
      const state: string = permCheck?.receive ?? 'prompt'

      if (state === 'denied') {
        showToast('Go to Settings → Hockey Refresh → Notifications')
        return
      }

      if (state !== 'granted') {
        const req = await Push.requestPermissions()
        if (req?.receive !== 'granted') {
          showToast('Permission not granted')
          return
        }
      }

      // 2. If token already stored, reuse it
      const existingToken = localStorage.getItem('push-token')
      if (existingToken) {
        await fetch(`${SITE_URL}/api/push/subscribe-native`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: existingToken, platform: 'ios' }),
        })
        localStorage.setItem('push-enabled', '1')
        setEnabled(true)
        showToast('Notifications on ✓')
        return
      }

      // 3. Register to get a fresh token
      showToast('Step 1: setting up listeners…')

      let resolveToken!: (v: string) => void
      let rejectToken!: (e: Error) => void
      const tokenPromise = new Promise<string>((res, rej) => {
        resolveToken = res
        rejectToken  = rej
      })

      await Push.addListener('registration',      (t: any) => { showToast('Step 3: token OK!'); resolveToken(t.value) })
      await Push.addListener('registrationError', (e: any) => { showToast('Step 3 ERR: ' + JSON.stringify(e)); rejectToken(new Error(JSON.stringify(e))) })

      const timeoutId = setTimeout(() => {
        rejectToken(new Error('Timed out — no APNs response'))
      }, 15000)

      showToast('Step 2: calling register…')
      await Push.register().catch((e: any) => { showToast('register ERR: ' + String(e)); rejectToken(e) })
      const token = await tokenPromise
      clearTimeout(timeoutId)

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
      {toast && (
        <div style={{
          position: 'fixed', top: 130, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999,
          background: '#111', border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 10, padding: '12px 20px',
          fontSize: 13, fontWeight: 700, color: '#fff',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
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
          opacity: busy ? 0.4 : 1,
          transition: 'opacity .15s',
        }}
        aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
      >
        {enabled
          ? <Bell size={20} color={dark ? 'var(--green)' : '#003ad0'} strokeWidth={1.8} fill={dark ? 'var(--green)' : '#003ad0'} />
          : <BellOff size={20} color="var(--text-secondary)" strokeWidth={1.8} />
        }
      </button>
    </>
  )
}
