import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  fallbackBrandingFor,
  parseOrganizationEnvelope,
  type OrganizationBranding,
  type VerifiedOrganizationConfig,
} from './organization'

export type OrganizationVerificationStatus = 'loading' | 'verified' | 'unverified' | 'invalid' | 'unavailable'

type OrganizationContextValue = {
  orgSlug: string
  branding: OrganizationBranding
  config: VerifiedOrganizationConfig | null
  access: VerifiedOrganizationConfig['access'] | null
  publicationStatus: 'published' | 'unpublished'
  verificationStatus: OrganizationVerificationStatus
  refresh: () => void
}
const OrganizationContext = createContext<OrganizationContextValue | null>(null)

export function OrganizationProvider({ orgSlug, children }: { orgSlug: string; children: ReactNode }) {
  const [config, setConfig] = useState<VerifiedOrganizationConfig | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<OrganizationVerificationStatus>('loading')
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setConfig(null)
    setVerificationStatus('loading')

    fetch(`/api/organizations/${encodeURIComponent(orgSlug)}/config`, {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) return { status: 'unavailable' as const, config: null }
        try {
          return parseOrganizationEnvelope(await response.json() as unknown, orgSlug)
        } catch {
          return { status: 'invalid' as const, config: null }
        }
      })
      .then((result) => {
        if (controller.signal.aborted) return
        if (result.status === 'verified') setConfig(result.config)
        setVerificationStatus(result.status)
      })
      .catch(() => {
        if (!controller.signal.aborted) setVerificationStatus('unavailable')
      })

    return () => controller.abort()
  }, [orgSlug, revision])

  const refresh = useCallback(() => setRevision((value) => value + 1), [])
  const fallbackBranding = useMemo(() => fallbackBrandingFor(orgSlug), [orgSlug])
  const value = useMemo<OrganizationContextValue>(() => ({
    orgSlug,
    config,
    branding: config?.branding ?? fallbackBranding,
    access: config?.access ?? null,
    publicationStatus: config?.publicationStatus ?? 'unpublished',
    verificationStatus,
    refresh,
  }), [config, fallbackBranding, orgSlug, refresh, verificationStatus])

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) throw new Error('useOrganization must be used inside OrganizationProvider')
  return context
}
