'use client'

import './globals.css'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('pozemak-theme')
    if (saved) setDark(saved === 'dark')
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    localStorage.setItem('pozemak-theme', next ? 'dark' : 'light')
  }

  return (
    <html lang="sk" suppressHydrationWarning>
      <head>
        <title>Pozemak – Pozemný hokej</title>
        <meta name="description" content="Najnovšie správy zo sveta pozemného hokeja" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={dark ? '' : 'light'} style={{ background: 'var(--bg-dark)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        <Navbar dark={dark} onToggle={toggle} />
        {children}
      </body>
    </html>
  )
}
