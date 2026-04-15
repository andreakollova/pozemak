import { NextResponse } from 'next/server'

export async function GET() {
  return new NextResponse(
    `<html><head><meta charset="utf-8"></head><body><script>
      localStorage.setItem('hockeyrefresh-native','1');
      window.location.replace('/');
    </script></body></html>`,
    {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    }
  )
}
