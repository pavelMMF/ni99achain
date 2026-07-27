import {
  isSafeBrandText,
  normalizeAccentColor,
  normalizeLogoUrl,
  type OrganizationBranding,
} from './organization'

export const ORGANIZATION_APPLICATION_STEPS = [
  'model',
  'people',
  'governance',
  'identity',
  'review',
] as const

export const ORGANIZATION_APPLICATION_TEMPLATES = [
  {
    id: 'expert-weighted',
    governance: { quorumPercent: '40', approvalPercent: '60', committeeSize: '7' },
  },
  {
    id: 'equal-member',
    governance: { quorumPercent: '50', approvalPercent: '50', committeeSize: '7' },
  },
  {
    id: 'simple-committee',
    governance: { quorumPercent: '60', approvalPercent: '50', committeeSize: '7' },
  },
] as const

export const ORGANIZATION_DECISION_CATEGORIES = [
  'document_change',
  'budget',
  'project',
  'personnel',
  'election',
  'rule_change',
  'advisory',
] as const

export const ORGANIZATION_LINK_KINDS = [
  'telegram',
  'instagram',
  'vk',
  'youtube',
  'discord',
  'other',
] as const

export type OrganizationApplicationTemplateId = typeof ORGANIZATION_APPLICATION_TEMPLATES[number]['id']
export type OrganizationDecisionCategory = typeof ORGANIZATION_DECISION_CATEGORIES[number]
export type OrganizationLinkKind = typeof ORGANIZATION_LINK_KINDS[number]
export type OrganizationInvitationMode = 'secure-link' | 'email-review' | 'manual'

export type OrganizationContactLink = {
  id: string
  kind: OrganizationLinkKind
  label: string
  url: string
}

type LegacyFirstDecision = {
  kind: string
  title: string
  summary: string
  closesInDays: string
}

export type OrganizationApplicationSetupDraft = {
  version: 2
  orgSlug: string
  currentStep: number
  completedSteps: number[]
  templateId: OrganizationApplicationTemplateId
  people: {
    memberEstimate: string
    invitationMode: OrganizationInvitationMode
    invitees: string
  }
  governance: {
    quorumPercent: string
    approvalPercent: string
    committeeSize: string
    decisionCategories: OrganizationDecisionCategory[]
    customDecisionCategory: string
  }
  branding: {
    displayName: string
    shortName: string
    accentColor: string
    logoUrl: string
  }
  address: {
    hasPhysicalAddress: boolean
    publishAddress: boolean
    addressLine: string
    city: string
    region: string
    postalCode: string
    country: string
  }
  contacts: {
    projectUrl: string
    links: OrganizationContactLink[]
  }
  legacy?: {
    firstDecision?: LegacyFirstDecision
  }
  updatedAt: string
}

export type OrganizationApplicationSetupErrorCode =
  | 'required'
  | 'invalid'
  | 'invalid_email'
  | 'invalid_url'
  | 'too_many'
  | 'too_short'
  | 'out_of_range'
  | 'incomplete'

export type OrganizationApplicationSetupErrors = Record<string, OrganizationApplicationSetupErrorCode>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PLAIN_TEXT = /^[^\u0000-\u001f\u007f<>]+$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown, maximum: number, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maximum)
}

function cleanMultilineText(value: unknown, maximum: number, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, maximum)
}

function validText(value: string, minimum: number, maximum: number) {
  const text = value.trim()
  return text.length >= minimum && text.length <= maximum && PLAIN_TEXT.test(text)
}

function validInteger(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value.trim())) return false
  const parsed = Number(value)
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
}

function validOptionalHttpUrl(value: string) {
  if (!value.trim()) return true
  try {
    const url = new URL(value.trim())
    return (url.protocol === 'https:' || url.protocol === 'http:') && Boolean(url.hostname)
  } catch {
    return false
  }
}

function isTemplateId(value: unknown): value is OrganizationApplicationTemplateId {
  return ORGANIZATION_APPLICATION_TEMPLATES.some((template) => template.id === value)
}

function isInvitationMode(value: unknown): value is OrganizationInvitationMode {
  return value === 'secure-link' || value === 'email-review' || value === 'manual'
}

