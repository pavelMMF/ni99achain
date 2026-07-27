import { createDatabaseBackup, closeStorage, initializeStorage, pool } from './lib/storage.mjs'
import { initializeTenantStorage } from './lib/tenant-storage.mjs'
import { initializeOrganizationAccess } from './lib/organization-access.mjs'

const apply = process.argv.includes('--apply')
const verbose = process.argv.includes('--verbose')

const candidateSql = [
  'SELECT u.id, u.aptos_address, u.created_at',
  'FROM users u',
  "WHERE u.provider = 'wallet'",
  "  AND u.role = 'voter'",
  "  AND u.status = 'active'",
  "  AND u.wallet_kind = 'external'",
  '  AND u.email IS NULL',
  '  AND u.display_name IS NULL',
  '  AND u.telegram IS NULL',
  '  AND u.password_hash IS NULL',
  '  AND u.encrypted_private_key IS NULL',
  "  AND u.aptos_address = '0x' || replace(u.id::text, '-', '') || repeat('0', 32)",
  '  AND (SELECT COUNT(*) FROM user_wallets x WHERE x.user_id = u.id) = 1',
  '  AND EXISTS (',
  '    SELECT 1 FROM user_wallets x',
  '    WHERE x.user_id = u.id',
  '      AND x.aptos_address = u.aptos_address',
  "      AND x.kind = 'external'",
  "      AND x.provider = 'wallet'",
  '      AND x.is_primary = true',
  '  )',
  '  AND NOT EXISTS (SELECT 1 FROM auth_identities x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM email_verifications x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM sessions x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM vote_intents x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM document_proposals x WHERE x.created_by = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM document_proposal_supports x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM participant_activity x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM user_qualification_snapshots x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM logic_game_rounds x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM logic_game_attempts x WHERE x.user_id = u.id)',
  '  AND NOT EXISTS (SELECT 1 FROM logic_game_profiles x WHERE x.user_id = u.id)',
  'ORDER BY u.created_at',
].join('\n')

const candidateOrganizationSql = [
  'SELECT id, slug, created_at',
  'FROM organizations',
  "WHERE id ~ '^org_access_[0-9a-f]{10}$'",
  "  AND slug ~ '^access-[0-9a-f]{10}$'",
  "  AND name = 'Access verification'",
  "  AND description = ''",
  "  AND status = 'active'",
  "  AND visibility = 'members_only'",
  '  AND created_by IS NULL',
  '  AND aptos_module_address IS NULL',
  '  AND aptos_organization_address IS NULL',
  'ORDER BY created_at',
].join('\n')

function shortAddress(address) {
  return address.length > 18 ? address.slice(0, 10) + '...' + address.slice(-6) : address
}

await initializeStorage()
await initializeTenantStorage()
await initializeOrganizationAccess()

