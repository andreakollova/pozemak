'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇧🇪',
      name:        'Belgium',
      domain:      'hockey.be',
      description: 'Latest news from Belgium',
    }} />
  )
}
