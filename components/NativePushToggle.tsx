'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function NativePushToggle({ siteUrl = 'https://www.hockeyrefresh.com' }: { siteUrl?: string }) {
  const [status, setStatus] = useState<'unknown' | 'on' | 'off'>('unknown')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Read persisted state
    const saved = localStorage.getItem('push-enabled')
    setStatus(saved === '1' ? 'on' : 'off')
  }, [])

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications')

      if (status === 'on') {
        // Unsubscribe: remove token from DB
        const token = localStorage.getItem('push-token')
        if (token) {
          await fetch(`${siteUrl}/api/push/unsubscribe-native`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          }).catch(() => {})
        }
        localStorage.setItem('push-enabled', '0')
        setStatus('off')
        return
      }

      // Subscribe
      const perm = await PushNotifications.requestPermissions()
      if (perm.receive !== 'granted') {
        // Denied — open app settings
        const { App } = await import('@capacitor/app')
        // Can't open settings directly, just inform
        alert('Please enable notifications in your iPhone Settings → Hockey Refresh.')
        setBusy(false)
        return
      }

      await PushNotifications.removeAllListeners()
      await PushNotifications.register()

      await new Promise<void>((resolve) => {
        PushNotifications.addListener('registration', async (token) => {
          localStorage.setItem('push-token', token.value)
          await fetch(`${siteUrl}/api/push/subscribe-native`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: token.value, platform: 'ios' }),
          }).catch(console.error)
          localStorage.setItem('push-enabled', '1')
          setStatus('on')
          resolve()
        })
        // Timeout fallback
        setTimeout(resolve, 8000)
      })

      PushNotifications.addListener('registrationError', (err) => {
        console.error('APNs registration error:', err)
      })

    } catch (e) {
      console.error('Push toggle error:', e)
    } finally {
      setBusy(false)
    }
  }

  if (status === 'unknown') return null

  return (
    <button
      onClick={toggle}
      disabled={busy}
      style={{
        background: 'none', border: 'none', cursor: busy ? 'default' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 44, minHeight: 44, opacity: busy ? 0.5 : 1,
        transition: 'opacity .15s',
      }}
      aria-label={status === 'on' ? 'Disable notifications' : 'Enable notifications'}
    >
      {status === 'on'
        ? <Bell size={20} color="var(--green)" strokeWidth={1.8} fill="var(--green)" />
        : <BellOff size={20} color="var(--text-secondary)" strokeWidth={1.8} />
      }
    </button>
  )
}
