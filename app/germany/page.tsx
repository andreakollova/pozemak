'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇩🇪',
      name:        'Germany',
      domain:      'hockey.de',
      description: 'Latest news from Germany',
    }} />
  )
}
