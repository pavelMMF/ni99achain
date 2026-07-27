const SITE_ADMIN_ROLES = new Set(['owner', 'governance_admin'])

export function resolveOrganizationPermissions({
  organizationRole = null,
  protectedCreator = false,
  legacyRole = 'voter',
  signerAccess = null,
  isDefaultOrganization = false,
} = {}) {
  const governanceSignerActive = signerAccess?.isAdmin === true
  const creatorSignerActive = signerAccess?.isCreator === true
  const membershipAdmin = SITE_ADMIN_ROLES.has(organizationRole)
  const membershipOwner = organizationRole === 'owner'
  const protectedDefaultCreator = isDefaultOrganization
    && protectedCreator === true
    && legacyRole === 'super_admin'

  return Object.freeze({
    isAdmin: membershipAdmin || governanceSignerActive || protectedDefaultCreator,
    isSuperAdmin: membershipOwner || protectedDefaultCreator,
    organizationRole,
    governanceSignerActive,
    creatorSignerActive,
  })
}