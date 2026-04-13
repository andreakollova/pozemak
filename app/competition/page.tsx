'use client'

import { useState, useEffect } from 'react'
import {
  ComingUpCarousel, FIHCombinedCarousel, EuroHockeyCarousel, NLLeagueCarousel,
  getMatches, getRecentResults, getUpcomingMatches,
  type FIHData, type ProLeagueData, type EuroData, type WCData, type MatchData,
} from '@/components/MatchCarousels'

export default function CompetitionPage() {
  const [fihData,       setFihData]       = useState<FIHData | null>(null)
  const [proLeagueData, setProLeagueData] = useState<ProLeagueData | null>(null)
  const [euroData,      setEuroData]      = useState<EuroData | null>(null)
  const [wcData,        setWcData]        = useState<WCData | null>(null)
  const [nlMen,         setNlMen]         = useState<MatchData | null>(null)
  const [nlWomen,       setNlWomen]       = useState<MatchData | null>(null)

  useEffect(() => {
    fetch('/api/fih').then(r => r.ok ? r.json() : null).then(d => { if (d) setFihData(d) }).catch(() => {})
    fetch('/api/fih-pro-league').then(r => r.ok ? r.json() : null).then(d => { if (d) setProLeagueData(d) }).catch(() => {})
    fetch('/api/eurohockey').then(r => r.ok ? r.json() : null).then(d => { if (d) setEuroData(d) }).catch(() => {})
    fetch('/api/fih-worldcup').then(r => r.ok ? r.json() : null).then(d => { if (d) setWcData(d) }).catch(() => {})
    fetch('/api/hockey?comp=national&id=1').then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setNlMen({ name: d.name, results: getRecentResults(m, 20), upcoming: getUpcomingMatches(m, 20), gender: 'men' }) }).catch(() => {})
    fetch('/api/hockey?comp=national&id=2').then(r => r.ok ? r.json() : null)
      .then(d => { if (!d) return; const m = getMatches(d); setNlWomen({ name: d.name, results: getRecentResults(m, 20), upcoming: getUpcomingMatches(m, 20), gender: 'women' }) }).catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>Matches</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          Match results, standings and schedule from the world of field hockey.
        </p>
      </div>

      <ComingUpCarousel fihData={fihData} proLeagueData={proLeagueData} euroData={euroData} />
      <FIHCombinedCarousel fihData={fihData} proLeagueData={proLeagueData} wcData={wcData} />
      <EuroHockeyCarousel data={euroData} />
      <NLLeagueCarousel menData={nlMen} womenData={nlWomen} />
    </div>
  )
}
