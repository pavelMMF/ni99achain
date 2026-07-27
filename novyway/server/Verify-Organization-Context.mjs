import assert from 'node:assert/strict'
import {
  enforceOrganizationOrigin,
  organizationApiTarget,
  requestTarget,
  resolveOrganizationRequest,
} from './lib/organization-context.mjs'

const organizations = new Map([
  ['novyway', { id: 'org_novyway', slug: 'novyway', status: 'active' }],
  ['alpha', { id: 'org_alpha', slug: 'alpha', status: 'active' }],
  ['beta', { id: 'org_beta', slug: 'beta', status: 'active' }],
])
const domains = new Map([
  ['alpha.example.org', organizations.get('alpha')],
  ['beta.example.org', organizations.get('beta')],
])

function request(host, headers = {}, remoteAddress = '127.0.0.1') {
  return { headers: { host, ...headers }, socket: { remoteAddress } }
}

async function resolve(host, pathname, headers = {}, remoteAddress = '127.0.0.1') {
  return resolveOrganizationRequest({
    request: request(host, headers, remoteAddress),
    url: new URL(`https://${host}${pathname}`),
    findBySlug: async (slug) => organizations.get(slug) ?? null,
    findByDomain: async (domain) => domains.get(domain) ?? null,
  })
}

assert.deepEqual(organizationApiTarget('/api/config'), { slug: null, apiPath: '/api/config' })
assert.deepEqual(organizationApiTarget('/api/o/alpha/v1/participants'), {
  slug: 'alpha',
  apiPath: '/api/v1/participants',
})

const root = await resolve('novyway.com', '/api/config')
assert.equal(root.organizationId, 'org_novyway')
assert.equal(root.explicit, false)

const pathScoped = await resolve('novyway.com', '/api/o/alpha/v1/participants')
assert.equal(pathScoped.organizationId, 'org_alpha')
assert.equal(pathScoped.url.pathname, '/api/v1/participants')

const domainScoped = await resolve('alpha.example.org', '/api/config')
assert.equal(domainScoped.organizationId, 'org_alpha')
assert.equal(domainScoped.explicit, true)

await assert.rejects(
  resolve('alpha.example.org', '/api/o/beta/v1/participants'),
  (error) => error.message === 'organization_domain_mismatch' && error.status === 403,
)
await assert.rejects(
  resolve('unknown.example.org', '/api/config'),
  (error) => error.message === 'organization_not_found' && error.status === 404,
)
await assert.rejects(
  resolve('novyway.com', '/api/o/INVALID!/config'),
  (error) => error.message === 'invalid_organization_slug' && error.status === 400,
)

assert.throws(
  () => requestTarget(request('novyway.com', { 'x-forwarded-host': 'alpha.example.org' }, '203.0.113.8')),
  (error) => error.message === 'untrusted_forwarded_host' && error.status === 400,
)

assert.doesNotThrow(() => enforceOrganizationOrigin(
  request('alpha.example.org', { origin: 'https://alpha.example.org' }),
  domainScoped,
))
assert.throws(
  () => enforceOrganizationOrigin(request('alpha.example.org', { origin: 'https://beta.example.org' }), domainScoped),
  (error) => error.message === 'invalid_origin' && error.status === 403,
)

console.log('Organization request isolation checks passed.')
