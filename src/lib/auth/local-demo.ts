import { cookies } from 'next/headers'
import {
  hasLocalDemoCookie,
  LOCAL_DEMO_COOKIE,
  LOCAL_DEMO_COOKIE_VALUE,
} from './local-demo-config'

export async function isLocalDemoSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return hasLocalDemoCookie(cookieStore.get(LOCAL_DEMO_COOKIE)?.value)
}

export async function startLocalDemoSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(LOCAL_DEMO_COOKIE, LOCAL_DEMO_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })
}

export async function endLocalDemoSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(LOCAL_DEMO_COOKIE)
}
