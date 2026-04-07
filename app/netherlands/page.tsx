'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇳🇱',
      name:        'Netherlands',
      domain:      'hockey.nl',
      description: 'Latest news from Netherlands',
    }} />
  )
}
