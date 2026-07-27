import { useLayoutEffect, type ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { OrganizationProvider } from './OrganizationContext'
import {
  resolveOrganizationRoute,
  type OrganizationRoute,
} from './organizationRoute'

export {
  canonicalizeOrganizationLocation,
  legacyLocationTarget,
  organizationSlugFromHostname,
  resolveOrganizationHash,
  resolveOrganizationRoute,
} from './organizationRoute'
export type { OrganizationRoute } from './organizationRoute'

export { canonicalizeOrganizationLocation as canonicalizeOrganizationHash } from './organizationRoute'

function scopedApiPath(pathname: string, orgSlug: string) {
  if (!pathname.startsWith('/api/')) return null
  if (
    pathname.startsWith('/api/o/')
    || pathname.startsWith('/api/organizations/')
    || pathname.startsWith('/api/organization-applications')
    || pathname.startsWith('/api/platform/')
  ) return null
  return '/api/o/' + encodeURIComponent(orgSlug) + pathname.slice('/api'.length)
}

function scopeFetchToOrganization(orgSlug: string) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string') {
      const scoped = scopedApiPath(input, orgSlug)
      return originalFetch(scoped ?? input, init)
    }

    if (input instanceof URL) {
      if (input.origin === window.location.origin) {
        const scoped = scopedApiPath(input.pathname, orgSlug)
        if (scoped) {
          const next = new URL(input.toString())
          next.pathname = scoped
          return originalFetch(next, init)
        }
      }
      return originalFetch(input, init)
    }

    if (input instanceof Request && input.url.startsWith(window.location.origin)) {
      const next = new URL(input.url)
      const scoped = scopedApiPath(next.pathname, orgSlug)
      if (scoped) {
        return originalFetch(new Request(window.location.origin + scoped + next.search, input), init)
      }
    }

    return originalFetch(input, init)
  }) as typeof window.fetch
  return () => { window.fetch = originalFetch }
}

export function OrganizationRouter({ initialRoute, children }: { initialRoute: OrganizationRoute; children: ReactNode }) {
  useLayoutEffect(() => scopeFetchToOrganization(initialRoute.orgSlug), [initialRoute.orgSlug])

  return (
    <BrowserRouter basename={initialRoute.basename === '/' ? undefined : initialRoute.basename}>
      <OrganizationProvider orgSlug={initialRoute.orgSlug}>{children}</OrganizationProvider>
    </BrowserRouter>
  )
}

export function currentOrganizationRoute() {
  return resolveOrganizationRoute(window.location.hostname, window.location.pathname)
}
