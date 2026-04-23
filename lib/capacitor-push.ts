/**
 * Capacitor passive notification handlers for iOS native app.
 * Call initCapacitorPush() once on app start (only when isNative is true).
 * Does NOT call register() or requestPermissions() — let NativePushToggle handle that.
 */
export function initCapacitorPush(siteUrl = 'https://www.hockeyrefresh.com') {
  if (typeof window === 'undefined') return

  const Push = (window as any)?.Capacitor?.Plugins?.PushNotifications
  const App  = (window as any)?.Capacitor?.Plugins?.App

  if (!Push) return

  Push.addListener('pushNotificationReceived', () => {
    window.location.reload()
  })

  Push.addListener('pushNotificationActionPerformed', (action: any) => {
    const url = action.notification.data?.url
    if (url) window.location.href = siteUrl + url
    else window.location.reload()
  })

  if (App) {
    App.addListener('appStateChange', ({ isActive }: any) => {
      if (isActive) window.location.reload()
    })
  }
}
