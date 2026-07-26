/**
 * Local-only preview bootstrap for the Mexion skin.
 *
 * This intentionally lives beside the skin instead of inside the router or
 * business stores. It only obtains a real backend session from the Vite
 * development middleware when the developer explicitly enables preview mode.
 * Production builds cannot activate this path because import.meta.env.DEV is
 * false in production.
 */

type PreviewUser = Record<string, unknown> & {
  id: number
  username: string
  email: string
  role: 'admin' | 'user'
}

type PreviewSessionResponse = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  user: PreviewUser
}

const PREVIEW_QUERY_KEYS = ['mexion-preview', 'mexion_preview']
const PUBLIC_SURFACE_QUERY_KEYS = ['mexion-public', 'mexion_public']
const PREVIEW_MARKER_KEY = 'mexion_local_preview'
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at'

function isTruthy(value: string | null | undefined): boolean {
  return value === '1' || value === 'true' || value === 'yes' || value === ''
}

/**
 * Preview is deliberately opt-in unless the local launcher sets the dev-only
 * VITE_MEXION_LOCAL_PREVIEW flag. Launcher mode authenticates every entry
 * path, including / and /home, so opening the advertised 5515 root and then
 * entering the application never falls back to a login form.
 *
 * Public/Auth surfaces remain available for visual comparison through the
 * 5603 hybrid reference server. During Vue-only debugging, append
 * ?mexion-public=1 to suppress the automatic session for that one document.
 */
export function isMexionLocalPreviewRequested(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false

  const query = new URLSearchParams(window.location.search)
  const explicitQuery = PREVIEW_QUERY_KEYS.some((key) => isTruthy(query.get(key)))
  const publicSurfaceRequested = PUBLIC_SURFACE_QUERY_KEYS.some((key) => isTruthy(query.get(key)))
  const launcherMode =
    import.meta.env.VITE_MEXION_LOCAL_PREVIEW === 'true' && !publicSurfaceRequested

  return explicitQuery || launcherMode
}

function storeSession(session: PreviewSessionResponse): void {
  localStorage.setItem(AUTH_TOKEN_KEY, session.access_token)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user))
  if (session.refresh_token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refresh_token)
  }
  if (typeof session.expires_in === 'number') {
    localStorage.setItem(
      TOKEN_EXPIRES_AT_KEY,
      String(Date.now() + session.expires_in * 1000)
    )
  }
  localStorage.setItem(PREVIEW_MARKER_KEY, 'true')
}

/**
 * Obtain a real, read-only-by-convention local administrator session before
 * Vue Router performs its first navigation. This keeps the application's
 * normal auth guard and API/Store semantics intact.
 *
 * The endpoint is intentionally called on every preview bootstrap instead of
 * trusting an existing localStorage token. A token may still have a future
 * JWT expiry while the backend has invalidated its token version (for example
 * after a restart or account/session change), which otherwise causes a false
 * redirect to /login.
 */
export async function prepareMexionLocalPreview(): Promise<boolean> {
  if (!isMexionLocalPreviewRequested()) return false

  const response = await fetch('/__mexion/preview-session', {
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    // Keep the more useful status error below.
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message?: unknown }).message)
        : `Preview session endpoint returned HTTP ${response.status}`
    throw new Error(message)
  }

  const session =
    payload && typeof payload === 'object' && 'data' in payload
      ? (payload as { data: PreviewSessionResponse }).data
      : payload

  if (
    !session ||
    typeof session !== 'object' ||
    typeof (session as PreviewSessionResponse).access_token !== 'string' ||
    !(session as PreviewSessionResponse).user
  ) {
    throw new Error('Preview session response is missing access_token or user')
  }

  storeSession(session as PreviewSessionResponse)
  return true
}

export function isMexionLocalPreviewActive(): boolean {
  return typeof localStorage !== 'undefined' && localStorage.getItem(PREVIEW_MARKER_KEY) === 'true'
}
