/**
 * Capacitor push notification setup for iOS native app.
 * Call initCapacitorPush() once on app start (only when isNative is true).
 */
export async function initCapacitorPush(siteUrl = 'https://www.hockeyrefresh.com') {
  if (typeof window === 'undefined') return

  try {
    const { PushNotifications } = await import('@capacitor/push-notifications')

    // Request permission
    const perm = await PushNotifications.requestPermissions()
    if (perm.receive !== 'granted') return

    // Register with APNs
    await PushNotifications.register()

    // Send token to our backend
    PushNotifications.addListener('registration', async (token) => {
      await fetch(`${siteUrl}/api/push/subscribe-native`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.value, platform: 'ios' }),
      }).catch(console.error)
    })

    // Handle notification tap — navigate to article
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      const url = action.notification.data?.url
      if (url) window.location.href = url
    })
  } catch (e) {
    console.error('Capacitor push init failed:', e)
  }
}
