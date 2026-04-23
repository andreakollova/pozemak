/**
 * Capacitor push notification setup for iOS native app.
 * Call initCapacitorPush() once on app start (only when isNative is true).
 */
export async function initCapacitorPush(siteUrl = 'https://www.hockeyrefresh.com') {
  if (typeof window === 'undefined') return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const { App } = await import('@capacitor/app')

    // Request permission
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return

    // Register with APNs
    await PushNotifications.register()

    // Send token to our backend
    PushNotifications.addListener('registration', async (token) => {
      localStorage.setItem('push-token', token.value)
      localStorage.setItem('push-enabled', '1')
      await fetch(`${siteUrl}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value, platform: 'ios' }),
      }).catch(console.error)
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('APNs registration error:', JSON.stringify(err))
    })

    // Notification received while app is open — reload to show new content
    PushNotifications.addListener('pushNotificationReceived', () => {
      window.location.reload()
    })

    // Handle notification tap — navigate to article
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url
      if (url) window.location.href = siteUrl + url
      else window.location.reload()
    })

    // Reload when app comes back to foreground so content is always fresh
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) window.location.reload()
    })
  } catch (e) {
    console.error('Capacitor push init failed:', e)
  }
}
