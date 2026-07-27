export const DEFAULT_ORGANIZATION_SLUG = 'novyway'

export type OrganizationBranding = {
  displayName: string
  shortName: string
  accentColor: string
  logoUrl?: string
}
export type OrganizationVisibility = 'public' | 'unlisted' | 'members_only'

export type OrganizationAccess = {
  visibility: OrganizationVisibility
  memberOnly: boolean
  canViewWorkspace: boolean
}

export type OrganizationAptosConfig = {
  network: 'testnet' | 'mainnet' | 'devnet' | 'local'
  moduleAddress?: string
  organizationAddress?: string
}

export type VerifiedOrganizationConfig = {
  organizationId?: string
  slug: string
  description?: string
  branding: OrganizationBranding
  publicationStatus: 'published' | 'unpublished'
  access: OrganizationAccess
  aptos: OrganizationAptosConfig
  verifiedAt: string
}

export type OrganizationEnvelopeResult =
  | { status: 'verified'; config: VerifiedOrganizationConfig }
  | { status: 'unverified' | 'invalid'; config: null }

const ORGANIZATION_SLUG = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/
const SAFE_IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const ORGANIZATION_VISIBILITIES = new Set(['public', 'unlisted', 'members_only'])
const APTOS_NETWORKS = new Set(['testnet', 'mainnet', 'devnet', 'local'])
const APTOS_ADDRESS = /^0x[0-9a-fA-F]{64}$/
const CONTROL_OR_MARKUP = /[\u0000-\u001f\u007f<>]/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function normalizeOrganizationSlug(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return ORGANIZATION_SLUG.test(normalized) ? normalized : null
}

export function isSafeBrandText(value: unknown, minimum: number, maximum: number): value is string {
  if (typeof value !== 'string') return false
  const text = value.trim()
  return text.length >= minimum && text.length <= maximum && !CONTROL_OR_MARKUP.test(text)
}

export function normalizeAccentColor(value: unknown): string | null {
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) return null
  return value.toUpperCase()
}

export function normalizeLogoUrl(value: unknown): string | undefined | null {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  if (!candidate || candidate.length > 512 || /[\u0000-\u001f\u007f\\]/.test(candidate)) return null

  if (candidate.startsWith('/')) {
    if (candidate.startsWith('//')) return null
    return candidate
  }

  try {
    const url = new URL(candidate)
    if (url.protocol !== 'https:' || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}

export function validateOrganizationBranding(value: unknown): OrganizationBranding | null {
  if (!isRecord(value)) return null
  if (!isSafeBrandText(value.displayName, 2, 80)) return null
  if (!isSafeBrandText(value.shortName, 2, 24)) return null
  const accentColor = normalizeAccentColor(value.accentColor)
  const logoUrl = normalizeLogoUrl(value.logoUrl)
  if (!accentColor || logoUrl === null) return null

  return {
    displayName: value.displayName.trim(),
    shortName: value.shortName.trim(),
    accentColor,
    ...(logoUrl ? { logoUrl } : {}),
  }
}

function validIsoDate(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value))
}

function parseOrganizationAptos(value: unknown): OrganizationAptosConfig | null {
  if (value === undefined || value === null) return { network: 'testnet' }
  if (!isRecord(value) || !APTOS_NETWORKS.has(value.network as string)) return null

  const moduleAddress = value.moduleAddress === undefined || value.moduleAddress === null
    ? undefined
    : typeof value.moduleAddress === 'string' && APTOS_ADDRESS.test(value.moduleAddress)
      ? value.moduleAddress.toLowerCase()
      : null
  const organizationAddress = value.organizationAddress === undefined || value.organizationAddress === null
    ? undefined
    : typeof value.organizationAddress === 'string' && APTOS_ADDRESS.test(value.organizationAddress)
      ? value.organizationAddress.toLowerCase()
      : null
  if (moduleAddress === null || organizationAddress === null) return null

  return {
    network: value.network as OrganizationAptosConfig['network'],
    ...(moduleAddress ? { moduleAddress } : {}),
    ...(organizationAddress ? { organizationAddress } : {}),
  }
}

/**
 * A server response is a candidate only. It becomes active after the response
 * carries an explicit verification result for the same URL-derived slug.
 * Unknown fields are intentionally ignored and never reach rendering or CSS.
 */
export function parseOrganizationEnvelope(
  value: unknown,
  requestedSlug: string,
): OrganizationEnvelopeResult {
  if (!isRecord(value) || !isRecord(value.organization)) return { status: 'invalid', config: null }

  const organization = value.organization
  const slug = normalizeOrganizationSlug(organization.slug)
  const rawBrand = isRecord(organization.brand) ? organization.brand : {}
  const branding = validateOrganizationBranding({
    displayName: typeof rawBrand.displayName === 'string' ? rawBrand.displayName : organization.name,
    shortName: typeof rawBrand.shortName === 'string' ? rawBrand.shortName : slug?.toUpperCase(),
    accentColor: typeof rawBrand.accentColor === 'string' ? rawBrand.accentColor : '#E64232',
    logoUrl: rawBrand.logoUrl,
  })
  const description = isSafeBrandText(organization.description, 1, 500) ? organization.description.trim() : undefined
  const publicationStatus = organization.status === 'active' ? 'published' : 'unpublished'
  const organizationId = organization.id
  const visibility = ORGANIZATION_VISIBILITIES.has(organization.visibility as string) ? organization.visibility as OrganizationVisibility : 'public'
  const rawAccess = isRecord(value.access) ? value.access : {}
  const aptos = parseOrganizationAptos(organization.aptos)
  const access = {
    visibility,
    memberOnly: rawAccess.memberOnly === true || visibility === 'members_only',
    canViewWorkspace: rawAccess.canViewWorkspace !== false && !(visibility === 'members_only' && rawAccess.canViewWorkspace !== true),
  } satisfies OrganizationAccess

  if (
    !slug
    || slug !== requestedSlug
    || !branding
    || !aptos
    || (publicationStatus !== 'published' && publicationStatus !== 'unpublished')
    || (organizationId !== undefined && (typeof organizationId !== 'string' || !SAFE_IDENTIFIER.test(organizationId)))
  ) {
    return { status: 'invalid', config: null }
  }

  if (!isRecord(value.verification)) return { status: 'unverified', config: null }
  const verifiedSlug = normalizeOrganizationSlug(value.verification.orgSlug)
  if (
    value.verification.status !== 'verified'
    || verifiedSlug !== requestedSlug
    || !validIsoDate(value.verification.verifiedAt)
  ) {
    return { status: 'unverified', config: null }
  }

  return {
    status: 'verified',
    config: {
      ...(typeof organizationId === 'string' ? { organizationId } : {}),
      slug,
      ...(description ? { description } : {}),
      branding,
      publicationStatus,
      access,
      aptos,
      verifiedAt: value.verification.verifiedAt,
    },
  }
}

export function fallbackBrandingFor(slug: string): OrganizationBranding {
  if (slug === DEFAULT_ORGANIZATION_SLUG) {
    return {
      displayName: 'Новый Путь',
      shortName: 'НОВЫЙ ПУТЬ',
      accentColor: '#E64232',
    }
  }

  const readable = slug
    .replace(/^org[_-]?/, '')
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ') || 'Organization'

  return {
    displayName: readable.slice(0, 80),
    shortName: readable.slice(0, 24),
    accentColor: '#E64232',
  }
}
