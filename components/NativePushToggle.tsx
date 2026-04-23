'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

const SITE_URL = 'https://www.hockeyrefresh.com'

export default function NativePushToggle() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setEnabled(localStorage.getItem('push-enabled') === '1')
  }, [])

  async function toggle() {
    if (busy) return
    setBusy(true)

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')

      if (enabled) {
        // Turn OFF — remove from DB
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
        return
      }

      // Turn ON — request permission then register
      const perm = await PushNotifications.checkPermissions()

      if (perm.receive === 'denied') {
        alert('Notifications are blocked. Go to iPhone Settings → Hockey Refresh → Notifications and turn them on.')
        return
      }

      if (perm.receive !== 'granted') {
        const result = await PushNotifications.requestPermissions()
        if (result.receive !== 'granted') return
      }

      // Remove old listeners to avoid duplicates
      await PushNotifications.removeAllListeners()

      // Set up listener BEFORE calling register
      const tokenPromise = new Promise<string>((resolve, reject) => {
        PushNotifications.addListener('registration', (token) => resolve(token.value))
        PushNotifications.addListener('registrationError', (err) => reject(err))
        setTimeout(() => reject(new Error('timeout')), 10000)
      })

      await PushNotifications.register()

      const token = await tokenPromise

      await fetch(`${SITE_URL}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, platform: 'ios' }),
      })

      localStorage.setItem('push-token', token)
      localStorage.setItem('push-enabled', '1')
      setEnabled(true)

    } catch (e: any) {
      console.error('Push toggle error:', e?.message || e)
    } finally {
      setBusy(false)
    }
  }

  if (enabled === null) return null

  return (
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
  )
}
