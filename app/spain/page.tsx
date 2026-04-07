'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇪🇸',
      name:        'Spain',
      domain:      'eshockey.es',
      description: 'Latest news from Spain',
    }} />
  )
}
