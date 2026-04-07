'use client'

export const dynamic = 'force-dynamic'

import CountryPage from '@/components/CountryPage'

export default function Page() {
  return (
    <CountryPage config={{
      flag:        '🇦🇷',
      name:        'Argentina',
      domain:      'cahockey.org.ar',
      description: 'Latest news from Argentina',
    }} />
  )
}
