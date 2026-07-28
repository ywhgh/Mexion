import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(scriptsRoot, '..')

function readLocalSettings(settingsPath) {
  if (!existsSync(settingsPath)) return {}

  let parsed
  try {
    parsed = JSON.parse(readFileSync(settingsPath, 'utf8'))
  } catch (error) {
    throw new Error(`Unable to parse local runtime settings: ${error instanceof Error ? error.message : String(error)}`)
  }

  return parsed && typeof parsed === 'object' ? parsed : {}
}

export function loadLocalAuditCredentials() {
  const settingsPath = resolve(
    process.env.MEXION_LOCAL_SETTINGS_PATH || resolve(repoRoot, '.runtime/local-runtime.settings.json'),
  )
  const settings = readLocalSettings(settingsPath)
  const email = String(process.env.MEXION_ADMIN_EMAIL || settings.admin_email || '').trim()
  const password = String(process.env.MEXION_ADMIN_PASSWORD || settings.admin_password || '')

  if (!email || !password || password.startsWith('__MEXION_')) {
    throw new Error(
      'Local audit credentials are missing. Set MEXION_ADMIN_EMAIL and MEXION_ADMIN_PASSWORD, ' +
      'or provide the gitignored .runtime/local-runtime.settings.json file.',
    )
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('MEXION_ADMIN_EMAIL is not a valid email address')
  }

  return Object.freeze({ email, password })
}