function isDecisionCategory(value: unknown): value is OrganizationDecisionCategory {
  return ORGANIZATION_DECISION_CATEGORIES.some((category) => category === value)
}

function isLinkKind(value: unknown): value is OrganizationLinkKind {
  return ORGANIZATION_LINK_KINDS.some((kind) => kind === value)
}

function cleanCompletedSteps(value: unknown, maximumExclusive: number) {
  if (!Array.isArray(value)) return []
  return [...new Set(value.filter((step): step is number => (
    Number.isInteger(step) && Number(step) >= 0 && Number(step) < maximumExclusive
  )))].sort()
}

function createDefaultDraft(
  orgSlug: string,
  branding: Pick<OrganizationBranding, 'displayName' | 'shortName' | 'accentColor' | 'logoUrl'>,
): OrganizationApplicationSetupDraft {
  return {
    version: 2,
    orgSlug,
    currentStep: 0,
    completedSteps: [],
    templateId: 'expert-weighted',
    people: {
      memberEstimate: '10',
      invitationMode: 'secure-link',
      invitees: '',
    },
    governance: {
      ...ORGANIZATION_APPLICATION_TEMPLATES[0].governance,
      decisionCategories: ['document_change', 'budget', 'advisory'],
      customDecisionCategory: '',
    },
    branding: {
      displayName: branding.displayName,
      shortName: branding.shortName,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl ?? '',
    },
    address: {
      hasPhysicalAddress: false,
      publishAddress: false,
      addressLine: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    },
    contacts: {
      projectUrl: '',
      links: [],
    },
    updatedAt: new Date().toISOString(),
  }
}

