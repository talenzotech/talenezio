export const LOCAL_DEMO_EMAIL = 'demo@talenezio.local'
export const LOCAL_DEMO_PASSWORD = 'Demo123!'
export const LOCAL_DEMO_COOKIE = 'talenezio-local-demo'
export const LOCAL_DEMO_COOKIE_VALUE = 'authenticated'

export function isLocalDemoEnabled(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function hasLocalDemoCookie(value: string | undefined): boolean {
  return isLocalDemoEnabled() && value === LOCAL_DEMO_COOKIE_VALUE
}
