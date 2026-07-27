import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { closeStorage, initializeStorage, pool } from './lib/storage.mjs'
import { DEFAULT_ORGANIZATION_ID, initializeTenantStorage } from './lib/tenant-storage.mjs'

const suffix = randomBytes(5).toString('hex')
const organizationA = `org_isolation_a_${suffix}`
const organizationB = `org_isolation_b_${suffix}`
const slugA = `isolation-a-${suffix}`
const slugB = `isolation-b-${suffix}`
const userA = randomUUID()
const userB = randomUUID()
const addressA = `0x${randomBytes(32).toString('hex')}`
const addressB = `0x${randomBytes(32).toString('hex')}`

await initializeStorage()
await initializeTenantStorage()

const defaultOrganization = await pool.query('SELECT id, slug FROM organizations WHERE id = $1', [DEFAULT_ORGANIZATION_ID])
assert.equal(defaultOrganization.rows[0]?.slug, 'novyway', 'default organization must preserve the Novyway route')

const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query(
    `INSERT INTO users (id, aptos_address, provider, role, status, created_at, last_login_at)
     VALUES ($1, $2, 'wallet', 'voter', 'active', NOW(), NOW()),
            ($3, $4, 'wallet', 'voter', 'active', NOW(), NOW())`,
    [userA, addressA, userB, addressB],
  )
  await client.query(
    `INSERT INTO organizations (id, slug, name, status, visibility)
     VALUES ($1, $2, 'Isolation A', 'active', 'members_only'),
            ($3, $4, 'Isolation B', 'active', 'members_only')`,
    [organizationA, slugA, organizationB, slugB],
  )

  await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationA])
  await client.query(
    `INSERT INTO organization_memberships (organization_id, user_id, role, status, created_by)
     VALUES ($1, $2, 'owner', 'active', $2)`,
    [organizationA, userA],
  )
  await client.query(
    `INSERT INTO organization_settings (organization_id, locale, feature_json, updated_by)
     VALUES ($1, 'ru', '{"tenant":"a"}'::jsonb, $2)`,
    [organizationA, userA],
  )
  await client.query(
    `INSERT INTO organization_sponsor_wallets (
       organization_id, public_address, custody_kind, encrypted_private_key, status, created_by, updated_by
     ) VALUES ($1, $2, 'server_encrypted', 'v1.organization-a-secret', 'active', $3, $3)`,
    [organizationA, addressA, userA],
  )
  await client.query(
    `INSERT INTO organization_notification_integrations (
       organization_id, encrypted_token, bot_id, bot_username, enabled, verified_at, created_by, updated_by
     ) VALUES ($1, 'v1.organization-a-bot-secret', '10001', 'organization_a_bot', true, NOW(), $2, $2)`,
    [organizationA, userA],
  )

  await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationB])
  await client.query(
    `INSERT INTO organization_memberships (organization_id, user_id, role, status, created_by)
     VALUES ($1, $2, 'owner', 'active', $2)`,
    [organizationB, userB],
  )
  await client.query(
    `INSERT INTO organization_settings (organization_id, locale, feature_json, updated_by)
     VALUES ($1, 'en', '{"tenant":"b"}'::jsonb, $2)`,
    [organizationB, userB],
  )
  await client.query(
    `INSERT INTO organization_sponsor_wallets (
       organization_id, public_address, custody_kind, encrypted_private_key, status, created_by, updated_by
     ) VALUES ($1, $2, 'server_encrypted', 'v1.organization-b-secret', 'active', $3, $3)`,
    [organizationB, addressB, userB],
  )
  await client.query(
    `INSERT INTO organization_notification_integrations (
       organization_id, encrypted_token, bot_id, bot_username, enabled, verified_at, created_by, updated_by
     ) VALUES ($1, 'v1.organization-b-bot-secret', '10002', 'organization_b_bot', true, NOW(), $2, $2)`,
    [organizationB, userB],
  )

  await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationA])
  const visibleMemberships = await client.query('SELECT organization_id FROM organization_memberships ORDER BY organization_id')
  assert.deepEqual(visibleMemberships.rows, [{ organization_id: organizationA }])
  const visibleSponsors = await client.query('SELECT organization_id, encrypted_private_key FROM organization_sponsor_wallets')
  assert.deepEqual(visibleSponsors.rows, [{ organization_id: organizationA, encrypted_private_key: 'v1.organization-a-secret' }])
  const visibleNotificationSecrets = await client.query(
    'SELECT organization_id, encrypted_token FROM organization_notification_integrations',
  )
  assert.deepEqual(visibleNotificationSecrets.rows, [{
    organization_id: organizationA,
    encrypted_token: 'v1.organization-a-bot-secret',
  }])
  const crossTenantSettings = await client.query('SELECT organization_id FROM organization_settings WHERE organization_id = $1', [organizationB])
  assert.equal(crossTenantSettings.rowCount, 0, 'tenant A must not read tenant B settings')

  await client.query('SAVEPOINT rejected_cross_tenant_write')
  await assert.rejects(
    client.query(
      `INSERT INTO organization_audit_entries (id, organization_id, actor_user_id, kind, object_type)
       VALUES ($1, $2, $3, 'cross_tenant_attempt', 'test')`,
      [randomUUID(), organizationB, userA],
    ),
    /row-level security/i,
  )
  await client.query('ROLLBACK TO SAVEPOINT rejected_cross_tenant_write')

  await client.query("SELECT set_config('app.organization_id', '', true)")
  const noContextMemberships = await client.query('SELECT organization_id FROM organization_memberships')
  const noContextSponsors = await client.query('SELECT organization_id FROM organization_sponsor_wallets')
  const noContextNotificationSecrets = await client.query('SELECT organization_id FROM organization_notification_integrations')
  assert.equal(noContextMemberships.rowCount, 0, 'missing tenant context must fail closed')
  assert.equal(noContextSponsors.rowCount, 0, 'missing tenant context must hide sponsor material')
  assert.equal(noContextNotificationSecrets.rowCount, 0, 'missing tenant context must hide notification secrets')

  await client.query('ROLLBACK')
  console.log('Tenant PostgreSQL isolation checks passed.')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally {
  client.release()
  await closeStorage()
}
