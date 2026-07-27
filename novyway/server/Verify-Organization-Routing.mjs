import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import {
  legacyLocationTarget,
  organizationSlugFromHostname,
  resolveOrganizationRoute,
} from '../src/tenancy/organizationRoute.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tenantStorage = await readFile(resolve(root, 'server/lib/tenant-storage.mjs'), 'utf8')
const applicationStorage = await readFile(resolve(root, 'server/lib/organization-applications.mjs'), 'utf8')
const staticServer = await readFile(resolve(root, 'server/static-server.mjs'), 'utf8')
const routerSource = await readFile(resolve(root, 'src/tenancy/OrganizationRouter.tsx'), 'utf8')
const appSource = await readFile(resolve(root, 'src/App.tsx'), 'utf8')
const createScreen = await readFile(resolve(root, 'src/screens/OrganizationCreate.tsx'), 'utf8')

assert.equal(organizationSlugFromHostname('novyway.com'), null)
assert.equal(organizationSlugFromHostname('www.novyway.com'), null)
assert.equal(organizationSlugFromHostname('alpha.novyway.com'), 'alpha')
assert.equal(organizationSlugFromHostname('alpha.localhost'), 'alpha')
assert.equal(organizationSlugFromHostname('deep.alpha.novyway.com'), null)

assert.deepEqual(resolveOrganizationRoute('novyway.com', '/about'), {
  orgSlug: 'novyway',
  basename: '/',
})
assert.deepEqual(resolveOrganizationRoute('alpha.novyway.com', '/documents'), {
  orgSlug: 'alpha',
  basename: '/',
})
assert.deepEqual(resolveOrganizationRoute('localhost', '/o/alpha/documents'), {
  orgSlug: 'alpha',
  basename: '/o/alpha',
})

assert.equal(
  legacyLocationTarget('https:', 'novyway.com', '', '/', '', '#/about'),
  'https://novyway.com/about',
)
assert.equal(
  legacyLocationTarget('https:', 'novyway.com', '', '/', '', '#/o/alpha/documents?view=graph'),
  'https://alpha.novyway.com/documents?view=graph',
)
assert.equal(
  legacyLocationTarget('https:', 'alpha.novyway.com', '', '/', '', '#/o/beta/elections'),
  'https://alpha.novyway.com/elections',
)

const transactionHelper = tenantStorage.slice(
  tenantStorage.indexOf('async function withOrganizationTransaction'),
  tenantStorage.indexOf('async function requireMembershipRole'),
)
assert.doesNotMatch(transactionHelper, /platformHostname|normalizedSlug|createdBy/, 'generic tenant transactions must not create domains')

assert.match(tenantStorage, /normalizedHostname === 'novyway\.com' \|\| normalizedHostname\.endsWith\('\.novyway\.com'\)/, 'custom domains must not occupy the platform namespace')
assert.match(applicationStorage, /organization_application_events/, 'application revisions must have an audit trail')
assert.match(applicationStorage, /status = 'approved'/, 'approval must be persisted atomically')
assert.match(applicationStorage, /INTERVAL '30 days'/, 'rejected applications need bounded retention')
assert.match(staticServer, /organization_application_required/, 'the legacy direct-creation endpoint must be retired')
assert.match(staticServer, /requirePlatformSuperAdmin/, 'review endpoints must require the platform super administrator')
assert.match(staticServer, /\/api\/organization-applications/, 'creator application endpoints must be mounted')
assert.match(staticServer, /\/api\/platform\/organization-applications/, 'review endpoints must be mounted')
assert.match(routerSource, /BrowserRouter/, 'clean paths require BrowserRouter')
assert.doesNotMatch(routerSource, /HashRouter/, 'hash routing must not return')
assert.match(appSource, /organizations\/applications\/:applicationId\/setup/, 'the creator setup route must be mounted')
assert.match(appSource, /platform\/organization-applications/, 'the protected review route must be mounted')
assert.match(createScreen, /organization-applications/, 'organization creation must open a private application')
assert.match(createScreen, /csrfToken/, 'application creation must use the authenticated CSRF token')

console.log('Organization application and clean-route checks passed.')
