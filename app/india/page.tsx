'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇮🇳',
      name:        'India',
      domain:      'hockeyindia.org',
      description: 'Latest news from India',
    }} />
  )
}
