import { DEFAULT_ORGANIZATION_SLUG, normalizeOrganizationSlug } from './organization.ts'

export type OrganizationRoute = {
  orgSlug: string
  basename: string
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return ''
  }
}

function scopedPath(pathname: string) {
  const match = /^\/o\/([^/]+)(\/.*)?$/.exec(pathname)
  if (!match) return null
  const slug = normalizeOrganizationSlug(safeDecode(match[1]))
  return slug ? { slug, suffix: match[2] || '/' } : null
}

function isPlatformHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '')
  return normalized === 'novyway.com' || normalized === 'www.novyway.com'
}

export function organizationSlugFromHostname(hostname: string): string | null {
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '')
  if (!normalized || isPlatformHostname(normalized) || normalized === 'localhost' || normalized === '127.0.0.1') return null

  const suffix = normalized.endsWith('.novyway.com')
    ? '.novyway.com'
    : normalized.endsWith('.localhost')
      ? '.localhost'
      : null
  if (!suffix) return null

  const candidate = normalized.slice(0, -suffix.length)
  if (!candidate || candidate.includes('.') || candidate === 'www') return null
  return normalizeOrganizationSlug(candidate)
}

export function resolveOrganizationRoute(hostname: string, pathname = '/'): OrganizationRoute {
  const hostSlug = organizationSlugFromHostname(hostname)
  if (hostSlug) return { orgSlug: hostSlug, basename: '/' }

  const scoped = scopedPath(pathname)
  if (scoped) return { orgSlug: scoped.slug, basename: '/o/' + scoped.slug }

  return { orgSlug: DEFAULT_ORGANIZATION_SLUG, basename: '/' }
}

export function legacyLocationTarget(
  protocol: string,
  hostname: string,
  port: string,
  pathname: string,
  search: string,
  hash: string,
) {
  void pathname
  void search
  if (!hash.startsWith('#')) return null
  const value = hash.slice(1)
  if (!value.startsWith('/')) return null
  const queryAt = value.indexOf('?')
  const legacyPath = queryAt === -1 ? value : value.slice(0, queryAt)
  const legacySearch = queryAt === -1 ? '' : value.slice(queryAt)
  const scoped = scopedPath(legacyPath)
  const hostSlug = organizationSlugFromHostname(hostname)

  if (hostSlug) {
    const suffix = scoped?.suffix ?? legacyPath
    return protocol + '//' + hostname + port + suffix + legacySearch
  }

  if (scoped) {
    if (isPlatformHostname(hostname) && scoped.slug !== DEFAULT_ORGANIZATION_SLUG) {
      return protocol + '//' + scoped.slug + '.novyway.com' + port + scoped.suffix + legacySearch
    }
    const targetPath = scoped.slug === DEFAULT_ORGANIZATION_SLUG
      ? scoped.suffix
      : '/o/' + scoped.slug + scoped.suffix
    return protocol + '//' + hostname + port + targetPath + legacySearch
  }

  return protocol + '//' + hostname + port + legacyPath + legacySearch
}

export function canonicalizeOrganizationLocation(): OrganizationRoute {
  const target = legacyLocationTarget(
    window.location.protocol,
    window.location.hostname,
    window.location.port ? ':' + window.location.port : '',
    window.location.pathname,
    window.location.search,
    window.location.hash,
  )

  if (target && target !== window.location.href) {
    const next = new URL(target)
    if (next.origin !== window.location.origin) {
      window.location.replace(target)
    } else {
      window.history.replaceState(window.history.state, '', next.pathname + next.search)
    }
  }

  const hostSlug = organizationSlugFromHostname(window.location.hostname)
  const scoped = scopedPath(window.location.pathname)
  if (hostSlug && scoped) {
    window.history.replaceState(window.history.state, '', scoped.suffix + window.location.search)
  }

  return resolveOrganizationRoute(window.location.hostname, window.location.pathname)
}

export function resolveOrganizationHash(hash: string): OrganizationRoute {
  const value = hash.startsWith('#') ? hash.slice(1) : hash
  return resolveOrganizationRoute('novyway.com', value || '/')
}
