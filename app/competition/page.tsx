'use client'

import { useState, useEffect } from 'react'
import type { CompetitionData, Standing, Match, Poule } from '@/lib/hockey-api'

// ── Competition config ─────────────────────────────────────────────────────────

const LEAGUES = [
  { key: 'men',     label: '🇳🇱 Men',       flag: '🏑', comp: 'national',      id: 1  },
  { key: 'women',   label: '🇳🇱 Women',     flag: '🏑', comp: 'national',      id: 2  },
  { key: 'intmen',  label: '🌍 Int. Men',   flag: '🌍', comp: 'international', id: 44 },
  { key: 'intwomen',label: '🌍 Int. Women', flag: '🌍', comp: 'international', id: 45 },
] as const

type LeagueKey = typeof LEAGUES[number]['key']
type TabKey = 'standings' | 'schedule' | 'results'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
function fmtTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function gd(s: Standing): string {
  const diff = s.goals_for - s.goals_against
  return diff > 0 ? `+${diff}` : String(diff)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TeamLogo({ logo, name }: { logo: string | null; name: string }) {
  if (!logo) return <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{name[0]}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={logo} alt={name} style={{ width: 24, height: 24, objectFit: 'contain' }} />
  )
}

function StandingsTable({ standings }: { standings: Standing[] }) {
  if (!standings.length) return <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No data</p>

  const th: React.CSSProperties = {
    padding: '8px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
    color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = { padding: '10px 10px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap' }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ ...th, textAlign: 'left', width: 32 }}>#</th>
            <th style={{ ...th, textAlign: 'left', minWidth: 160 }}>Team</th>
            <th style={th}>Z</th>
            <th style={th}>V</th>
            <th style={th}>R</th>
            <th style={th}>P</th>
            <th style={th}>GS</th>
            <th style={th}>GD</th>
            <th style={th}>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.team.id}
              style={{
                borderBottom: '1px solid var(--border)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
              }}>
              <td style={{ ...td, textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, fontSize: 12 }}>
                {s.rank}
              </td>
              <td style={{ ...td, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TeamLogo logo={s.team.logo} name={s.team.name} />
                  <span style={{ fontWeight: 600 }}>{s.team.name}</span>
                </div>
              </td>
              <td style={td}>{s.played}</td>
              <td style={td}>{s.wins}</td>
              <td style={td}>{s.draws}</td>
              <td style={td}>{s.losses}</td>
              <td style={td}>{s.goals_for}:{s.goals_against}</td>
              <td style={{ ...td, color: s.goals_for >= s.goals_against ? 'var(--green)' : '#f87171' }}>{gd(s)}</td>
              <td style={{ ...td, fontWeight: 800, color: 'var(--green)' }}>{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MatchRow({ match, showScore }: { match: Match; showScore: boolean }) {
  const isLive = match.status === 'live'
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '90px 1fr auto 1fr',
      alignItems: 'center',
      gap: 12,
      padding: '12px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      {/* Date */}
      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
        <div>{fmtDate(match.date)}</div>
        <div>{fmtTime(match.date)}</div>
      </div>

      {/* Home */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontWeight: 600, fontSize: 13, textAlign: 'right' }}>{match.home.name}</span>
        <TeamLogo logo={match.home.logo} name={match.home.name} />
      </div>

      {/* Score / vs */}
      <div style={{
        minWidth: 64, textAlign: 'center', fontWeight: 800, fontSize: 15,
        color: isLive ? 'var(--green)' : showScore ? 'var(--text-primary)' : 'var(--text-secondary)',
        padding: '4px 8px',
        background: isLive ? 'var(--blue-subtle)' : 'var(--card-bg)',
        borderRadius: 6,
        border: '1px solid var(--border)',
      }}>
        {isLive && <span style={{ fontSize: 9, display: 'block', color: 'var(--green)', letterSpacing: 1 }}>LIVE</span>}
        {showScore && match.score
          ? `${match.score.home} : ${match.score.away}`
          : 'vs'}
      </div>

      {/* Away */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TeamLogo logo={match.away.logo} name={match.away.name} />
        <span style={{ fontWeight: 600, fontSize: 13 }}>{match.away.name}</span>
      </div>
    </div>
  )
}

function PouleSection({
  poule, tab, showSelector, selected, onSelect
}: {
  poule: Poule
  tab: TabKey
  showSelector: boolean
  selected: boolean
  onSelect: () => void
}) {
  const results  = poule.matches.filter(m => m.status === 'final').sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  const schedule = poule.matches.filter(m => m.status === 'scheduled' || m.status === 'live').sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <div>
      {showSelector && (
        <button onClick={onSelect} style={{
          background: selected ? 'var(--green)' : 'transparent',
          color: selected ? '#000' : 'var(--text-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 8, padding: '4px 12px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', marginBottom: 16,
        }}>
          {poule.name}
        </button>
      )}

      {!showSelector || selected ? (
        <>
          {tab === 'standings' && <StandingsTable standings={poule.standings} />}
          {tab === 'results' && (
            results.length
              ? results.map(m => <MatchRow key={m.id} match={m} showScore />)
              : <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No results yet</p>
          )}
          {tab === 'schedule' && (
            schedule.length
              ? schedule.map(m => <MatchRow key={m.id} match={m} showScore={m.status === 'live'} />)
              : <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No upcoming matches</p>
          )}
        </>
      ) : null}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CompetitionPage() {
  const [league,       setLeague]       = useState<LeagueKey>('men')
  const [tab,          setTab]          = useState<TabKey>('standings' as TabKey)
  const [data,         setData]         = useState<CompetitionData | null>(null)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [selectedPoule,setSelectedPoule]= useState(0)

  const current = LEAGUES.find(l => l.key === league)!

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setData(null)
    setSelectedPoule(0)

    fetch(`/api/hockey?comp=${current.comp}&id=${current.id}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(d => { if (!cancelled) setData(d) })
      .catch(e => { if (!cancelled) setError(e.message) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [league, current.comp, current.id])

  const leagueTabStyle = (key: LeagueKey): React.CSSProperties => ({
    padding: '10px 18px', fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: 'none', borderRadius: 10,
    background: league === key ? 'var(--green)' : 'transparent',
    color: league === key ? '#000' : 'var(--text-secondary)',
    transition: 'all .15s',
  })

  const subTabStyle = (key: TabKey): React.CSSProperties => ({
    padding: '8px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
    cursor: 'pointer', border: 'none', borderRadius: 8,
    background: tab === key ? 'rgba(0,58,208,0.12)' : 'transparent',
    color: tab === key ? 'var(--green)' : 'var(--text-secondary)',
    borderBottom: tab === key ? '2px solid var(--green)' : '2px solid transparent',
    transition: 'all .15s',
  })

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
          Matches
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 6 }}>
          Match results, standings and schedule from the world of field hockey
        </p>
      </div>

      {/* League tabs */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap',
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 6, marginBottom: 24,
      }}>
        {LEAGUES.map(l => (
          <button key={l.key} onClick={() => setLeague(l.key)} style={leagueTabStyle(l.key)}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Sub-tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {(['standings', 'schedule', 'results'] as TabKey[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={subTabStyle(t)}>
            {t === 'standings' ? '📊 Standings' : t === 'schedule' ? '📅 Schedule' : '✅ Results'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        background: 'var(--card-bg)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 24,
      }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <p style={{ fontSize: 13 }}>Loading data…</p>
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#f87171' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <p style={{ fontSize: 13 }}>Error: {error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{data.name}</h2>
            </div>

            {/* Poule selector (only when multiple poules) */}
            {data.poules && data.poules.length > 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {data.poules.map((p, i) => (
                  <button key={p.id} onClick={() => setSelectedPoule(i)} style={{
                    background: selectedPoule === i ? 'var(--green)' : 'transparent',
                    color: selectedPoule === i ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                  }}>
                    {p.name || `Group ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {data.poules?.map((poule, i) => {
              if (data.poules.length > 1 && i !== selectedPoule) return null
              return (
                <PouleSection
                  key={poule.id}
                  poule={poule}
                  tab={tab}
                  showSelector={false}
                  selected
                  onSelect={() => {}}
                />
              )
            })}
          </>
        )}
      </div>

      {/* Credit */}
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 11, marginTop: 20 }}>
        Data: HockeyWeerelt / Hockey.nl
      </p>
    </div>
  )
}
