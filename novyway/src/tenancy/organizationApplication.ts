import type { OrganizationApplicationSetupDraft } from './organizationApplicationDraft'
import type { OrganizationVisibility } from './organization'

export type OrganizationApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'changes_requested'
  | 'approved'
  | 'rejected'

export type OrganizationApplicationEvent = {
  id: string
  kind: string
  fromStatus: OrganizationApplicationStatus | null
  toStatus: OrganizationApplicationStatus | null
  note: string | null
  createdAt: string
  actorUserId?: string | null
}

export type OrganizationApplication = {
  id: string
  slug: string
  name: string
  description: string
  visibility: OrganizationVisibility
  status: OrganizationApplicationStatus
  revision: number
  schemaVersion: number
  setup: OrganizationApplicationSetupDraft
  reviewMessage: string | null
  canEdit: boolean
  submittedAt: string | null
  reviewedAt: string | null
  approvedOrganizationId: string | null
  approvedHostname: string | null
  createdAt: string
  updatedAt: string
  events: OrganizationApplicationEvent[]
  creator?: {
    id: string
    email: string | null
    displayName: string | null
  }
  rejectedPurgeAt?: string | null
}

type ApiErrorIssue = {
  path?: Array<string | number>
  message?: string
}

type ApiErrorBody = {
  error?: string
  details?: ApiErrorIssue[]
}

export class OrganizationApplicationApiError extends Error {
  status: number
  details: ApiErrorIssue[]

  constructor(status: number, code: string, details: ApiErrorIssue[] = []) {
    super(code)
    this.name = 'OrganizationApplicationApiError'
    this.status = status
    this.details = details
  }
}

export async function organizationApplicationRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const body = await response.json().catch(() => ({})) as T & ApiErrorBody
  if (!response.ok) throw new OrganizationApplicationApiError(response.status, body.error || 'request_failed', body.details)
  return body
}

export function organizationWorkspaceUrl(slug: string, path = '/') {
  const suffix = path.startsWith('/') ? path : '/' + path
  const hostname = window.location.hostname.toLowerCase()
  const port = window.location.port ? ':' + window.location.port : ''
  if (hostname === 'novyway.com' || hostname === 'www.novyway.com') {
    return window.location.protocol + '//' + slug + '.novyway.com' + port + suffix
  }
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.localhost')) {
    return window.location.protocol + '//' + window.location.host + '/o/' + slug + suffix
  }
  return window.location.origin + '/o/' + slug + suffix
}

export function applicationStatusLabel(status: OrganizationApplicationStatus, ru: boolean) {
  const labels = ru ? {
    draft: 'Черновик',
    submitted: 'На рассмотрении',
    changes_requested: 'Нужна доработка',
    approved: 'Одобрена',
    rejected: 'Отклонена',
  } : {
    draft: 'Draft',
    submitted: 'Under review',
    changes_requested: 'Changes requested',
    approved: 'Approved',
    rejected: 'Rejected',
  }
  return labels[status]
}

export function applicationStatusTone(status: OrganizationApplicationStatus) {
  if (status === 'approved') return 'live'
  if (status === 'changes_requested') return 'warn'
  if (status === 'rejected') return 'crit'
  return status === 'submitted' ? 'cyan' : 'muted'
}
