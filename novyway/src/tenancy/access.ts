import { useCallback, useEffect, useState } from 'react'

export type ResourceType = 'election' | 'document' | 'exam' | 'workspace'
export type ResourceScope = 'discover' | 'subject' | 'participate' | 'results' | 'ballots' | 'content'
export type ResourceAudiencePolicy = { audience: 'public' | 'member' | 'roles'; requiredRoles: string[] }
export type ResourcePermissions = Partial<Record<ResourceScope, boolean>>
export type AccessCondition =
  | { kind: 'tenure_days_at_least'; days: number }
  | { kind: 'verified_exam_passed'; examId: string; minScoreBps: number }
  | { kind: 'qualification_level_at_least'; categoryId: string; level: number }

export type AccessRole = {
  key: string
  name: { ru: string; en: string }
  description: { ru: string; en: string }
  enabled: boolean
  autoRule: { mode: 'all' | 'any'; conditions: AccessCondition[] } | null
  capabilities: string[]
}

export type AccessConsole = {
  revision: number
  actorRole: 'owner' | 'governance_admin'
  roles: AccessRole[]
  grants: Array<{ role_key: string; user_id: string; granted_at: string; expires_at: string | null }>
  delegations: Array<{ role_key: string; administrator_user_id: string; can_grant: boolean; can_edit_rules: boolean }>
  resources: Array<{ resource_type: ResourceType; resource_id: string; audience: string; required_roles: string[]; scope_policies?: Partial<Record<ResourceScope, ResourceAudiencePolicy>> }>
  administrators: Array<{ user_id: string; role: string; label: string }>
  members: Array<{ user_id: string; role: string; label: string }>
  verifiedExams: Array<{ user_id: string; exam_id: string; score_bps: number; passed_at: string; evidence_hash: string | null }>
  verifiedQualifications: Array<{ user_id: string; category_id: string; level: number; eligible: boolean; verified_at: string; evidence_hash: string | null }>
}

type AccessEnvelope = { access: AccessConsole }

async function request<T>(url: string, init: RequestInit = {}, csrfToken?: string | null): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null
    throw new Error(body?.error ?? `HTTP ${response.status}`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export function useAccessConsole(enabled: boolean) {
  const [data, setData] = useState<AccessConsole | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const result = await request<AccessEnvelope>('/api/organization/access')
      setData(result.access)
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'access_console_unavailable')
    } finally {
      setLoading(false)
    }
  }, [enabled])
  useEffect(() => { void refresh() }, [refresh])
  return { data, loading, error, refresh }
}

export function saveAccessRole(role: AccessRole, csrfToken: string) {
  return request('/api/organization/access/roles', { method: 'PUT', body: JSON.stringify(role) }, csrfToken)
}

export function saveAccessGrant(input: { key: string; userId: string; expiresAt?: string | null }, csrfToken: string) {
  return request('/api/organization/access/grants', { method: 'PUT', body: JSON.stringify({ expiresAt: null, ...input }) }, csrfToken)
}

export function revokeAccessGrant(input: { key: string; userId: string }, csrfToken: string) {
  return request('/api/organization/access/grants', { method: 'DELETE', body: JSON.stringify(input) }, csrfToken)
}

export function saveAccessDelegation(input: { key: string; administratorUserId: string; canGrant: boolean; canEditRules: boolean }, csrfToken: string) {
  return request('/api/organization/access/delegations', { method: 'PUT', body: JSON.stringify(input) }, csrfToken)
}

export function saveResourceAccess(input: { type: ResourceType; id: string; audience: ResourceAudiencePolicy['audience']; requiredRoles: string[]; policies?: Partial<Record<ResourceScope, ResourceAudiencePolicy>> }, csrfToken: string) {
  return request('/api/organization/access/resources', { method: 'PUT', body: JSON.stringify(input) }, csrfToken)
}

export function saveVerifiedExam(input: { userId: string; examId: string; scoreBps: number; passedAt?: string; evidenceHash?: string | null }, csrfToken: string) {
  return request('/api/organization/access/evidence/exams', { method: 'PUT', body: JSON.stringify(input) }, csrfToken)
}

export function saveVerifiedQualification(input: { userId: string; categoryId: string; level: number; eligible: boolean; evidenceHash?: string | null }, csrfToken: string) {
  return request('/api/organization/access/evidence/qualifications', { method: 'PUT', body: JSON.stringify(input) }, csrfToken)
}
export async function filterAccessibleIds(type: ResourceType, ids: string[], scope: ResourceScope = 'discover') {
  if (ids.length === 0) return []
  const result = await request<{ ids: string[] }>('/api/organization/access/filter', {
    method: 'POST',
    body: JSON.stringify({ type, ids, scope }),
  })
  return result.ids
}

export function useAccessibleIds(type: ResourceType, ids: string[], scope: ResourceScope = 'discover') {
  const signature = ids.join('\u0000')
  const [allowed, setAllowed] = useState<Set<string> | null>(ids.length === 0 ? new Set() : null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    const requestedIds = signature ? signature.split('\u0000') : []
    if (requestedIds.length === 0) {
      setAllowed(new Set())
      setError(null)
      return () => { active = false }
    }
    setAllowed(null)
    void filterAccessibleIds(type, requestedIds, scope).then((result) => {
      if (active) {
        setAllowed(new Set(result))
        setError(null)
      }
    }).catch((reason) => {
      if (active) {
        setAllowed(new Set())
        setError(reason instanceof Error ? reason.message : 'access_filter_unavailable')
      }
    })
    return () => { active = false }
  }, [type, scope, signature])
  return { allowed, error, loading: allowed === null }
}

export function useResourcePermissions(type: ResourceType, id: string) {
  const [permissions, setPermissions] = useState<ResourcePermissions | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    setPermissions(null)
    void checkResourcePermissions(type, id).then((result) => {
      if (active) {
        setPermissions(result)
        setError(null)
      }
    }).catch((reason) => {
      if (active) {
        setPermissions({ discover: false })
        setError(reason instanceof Error ? reason.message : 'access_check_unavailable')
      }
    })
    return () => { active = false }
  }, [id, type])
  return { permissions, allowed: permissions?.discover ?? null, error, loading: permissions === null }
}

export function useResourceAccess(type: ResourceType, id: string, scope: ResourceScope = 'discover') {
  const resource = useResourcePermissions(type, id)
  return { ...resource, allowed: resource.permissions?.[scope] ?? null }
}

export async function checkResourcePermissions(type: ResourceType, id: string) {
  if (!id) return { discover: false } as ResourcePermissions
  const response = await fetch(`/api/organization/access/resources/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, {
    credentials: 'same-origin',
    cache: 'no-store',
  })
  if (response.status === 403) return { discover: false } as ResourcePermissions
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const body = await response.json() as { permissions?: ResourcePermissions }
  return body.permissions ?? { discover: true }
}

export async function checkResourceAccess(type: ResourceType, id: string, scope: ResourceScope = 'discover') {
  const permissions = await checkResourcePermissions(type, id)
  return permissions[scope] ?? false
}