function sanitizeLinks(value: unknown): OrganizationContactLink[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const links: OrganizationContactLink[] = []
  value.slice(0, 8).forEach((item, index) => {
    if (!isRecord(item)) return
    const baseId = cleanText(item.id, 48, `link-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '') || `link-${index + 1}`
    let id = baseId
    let suffix = 2
    while (seen.has(id)) {
      id = `${baseId}-${suffix}`
      suffix += 1
    }
    seen.add(id)
    links.push({
      id,
      kind: isLinkKind(item.kind) ? item.kind : 'other',
      label: cleanText(item.label, 40),
      url: cleanText(item.url, 512),
    })
  })
  return links
}

function migrateLegacyDraft(
  value: Record<string, unknown>,
  fallback: OrganizationApplicationSetupDraft,
): OrganizationApplicationSetupDraft {
  const people = isRecord(value.people) ? value.people : {}
  const governance = isRecord(value.governance) ? value.governance : {}
  const branding = isRecord(value.branding) ? value.branding : {}
  const address = isRecord(value.address) ? value.address : {}
  const firstDecision = isRecord(value.firstDecision) ? value.firstDecision : {}
  const hasAddress = ['addressLine', 'city', 'region', 'postalCode', 'country']
    .some((field) => typeof address[field] === 'string' && String(address[field]).trim().length > 0)
  const legacyKind = cleanText(firstDecision.kind, 32)
  const inferredCategory: OrganizationDecisionCategory = legacyKind === 'election'
    ? 'election'
    : legacyKind === 'policy'
      ? 'rule_change'
      : 'document_change'

  return {
    ...fallback,
    currentStep: Number(value.currentStep) >= 4 ? 4 : Math.max(0, Number(value.currentStep) || 0),
    completedSteps: cleanCompletedSteps(value.completedSteps, 4),
    templateId: isTemplateId(value.templateId) ? value.templateId : fallback.templateId,
    people: {
      memberEstimate: cleanText(people.memberEstimate, 6, fallback.people.memberEstimate),
      invitationMode: isInvitationMode(people.invitationMode) ? people.invitationMode : fallback.people.invitationMode,
      invitees: cleanMultilineText(people.invitees, 4000),
    },
    governance: {
      quorumPercent: cleanText(governance.quorumPercent, 3, fallback.governance.quorumPercent),
      approvalPercent: cleanText(governance.approvalPercent, 3, fallback.governance.approvalPercent),
      committeeSize: cleanText(governance.committeeSize, 3, fallback.governance.committeeSize),
      decisionCategories: [...new Set([...fallback.governance.decisionCategories, inferredCategory])],
      customDecisionCategory: '',
    },
    branding: {
      displayName: cleanText(branding.displayName, 80, fallback.branding.displayName),
      shortName: cleanText(branding.shortName, 24, fallback.branding.shortName),
      accentColor: cleanText(branding.accentColor, 7, fallback.branding.accentColor),
      logoUrl: cleanText(branding.logoUrl, 512),
    },
    address: {
      hasPhysicalAddress: hasAddress,
      publishAddress: false,
      addressLine: cleanText(address.addressLine, 120),
      city: cleanText(address.city, 80),
      region: cleanText(address.region, 80),
      postalCode: cleanText(address.postalCode, 20),
      country: cleanText(address.country, 80),
    },
    legacy: {
      firstDecision: {
        kind: legacyKind,
        title: cleanText(firstDecision.title, 120),
        summary: cleanMultilineText(firstDecision.summary, 1000),
        closesInDays: cleanText(firstDecision.closesInDays, 3),
      },
    },
    updatedAt: typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
      ? value.updatedAt
      : fallback.updatedAt,
  }
}

export function normalizeOrganizationApplicationSetup(
  value: unknown,
  orgSlug: string,
  branding: Pick<OrganizationBranding, 'displayName' | 'shortName' | 'accentColor' | 'logoUrl'>,
): OrganizationApplicationSetupDraft {
  const fallback = createDefaultDraft(orgSlug, branding)
  if (!isRecord(value) || value.orgSlug !== orgSlug) return fallback
  if (value.version !== 2) return migrateLegacyDraft(value, fallback)

  const people = isRecord(value.people) ? value.people : {}
  const governance = isRecord(value.governance) ? value.governance : {}
  const brand = isRecord(value.branding) ? value.branding : {}
  const address = isRecord(value.address) ? value.address : {}
  const contacts = isRecord(value.contacts) ? value.contacts : {}
  const legacy = isRecord(value.legacy) ? value.legacy : {}
  const legacyDecision = isRecord(legacy.firstDecision) ? legacy.firstDecision : null
  const decisionCategories = Array.isArray(governance.decisionCategories)
    ? [...new Set(governance.decisionCategories.filter(isDecisionCategory))]
    : fallback.governance.decisionCategories

  return {
    version: 2,
    orgSlug,
    currentStep: Math.min(4, Math.max(0, Number(value.currentStep) || 0)),
    completedSteps: cleanCompletedSteps(value.completedSteps, 4),
    templateId: isTemplateId(value.templateId) ? value.templateId : fallback.templateId,
    people: {
      memberEstimate: cleanText(people.memberEstimate, 6, fallback.people.memberEstimate),
      invitationMode: isInvitationMode(people.invitationMode) ? people.invitationMode : fallback.people.invitationMode,
      invitees: cleanMultilineText(people.invitees, 4000),
    },
    governance: {
      quorumPercent: cleanText(governance.quorumPercent, 3, fallback.governance.quorumPercent),
      approvalPercent: cleanText(governance.approvalPercent, 3, fallback.governance.approvalPercent),
      committeeSize: cleanText(governance.committeeSize, 3, fallback.governance.committeeSize),
      decisionCategories,
      customDecisionCategory: cleanText(governance.customDecisionCategory, 60),
    },
    branding: {
      displayName: cleanText(brand.displayName, 80, fallback.branding.displayName),
      shortName: cleanText(brand.shortName, 24, fallback.branding.shortName),
      accentColor: cleanText(brand.accentColor, 7, fallback.branding.accentColor),
      logoUrl: cleanText(brand.logoUrl, 512),
    },
    address: {
      hasPhysicalAddress: Boolean(address.hasPhysicalAddress),
      publishAddress: Boolean(address.publishAddress),
      addressLine: cleanText(address.addressLine, 120),
      city: cleanText(address.city, 80),
      region: cleanText(address.region, 80),
      postalCode: cleanText(address.postalCode, 20),
      country: cleanText(address.country, 80),
    },
    contacts: {
      projectUrl: cleanText(contacts.projectUrl, 512),
      links: sanitizeLinks(contacts.links),
    },
    ...(legacyDecision ? {
      legacy: {
        firstDecision: {
          kind: cleanText(legacyDecision.kind, 32),
          title: cleanText(legacyDecision.title, 120),
          summary: cleanMultilineText(legacyDecision.summary, 1000),
          closesInDays: cleanText(legacyDecision.closesInDays, 3),
        },
      },
    } : {}),
    updatedAt: typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
      ? value.updatedAt
      : fallback.updatedAt,
  }
}

export function applyOrganizationApplicationTemplate(
  draft: OrganizationApplicationSetupDraft,
  templateId: OrganizationApplicationTemplateId,
): OrganizationApplicationSetupDraft {
  const template = ORGANIZATION_APPLICATION_TEMPLATES.find((item) => item.id === templateId)
    ?? ORGANIZATION_APPLICATION_TEMPLATES[0]
  return {
    ...draft,
    templateId: template.id,
    governance: {
      ...draft.governance,
      ...template.governance,
    },
  }
}

export function validateOrganizationApplicationStep(
  draft: OrganizationApplicationSetupDraft,
  step: number,
): OrganizationApplicationSetupErrors {
  const errors: OrganizationApplicationSetupErrors = {}

  if (step === 0 && !isTemplateId(draft.templateId)) errors['template-options'] = 'required'

  if (step === 1) {
    if (!validInteger(draft.people.memberEstimate, 1, 100000)) errors['people-member-estimate'] = 'out_of_range'
    const invitees = draft.people.invitees.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (invitees.length > 50) errors['people-invitees'] = 'too_many'
    else if (invitees.some((email) => email.length > 254 || !EMAIL.test(email))) errors['people-invitees'] = 'invalid_email'
  }

  if (step === 2) {
    if (!validInteger(draft.governance.quorumPercent, 1, 100)) errors['governance-quorum'] = 'out_of_range'
    if (!validInteger(draft.governance.approvalPercent, 50, 100)) errors['governance-approval'] = 'out_of_range'
    if (draft.templateId === 'simple-committee' && !validInteger(draft.governance.committeeSize, 1, 99)) {
      errors['governance-committee-size'] = 'out_of_range'
    }
    if (!draft.governance.decisionCategories.length && !validText(draft.governance.customDecisionCategory, 2, 60)) {
      errors['governance-decision-categories'] = 'required'
    }
    if (draft.governance.customDecisionCategory && !validText(draft.governance.customDecisionCategory, 2, 60)) {
      errors['governance-custom-category'] = 'invalid'
    }
  }

  if (step === 3) {
    if (!isSafeBrandText(draft.branding.displayName, 2, 80)) errors['branding-display-name'] = 'invalid'
    if (!isSafeBrandText(draft.branding.shortName, 2, 24)) errors['branding-short-name'] = 'invalid'
    if (!normalizeAccentColor(draft.branding.accentColor)) errors['branding-accent-color'] = 'invalid'
    if (normalizeLogoUrl(draft.branding.logoUrl) === null) errors['branding-logo-url'] = 'invalid_url'
    if (!validOptionalHttpUrl(draft.contacts.projectUrl)) errors['contacts-project-url'] = 'invalid_url'

    draft.contacts.links.forEach((link) => {
      if (!validOptionalHttpUrl(link.url) || !link.url.trim()) errors[`contact-link-${link.id}-url`] = 'invalid_url'
      if (link.kind === 'other' && !validText(link.label, 2, 40)) errors[`contact-link-${link.id}-label`] = 'required'
    })

    if (draft.address.hasPhysicalAddress) {
      if (!validText(draft.address.addressLine, 3, 120)) errors['address-line'] = 'required'
      if (!validText(draft.address.city, 2, 80)) errors['address-city'] = 'required'
      if (draft.address.region && !validText(draft.address.region, 2, 80)) errors['address-region'] = 'invalid'
      if (!validText(draft.address.postalCode, 2, 20)) errors['address-postal-code'] = 'required'
      if (!validText(draft.address.country, 2, 80)) errors['address-country'] = 'required'
    }
  }

  if (step === 4 && !organizationApplicationSetupIsReady(draft)) errors['setup-incomplete'] = 'incomplete'
  return errors
}

export function organizationApplicationSetupIsReady(draft: OrganizationApplicationSetupDraft) {
  return [0, 1, 2, 3].every((step) => (
    draft.completedSteps.includes(step)
    && Object.keys(validateOrganizationApplicationStep(draft, step)).length === 0
  ))
}
