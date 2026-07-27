import {
  isSafeBrandText,
  normalizeAccentColor,
  normalizeLogoUrl,
  type OrganizationBranding,
} from './organization'

export const ORGANIZATION_SETUP_STEPS = [
  'template',
  'people',
  'governance',
  'brand-address',
  'first-decision',
  'publish',
] as const

export const ORGANIZATION_TEMPLATES = [
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

export type OrganizationTemplateId = typeof ORGANIZATION_TEMPLATES[number]['id']
export type InvitationMode = 'secure-link' | 'email-review' | 'manual'
export type FirstDecisionKind = 'resolution' | 'policy' | 'election'

export type OrganizationSetupDraft = {
  version: 1
  orgSlug: string
  currentStep: number
  completedSteps: number[]
  templateId: OrganizationTemplateId
  people: {
    memberEstimate: string
    invitationMode: InvitationMode
    invitees: string
  }
  governance: {
    quorumPercent: string
    approvalPercent: string
    committeeSize: string
  }
  branding: {
    displayName: string
    shortName: string
    accentColor: string
    logoUrl: string
  }
  address: {
    addressLine: string
    city: string
    region: string
    postalCode: string
    country: string
  }
  firstDecision: {
    kind: FirstDecisionKind
    title: string
    summary: string
    closesInDays: string
  }
  updatedAt: string
}

export type SetupErrorCode =
  | 'required'
  | 'invalid'
  | 'invalid_email'
  | 'too_many'
  | 'too_short'
  | 'out_of_range'
  | 'incomplete'

export type SetupErrors = Record<string, SetupErrorCode>

const DRAFT_VERSION = 1
const DRAFT_KEY_PREFIX = 'novyway:organization-setup:v1:'
const PLAIN_TEXT = /^[^\u0000-\u001f\u007f<>]+$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanText(value: unknown, maximum: number, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, maximum)
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

function isTemplateId(value: unknown): value is OrganizationTemplateId {
  return ORGANIZATION_TEMPLATES.some((template) => template.id === value)
}

function isInvitationMode(value: unknown): value is InvitationMode {
  return value === 'secure-link' || value === 'email-review' || value === 'manual'
}

function isDecisionKind(value: unknown): value is FirstDecisionKind {
  return value === 'resolution' || value === 'policy' || value === 'election'
}

function draftKey(orgSlug: string) {
  return `${DRAFT_KEY_PREFIX}${orgSlug}`
}

export function createOrganizationSetupDraft(
  orgSlug: string,
  branding: OrganizationBranding,
): OrganizationSetupDraft {
  return {
    version: DRAFT_VERSION,
    orgSlug,
    currentStep: 0,
    completedSteps: [],
    templateId: 'expert-weighted',
    people: {
      memberEstimate: '10',
      invitationMode: 'secure-link',
      invitees: '',
    },
    governance: { ...ORGANIZATION_TEMPLATES[0].governance },
    branding: {
      displayName: branding.displayName,
      shortName: branding.shortName,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl ?? '',
    },
    address: {
      addressLine: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    },
    firstDecision: {
      kind: 'resolution',
      title: '',
      summary: '',
      closesInDays: '7',
    },
    updatedAt: new Date().toISOString(),
  }
}

function sanitizeDraft(value: unknown, fallback: OrganizationSetupDraft): OrganizationSetupDraft | null {
  if (!isRecord(value) || value.version !== DRAFT_VERSION || value.orgSlug !== fallback.orgSlug) return null
  const people = isRecord(value.people) ? value.people : {}
  const governance = isRecord(value.governance) ? value.governance : {}
  const branding = isRecord(value.branding) ? value.branding : {}
  const address = isRecord(value.address) ? value.address : {}
  const firstDecision = isRecord(value.firstDecision) ? value.firstDecision : {}
  const completedSteps = Array.isArray(value.completedSteps)
    ? [...new Set(value.completedSteps.filter((step): step is number => Number.isInteger(step) && Number(step) >= 0 && Number(step) < 5))].sort()
    : []
  const requestedStep = typeof value.currentStep === 'number' && Number.isInteger(value.currentStep)
    ? Math.min(5, Math.max(0, value.currentStep))
    : fallback.currentStep

  return {
    version: DRAFT_VERSION,
    orgSlug: fallback.orgSlug,
    currentStep: requestedStep,
    completedSteps,
    templateId: isTemplateId(value.templateId) ? value.templateId : fallback.templateId,
    people: {
      memberEstimate: cleanText(people.memberEstimate, 6, fallback.people.memberEstimate),
      invitationMode: isInvitationMode(people.invitationMode) ? people.invitationMode : fallback.people.invitationMode,
      invitees: cleanText(people.invitees, 4000),
    },
    governance: {
      quorumPercent: cleanText(governance.quorumPercent, 3, fallback.governance.quorumPercent),
      approvalPercent: cleanText(governance.approvalPercent, 3, fallback.governance.approvalPercent),
      committeeSize: cleanText(governance.committeeSize, 3, fallback.governance.committeeSize),
    },
    branding: {
      displayName: cleanText(branding.displayName, 80, fallback.branding.displayName),
      shortName: cleanText(branding.shortName, 24, fallback.branding.shortName),
      accentColor: cleanText(branding.accentColor, 7, fallback.branding.accentColor),
      logoUrl: cleanText(branding.logoUrl, 512),
    },
    address: {
      addressLine: cleanText(address.addressLine, 120),
      city: cleanText(address.city, 80),
      region: cleanText(address.region, 80),
      postalCode: cleanText(address.postalCode, 20),
      country: cleanText(address.country, 80),
    },
    firstDecision: {
      kind: isDecisionKind(firstDecision.kind) ? firstDecision.kind : fallback.firstDecision.kind,
      title: cleanText(firstDecision.title, 120),
      summary: cleanText(firstDecision.summary, 1000),
      closesInDays: cleanText(firstDecision.closesInDays, 2, fallback.firstDecision.closesInDays),
    },
    updatedAt: typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
      ? value.updatedAt
      : fallback.updatedAt,
  }
}

export function loadOrganizationSetupDraft(orgSlug: string, branding: OrganizationBranding) {
  const fallback = createOrganizationSetupDraft(orgSlug, branding)
  try {
    const stored = localStorage.getItem(draftKey(orgSlug))
    if (!stored) return fallback
    return sanitizeDraft(JSON.parse(stored) as unknown, fallback) ?? fallback
  } catch {
    return fallback
  }
}

export function saveOrganizationSetupDraft(draft: OrganizationSetupDraft) {
  try {
    localStorage.setItem(draftKey(draft.orgSlug), JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function applyOrganizationTemplate(
  draft: OrganizationSetupDraft,
  templateId: OrganizationTemplateId,
): OrganizationSetupDraft {
  const template = ORGANIZATION_TEMPLATES.find((item) => item.id === templateId) ?? ORGANIZATION_TEMPLATES[0]
  return {
    ...draft,
    templateId: template.id,
    governance: { ...template.governance },
  }
}

export function validateOrganizationSetupStep(draft: OrganizationSetupDraft, step: number): SetupErrors {
  const errors: SetupErrors = {}

  if (step === 0) {
    if (!isTemplateId(draft.templateId)) errors['template-options'] = 'required'
  }

  if (step === 1) {
    if (!validInteger(draft.people.memberEstimate, 1, 100000)) errors['people-member-estimate'] = 'out_of_range'
    const invitees = draft.people.invitees.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (invitees.length > 50) errors['people-invitees'] = 'too_many'
    else if (invitees.some((email) => email.length > 254 || !EMAIL.test(email))) errors['people-invitees'] = 'invalid_email'
  }

  if (step === 2) {
    if (!validInteger(draft.governance.quorumPercent, 1, 100)) errors['governance-quorum'] = 'out_of_range'
    if (!validInteger(draft.governance.approvalPercent, 50, 100)) errors['governance-approval'] = 'out_of_range'
    if (draft.templateId === 'simple-committee' && !validInteger(draft.governance.committeeSize, 3, 99)) {
      errors['governance-committee-size'] = 'out_of_range'
    }
  }

  if (step === 3) {
    if (!isSafeBrandText(draft.branding.displayName, 2, 80)) errors['branding-display-name'] = 'invalid'
    if (!isSafeBrandText(draft.branding.shortName, 2, 24)) errors['branding-short-name'] = 'invalid'
    if (!normalizeAccentColor(draft.branding.accentColor)) errors['branding-accent-color'] = 'invalid'
    if (normalizeLogoUrl(draft.branding.logoUrl) === null) errors['branding-logo-url'] = 'invalid'
    if (!validText(draft.address.addressLine, 3, 120)) errors['address-line'] = 'required'
    if (!validText(draft.address.city, 2, 80)) errors['address-city'] = 'required'
    if (draft.address.region && !validText(draft.address.region, 2, 80)) errors['address-region'] = 'invalid'
    if (!validText(draft.address.postalCode, 2, 20)) errors['address-postal-code'] = 'required'
    if (!validText(draft.address.country, 2, 80)) errors['address-country'] = 'required'
  }

  if (step === 4) {
    if (!validText(draft.firstDecision.title, 5, 120)) errors['decision-title'] = 'too_short'
    if (!validText(draft.firstDecision.summary, 20, 1000)) errors['decision-summary'] = 'too_short'
    if (!validInteger(draft.firstDecision.closesInDays, 1, 90)) errors['decision-closes'] = 'out_of_range'
  }

  if (step === 5 && !organizationSetupIsReady(draft)) errors['setup-incomplete'] = 'incomplete'
  return errors
}

export function organizationSetupIsReady(draft: OrganizationSetupDraft) {
  return [0, 1, 2, 3, 4].every((step) => (
    draft.completedSteps.includes(step)
    && Object.keys(validateOrganizationSetupStep(draft, step)).length === 0
  ))
}
