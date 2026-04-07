'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇮🇪',
      name:        'Ireland',
      domain:      'hockey.ie',
      description: 'Latest news from Ireland',
    }} />
  )
}