try {
  const [{ rows: candidates }, { rows: organizations }] = await Promise.all([
    pool.query(candidateSql),
    pool.query(candidateOrganizationSql),
  ])
  const expectedAccounts = organizations.length * 4
  const fixtureShapeValid = candidates.length === expectedAccounts

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run',
    candidates: candidates.length,
    testOrganizations: organizations.length,
    expectedAccounts,
    fixtureShapeValid,
    accounts: (verbose ? candidates : candidates.slice(0, 10)).map((row) => ({
      id: row.id,
      address: shortAddress(row.aptos_address),
      createdAt: row.created_at,
    })),
    accountsTruncated: !verbose && candidates.length > 10,
    organizations: (verbose ? organizations : organizations.slice(0, 10)),
    organizationsTruncated: !verbose && organizations.length > 10,
  }, null, 2))

  if (!apply || (candidates.length === 0 && organizations.length === 0)) {
    if (!apply) console.log('Dry run only. Re-run with --apply to create a backup and delete this exact fixture set.')
    process.exitCode = 0
  } else {
    if (!fixtureShapeValid || organizations.length === 0) {
      throw new Error('cleanup_fixture_shape_mismatch')
    }

    const backup = await createDatabaseBackup()
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const organizationIds = organizations.map((row) => row.id)
      const userIds = candidates.map((row) => row.id)

      const defaultOrganizationId = 'org_novyway'
      const allOrganizations = await client.query('SELECT id FROM organizations ORDER BY id')
      const candidateMemberships = []
      for (const organization of allOrganizations.rows) {
        await client.query("SELECT set_config('app.organization_id', $1, true)", [organization.id])
        const memberships = await client.query(
          'SELECT organization_id, user_id, role, status FROM organization_memberships WHERE user_id = ANY($1::uuid[])',
          [userIds],
        )
        candidateMemberships.push(...memberships.rows)
      }

      const testOrganizationSet = new Set(organizationIds)
      const allowedOrganizationSet = new Set([...organizationIds, defaultOrganizationId])
      const candidateUserSet = new Set(userIds)
      const membershipUserSet = new Set(candidateMemberships.map((row) => row.user_id))
      const defaultMemberships = candidateMemberships.filter((row) => row.organization_id === defaultOrganizationId)
      const expectedMemberships = candidates.length + organizations.length * 3
      const hasUnexpectedMembership = candidateMemberships.some((row) => !allowedOrganizationSet.has(row.organization_id))
      const defaultMembershipShapeValid = defaultMemberships.length === candidates.length
        && defaultMemberships.every((row) => row.role === 'member' && row.status === 'active')
      const testMembershipShapeValid = organizations.every((organization) => {
        const rows = candidateMemberships.filter((row) => row.organization_id === organization.id)
        const roles = rows.map((row) => row.role).sort().join(',')
        return rows.length === 3
          && roles === 'governance_admin,member,owner'
          && rows.every((row) => row.status === 'active')
      })
      if (
        hasUnexpectedMembership
        || candidateMemberships.length !== expectedMemberships
        || membershipUserSet.size !== candidateUserSet.size
        || !defaultMembershipShapeValid
        || !testMembershipShapeValid
      ) {
        throw new Error('cleanup_membership_shape_mismatch')
      }

      let deletedAuditEntries = 0
      let deletedSponsorUsage = 0
      let deletedMemberships = 0
      for (const organizationId of testOrganizationSet) {
        await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationId])
        const auditEntries = await client.query(
          'DELETE FROM organization_audit_entries WHERE organization_id = $1 RETURNING id',
          [organizationId],
        )
        const sponsorUsage = await client.query(
          'DELETE FROM organization_sponsor_usage WHERE organization_id = $1 RETURNING id',
          [organizationId],
        )
        const memberships = await client.query(
          'DELETE FROM organization_memberships WHERE organization_id = $1 AND user_id = ANY($2::uuid[]) RETURNING user_id',
          [organizationId, userIds],
        )
        deletedAuditEntries += auditEntries.rowCount
        deletedSponsorUsage += sponsorUsage.rowCount
        deletedMemberships += memberships.rowCount
      }
      await client.query("SELECT set_config('app.organization_id', $1, true)", [defaultOrganizationId])
      const defaultMembershipDeletion = await client.query(
        'DELETE FROM organization_memberships WHERE organization_id = $1 AND user_id = ANY($2::uuid[]) RETURNING user_id',
        [defaultOrganizationId, userIds],
      )
      deletedMemberships += defaultMembershipDeletion.rowCount
      if (deletedMemberships !== expectedMemberships) {
        throw new Error('cleanup_membership_count_mismatch:' + deletedMemberships + ':' + expectedMemberships)
      }
      await client.query("SELECT set_config('app.organization_id', '', true)")

      const deletedOrganizations = await client.query(
        'DELETE FROM organizations WHERE id = ANY($1::text[]) RETURNING id',
        [organizationIds],
      )
      if (deletedOrganizations.rowCount !== organizations.length) {
        throw new Error('cleanup_organization_count_mismatch:' + deletedOrganizations.rowCount + ':' + organizations.length)
      }

      const deletedUsers = await client.query(
        'DELETE FROM users WHERE id = ANY($1::uuid[]) RETURNING id',
        [userIds],
      )
      if (deletedUsers.rowCount !== candidates.length) {
        throw new Error('cleanup_user_count_mismatch:' + deletedUsers.rowCount + ':' + candidates.length)
      }

      await client.query('COMMIT')
      console.log(JSON.stringify({
        deletedAccounts: deletedUsers.rowCount,
        deletedTestOrganizations: deletedOrganizations.rowCount,
        deletedAuditEntries,
        deletedSponsorUsage,
        deletedMemberships,
        backup: {
          id: backup.id,
          path: backup.path,
          bytes: backup.bytes,
          sha256: backup.sha256,
        },
      }, null, 2))
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {})
      throw error
    } finally {
      client.release()
    }
  }
} finally {
  await closeStorage()
}
