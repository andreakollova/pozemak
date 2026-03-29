import { getIronSession, IronSession } from 'iron-session'
import { cookies } from 'next/headers'

export type SessionData = {
  isAdmin: boolean
}

const sessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'pozemak_admin',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 60 * 24, // 24 hodín
  },
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
  return session
}
