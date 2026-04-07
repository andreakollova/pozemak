'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      name:        'Scottish Hockey',
      domain:      'scottish-hockey',
      description: 'Latest news from Scottish Hockey',
    }} />
  )
}
