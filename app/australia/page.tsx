'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇦🇺',
      name:        'Australia',
      domain:      'hockey.org.au',
      description: 'Latest news from Australia',
    }} />
  )
}
