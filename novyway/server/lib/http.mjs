import { randomBytes } from 'node:crypto'
import { requestTarget } from './organization-context.mjs'

export function json(response, status, value, extraHeaders = {}) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...securityHeaders,
    ...extraHeaders,
  })
  response.end(body)
}

export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://fullnode.testnet.aptoslabs.com https://api.testnet.aptoslabs.com https://web.petra.app https://*.aptoslabs.com wss://*.aptoslabs.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Strict-Transport-Security': 'max-age=15552000',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
}

export async function readJson(request, maxBytes = 32_768) {
  const chunks = []
  let total = 0
  for await (const chunk of request) {
    total += chunk.length
    if (total > maxBytes) throw Object.assign(new Error('request_too_large'), { status: 413 })
    chunks.push(chunk)
  }
  if (total === 0) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('invalid_json'), { status: 400 })
  }
}

export function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie ?? '').split(';')
    .map((part) => part.trim()).filter(Boolean).map((part) => {
      const index = part.indexOf('=')
      return index < 0 ? [part, ''] : [part.slice(0, index), decodeURIComponent(part.slice(index + 1))]
    }))
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url')
}

export function sessionCookie(token, maxAge = 60 * 60 * 24 * 14, secure = true) {
  const name = secure ? '__Host-sovet_session' : 'sovet_session'
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=${maxAge}`
}

export function clearSessionCookie(secure = true) {
  const name = secure ? '__Host-sovet_session' : 'sovet_session'
  return `${name}=; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Max-Age=0`
}

export function csrfCookie(token, maxAge = 60 * 60 * 24 * 14, secure = true) {
  const name = secure ? '__Host-sovet_csrf' : 'sovet_csrf'
  return `${name}=${encodeURIComponent(token)}; Path=/; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=${maxAge}`
}

export function clearCsrfCookie(secure = true) {
  const name = secure ? '__Host-sovet_csrf' : 'sovet_csrf'
  return `${name}=; Path=/; ${secure ? 'Secure; ' : ''}SameSite=Strict; Max-Age=0`
}

export function publicUser(row, csrfToken, permissions = {}) {
  return {
    id: row.id,
    aptosAddress: row.aptos_address,
    activeAptosAddress: row.auth_method === 'aptos_signature' && typeof row.auth_address === 'string'
      ? row.auth_address
      : row.wallet_kind === 'managed' ? row.aptos_address : null,
    displayName: row.display_name,
    email: row.email,
    telegram: row.telegram,
    emailVerified: Boolean(row.email_verified),
    provider: row.provider,
    walletKind: row.wallet_kind ?? 'external',
    role: permissions.isSuperAdmin ? 'super_admin' : permissions.isAdmin ? 'admin' : 'voter',
    isAdmin: Boolean(permissions.isAdmin),
    isSuperAdmin: Boolean(permissions.isSuperAdmin),
    governanceSignerActive: Boolean(permissions.governanceSignerActive),
    creatorSignerActive: Boolean(permissions.creatorSignerActive),
    organizationRole: permissions.organizationRole ?? null,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    csrfToken,
  }
}

export function requestOrigin(request) {
  const target = requestTarget(request)
  return { host: target.host, origin: target.origin }
}

export function enforceSameOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return
  const expected = requestOrigin(request).origin
  if (origin !== expected) throw Object.assign(new Error('invalid_origin'), { status: 403 })
}
