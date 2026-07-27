const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '[::1]'])
const LOOPBACK_ADDRESSES = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const PLATFORM_HOSTS = new Set(['novyway.com', 'www.novyway.com'])
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const HOST_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?::[0-9]{1,5})?$/

function httpError(code, status) {
  return Object.assign(new Error(code), { status })
}

function firstHeader(value) {
  const first = Array.isArray(value) ? value[0] : value
  return typeof first === 'string' ? first.split(',')[0].trim() : ''
}

function isLoopbackRequest(request) {
  return LOOPBACK_ADDRESSES.has(request.socket?.remoteAddress ?? '')
}

function normalizeHost(value) {
  const host = value.trim().toLowerCase().replace(/\.$/, '')
  if (!host || host.length > 253 || !HOST_PATTERN.test(host)) throw httpError('invalid_host', 400)
  const portSeparator = host.lastIndexOf(':')
  if (portSeparator > -1 && !host.endsWith(']')) {
    const port = Number(host.slice(portSeparator + 1))
    if (!Number.isInteger(port) || port < 1 || port > 65_535) throw httpError('invalid_host', 400)
  }
  return host
}

function hostnameWithoutPort(host) {
  if (host.startsWith('[')) return host
  return host.replace(/:[0-9]{1,5}$/, '')
}

export function requestTarget(request) {
  const forwardedHost = firstHeader(request.headers['x-forwarded-host'])
  const directHost = firstHeader(request.headers.host)
  if (forwardedHost && !isLoopbackRequest(request)) throw httpError('untrusted_forwarded_host', 400)
  const host = normalizeHost(forwardedHost || directHost)

  const forwardedProto = firstHeader(request.headers['x-forwarded-proto']).toLowerCase()
  if (forwardedProto && !isLoopbackRequest(request)) throw httpError('untrusted_forwarded_proto', 400)
  if (forwardedProto && forwardedProto !== 'http' && forwardedProto !== 'https') {
    throw httpError('invalid_forwarded_proto', 400)
  }

  const hostname = hostnameWithoutPort(host)
  const local = LOCAL_HOSTS.has(hostname)
  const protocol = forwardedProto || (local ? 'http' : 'https')
  return { host, hostname, local, origin: `${protocol}://${host}` }
}

export function organizationApiTarget(pathname) {
  const prefix = pathname.match(/^\/api\/o\/([^/]+)(\/.*)?$/)
  if (!prefix) return { slug: null, apiPath: pathname }
  const slug = decodeURIComponent(prefix[1]).trim().toLowerCase()
  if (!SLUG_PATTERN.test(slug)) throw httpError('invalid_organization_slug', 400)
  return { slug, apiPath: `/api${prefix[2] || ''}` }
}

function sameOrganization(left, right) {
  return left?.id && right?.id && left.id === right.id
}

function assertUsableOrganization(organization) {
  if (!organization) throw httpError('organization_not_found', 404)
  if (organization.status === 'draft') throw httpError('organization_not_found', 404)
  if (organization.status === 'suspended') throw httpError('organization_suspended', 403)
  if (organization.status === 'archived') throw httpError('organization_not_found', 404)
  return organization
}

export async function resolveOrganizationRequest({
  request,
  url,
  findBySlug,
  findByDomain,
  defaultSlug = 'novyway',
}) {
  const target = requestTarget(request)
  const apiTarget = organizationApiTarget(url.pathname)
  const platformHost = PLATFORM_HOSTS.has(target.hostname) || target.local
  const domainOrganization = platformHost ? null : assertUsableOrganization(await findByDomain(target.hostname))
  const pathOrganization = apiTarget.slug ? assertUsableOrganization(await findBySlug(apiTarget.slug)) : null

  if (domainOrganization && pathOrganization && !sameOrganization(domainOrganization, pathOrganization)) {
    throw httpError('organization_domain_mismatch', 403)
  }

  const organization = pathOrganization
    ?? domainOrganization
    ?? assertUsableOrganization(await findBySlug(defaultSlug))

  const scopedUrl = new URL(url)
  scopedUrl.pathname = apiTarget.apiPath
  return Object.freeze({
    organization,
    organizationId: organization.id,
    slug: organization.slug,
    origin: target.origin,
    host: target.host,
    hostname: target.hostname,
    apiPath: apiTarget.apiPath,
    url: scopedUrl,
    explicit: Boolean(apiTarget.slug || domainOrganization),
  })
}

export function enforceOrganizationOrigin(request, context) {
  const origin = firstHeader(request.headers.origin)
  if (!origin) return
  if (origin !== context.origin) throw httpError('invalid_origin', 403)
}

export function platformHostname(hostname) {
  return PLATFORM_HOSTS.has(hostname)
}
