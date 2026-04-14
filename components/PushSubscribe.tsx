'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'

export default function PushSubscribe() {
  const [state, setState] = useState<'loading' | 'unsupported' | 'subscribed' | 'unsubscribed'>('loading')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const sub = await reg.pushManager.getSubscription()
      setState(sub ? 'subscribed' : 'unsubscribed')
    })
  }, [])

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    })
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub),
    })
    setState('subscribed')
  }

  async function unsubscribe() {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      })
      await sub.unsubscribe()
    }
    setState('unsubscribed')
  }

  if (state === 'loading' || state === 'unsupported') return null

  const subscribed = state === 'subscribed'

  return (
    <button
      onClick={subscribed ? unsubscribe : subscribe}
      title={subscribed ? 'Turn off notifications' : 'Get notified of new articles'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: subscribed ? 'rgba(149,255,3,0.12)' : 'rgba(255,255,255,0.07)',
        border: `1px solid ${subscribed ? '#95ff03' : 'rgba(255,255,255,0.15)'}`,
        borderRadius: 4, padding: '6px 14px',
        fontSize: 12, fontWeight: 700,
        color: subscribed ? '#95ff03' : 'rgba(255,255,255,0.7)',
        cursor: 'pointer', transition: 'all .2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
    >
      {subscribed ? <BellOff size={13} /> : <Bell size={13} />}
      {subscribed ? 'Notifications on' : 'Notify me'}
    </button>
  )
}
