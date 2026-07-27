import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { resolveOrganizationPermissions } from './lib/authorization.mjs'

const [sessionSource, shellSource, gateSource] = await Promise.all([
  readFile(resolve('src/auth/session.tsx'), 'utf8'),
  readFile(resolve('src/ui/layout/AppShell.tsx'), 'utf8'),
  readFile(resolve('src/ui/components/GovernanceAdminGate.tsx'), 'utf8'),
])

const protectedGoogleCreator = resolveOrganizationPermissions({
  organizationRole: 'owner',
  protectedCreator: true,
  legacyRole: 'super_admin',
  signerAccess: { isAdmin: false, isCreator: false },
  isDefaultOrganization: true,
})
assert.equal(protectedGoogleCreator.isAdmin, true)
assert.equal(protectedGoogleCreator.isSuperAdmin, true)
assert.equal(protectedGoogleCreator.governanceSignerActive, false)
assert.equal(protectedGoogleCreator.creatorSignerActive, false)

const creatorWallet = resolveOrganizationPermissions({
  organizationRole: 'owner',
  protectedCreator: true,
  legacyRole: 'super_admin',
  signerAccess: { isAdmin: true, isCreator: true },
  isDefaultOrganization: true,
})
assert.deepEqual(creatorWallet, {
  isAdmin: true,
  isSuperAdmin: true,
  organizationRole: 'owner',
  governanceSignerActive: true,
  creatorSignerActive: true,
})

const organizationAdmin = resolveOrganizationPermissions({
  organizationRole: 'governance_admin',
  signerAccess: { isAdmin: false, isCreator: false },
})
assert.equal(organizationAdmin.isAdmin, true)
assert.equal(organizationAdmin.isSuperAdmin, false)
assert.equal(organizationAdmin.governanceSignerActive, false)

const chainAdmin = resolveOrganizationPermissions({
  organizationRole: 'member',
  signerAccess: { isAdmin: true, isCreator: false },
  isDefaultOrganization: true,
})
assert.equal(chainAdmin.isAdmin, true)
assert.equal(chainAdmin.isSuperAdmin, false)

const ordinaryUser = resolveOrganizationPermissions({
  organizationRole: 'member',
  protectedCreator: false,
  legacyRole: 'voter',
  signerAccess: null,
  isDefaultOrganization: true,
})
assert.deepEqual(ordinaryUser, {
  isAdmin: false,
  isSuperAdmin: false,
  organizationRole: 'member',
  governanceSignerActive: false,
  creatorSignerActive: false,
})

assert.match(sessionSource, /organizationRole === 'owner'/, 'an organization owner must have website governance access')
assert.match(shellSource, /hasWebsiteGovernanceAccess\(user\)/, 'the sidebar must use website authorization')
assert.doesNotMatch(shellSource, /governanceSignerActive.*visibleServiceNav/s, 'menu visibility must not depend on an active wallet signer')
assert.match(gateSource, /legacyAvailable:/, 'legacy Aptos availability must be represented separately')
assert.doesNotMatch(gateSource, /if \(sessionLoading \|\| loading\)/, 'a legacy RPC wait must not block the website authorization boundary')
console.log(JSON.stringify({
  ok: true,
  creatorSiteAccessSeparatedFromSigner: true,
  organizationRolesSupported: true,
  ordinaryUserDenied: true,
}, null, 2))