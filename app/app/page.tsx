'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AppEntry() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('hockeyrefresh-native', '1')
    router.replace('/')
  }, [router])

  return null
}
