export const AUTH_TOKEN_KEY = 'auth_token'
export const AUTH_USER_KEY = 'auth_user'
export const TOKEN_EXPIRES_AT_KEY = 'token_expires_at'
export const PENDING_AUTH_SESSION_KEY = 'pending_auth_session'
export const AUTH_SESSION_HINT_KEY = 'auth_session_hint'

const LEGACY_AUTH_KEYS = [
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  TOKEN_EXPIRES_AT_KEY,
  PENDING_AUTH_SESSION_KEY,
  'refresh_token',
] as const

function session(): Storage | null {
  return typeof window !== 'undefined' ? window.sessionStorage : null
}

export function clearLegacyPersistentAuth(): void {
  if (typeof window === 'undefined') return
  for (const key of LEGACY_AUTH_KEYS) {
    window.localStorage.removeItem(key)
  }
}

export function getSessionAccessToken(): string | null {
  return session()?.getItem(AUTH_TOKEN_KEY) || null
}

export function setSessionAccessToken(token: string): void {
  const storage = session()
  if (!storage) return
  if (token) {
    storage.setItem(AUTH_TOKEN_KEY, token)
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, '1')
  } else {
    storage.removeItem(AUTH_TOKEN_KEY)
  }
}

export function hasPersistentAuthSessionHint(): boolean {
  return typeof window !== 'undefined' && window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === '1'
}

export function setSessionTokenExpiresIn(expiresIn: number): void {
  if (!Number.isFinite(expiresIn) || expiresIn <= 0) return
  session()?.setItem(TOKEN_EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000))
}

export function clearBrowserAuthSession(options: { preservePending?: boolean } = {}): void {
  const storage = session()
  storage?.removeItem(AUTH_TOKEN_KEY)
  storage?.removeItem(AUTH_USER_KEY)
  storage?.removeItem(TOKEN_EXPIRES_AT_KEY)
  if (!options.preservePending) storage?.removeItem(PENDING_AUTH_SESSION_KEY)
  if (typeof window !== 'undefined') window.localStorage.removeItem(AUTH_SESSION_HINT_KEY)
  clearLegacyPersistentAuth()
}
