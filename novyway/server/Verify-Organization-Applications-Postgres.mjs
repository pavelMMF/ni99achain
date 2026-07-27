import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { closeStorage, initializeStorage, pool } from './lib/storage.mjs'
import {
  configureOrganizationNotificationIntegration,
  getOrganizationNotificationIntegration,
  initializeTenantStorage,
  loadOrganizationNotificationSecret,
  removeOrganizationNotificationIntegration,
} from './lib/tenant-storage.mjs'
import {
  createOrganizationApplication,
  getOrganizationApplicationForCreator,
  initializeOrganizationApplications,
  listOrganizationApplicationsForCreator,
  listOrganizationApplicationsForReview,
  purgeExpiredRejectedApplications,
  reviewOrganizationApplication,
  submitOrganizationApplication,
  updateOrganizationApplication,
} from './lib/organization-applications.mjs'

const runId = Date.now().toString(36)
const creatorUserId = randomUUID()
const reviewerUserId = randomUUID()
const creatorAddress = '0x' + Buffer.from(('creator-' + runId).padEnd(32, '0')).toString('hex').slice(0, 64)
const reviewerAddress = '0x' + Buffer.from(('reviewer-' + runId).padEnd(32, '0')).toString('hex').slice(0, 64)
const approvedSlug = ('verify-' + runId).slice(0, 60)
const rejectedSlug = ('reject-' + runId).slice(0, 60)
const approvedDescription = 'Private application used by the PostgreSQL lifecycle verifier.\nThis line verifies multiline descriptions.'
const applicationIds = []
const organizationIds = []

function completeSetup(application) {
  return {
    ...application.setup,
    version: 2,
    currentStep: 4,
    completedSteps: [0, 1, 2, 3],
    templateId: 'expert-weighted',
    people: {
      memberEstimate: '25',
      invitationMode: 'secure-link',
      invitees: '',
    },
    governance: {
      quorumPercent: '40',
      approvalPercent: '60',
      committeeSize: '7',
      decisionCategories: ['document_change', 'budget', 'advisory'],
      customDecisionCategory: '',
    },
    branding: {
      displayName: application.name,
      shortName: 'Verified org',
      accentColor: '#E64232',
      logoUrl: '',
    },
    address: {
      hasPhysicalAddress: true,
      publishAddress: false,
      addressLine: 'Test address 1',
      city: 'Minsk',
      region: 'Minsk',
      postalCode: '220000',
      country: 'Belarus',
    },
    contacts: {
      projectUrl: 'https://example.test/verified-organization',
      links: [{
        id: 'telegram',
        kind: 'telegram',
        label: '',
        url: 'https://t.me/example',
      }],
    },
    updatedAt: new Date().toISOString(),
  }
}

async function insertUser(id, address, email, role = 'voter') {
  await pool.query(
    `INSERT INTO users (
       id, aptos_address, display_name, email, email_verified, provider, role, status,
       created_at, last_login_at, wallet_kind
     ) VALUES ($1, $2, $3, $4, true, 'wallet', $5, 'active', NOW(), NOW(), 'external')`,
    [id, address, email.split('@')[0], email, role],
  )
}

async function deleteOrganizationWithTenantContext(organizationId) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationId])
    await client.query('DELETE FROM organization_audit_entries WHERE organization_id = $1', [organizationId])
    await client.query('DELETE FROM organization_settings WHERE organization_id = $1', [organizationId])
    await client.query('DELETE FROM organization_memberships WHERE organization_id = $1', [organizationId])
    await client.query('DELETE FROM organizations WHERE id = $1', [organizationId])
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function deleteMembershipsWithTenantContext(organizationId, userIds) {
  if (!userIds.length) return
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationId])
    await client.query(
      'DELETE FROM organization_memberships WHERE organization_id = $1 AND user_id = ANY($2::uuid[])',
      [organizationId, userIds],
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function cleanupStaleVerifierArtifacts() {
  const stale = await pool.query(
    `SELECT id FROM organizations
      WHERE slug LIKE 'verify-%'
        AND description LIKE 'Private application used by the PostgreSQL lifecycle verifier.%'`,
  )
  for (const row of stale.rows) await deleteOrganizationWithTenantContext(row.id)
  await pool.query(
    `DELETE FROM organization_applications
      WHERE description LIKE 'Private application used by the PostgreSQL lifecycle verifier.%'
         OR description = 'Application used to verify private rejection and timed deletion.'`,
  )
  const staleUsers = await pool.query(
    `SELECT id FROM users
      WHERE email LIKE '%@example.test'
        AND (email LIKE 'creator-%' OR email LIKE 'reviewer-%')`,
  )
  const staleUserIds = staleUsers.rows.map((row) => row.id)
  await deleteMembershipsWithTenantContext('org_novyway', staleUserIds)
  if (staleUserIds.length) await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [staleUserIds])
}

async function cleanup() {
  for (const organizationId of organizationIds) await deleteOrganizationWithTenantContext(organizationId)
  if (applicationIds.length) {
    await pool.query('DELETE FROM organization_applications WHERE id = ANY($1::uuid[])', [applicationIds])
  }
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [[creatorUserId, reviewerUserId]])
}

try {
  await initializeStorage()
  await initializeTenantStorage()
  await initializeOrganizationApplications()
  await cleanupStaleVerifierArtifacts()
  await insertUser(creatorUserId, creatorAddress, `creator-${runId}@example.test`)
  await insertUser(reviewerUserId, reviewerAddress, `reviewer-${runId}@example.test`)

  let approved = await createOrganizationApplication({
    creatorUserId,
    slug: approvedSlug,
    name: 'Verified organization',
    description: approvedDescription,
    visibility: 'members_only',
  })
  applicationIds.push(approved.id)
  assert.equal(approved.status, 'draft')
  assert.equal(approved.approvedHostname, null)
  assert.equal(approved.description, approvedDescription)

  await assert.rejects(
    submitOrganizationApplication({ applicationId: approved.id, creatorUserId, expectedRevision: approved.revision }),
    (error) => error?.status === 409 && error?.message === 'organization_application_incomplete',
  )

  approved = await updateOrganizationApplication({
    applicationId: approved.id,
    creatorUserId,
    expectedRevision: approved.revision,
    setup: completeSetup(approved),
  })
  approved = await submitOrganizationApplication({
    applicationId: approved.id,
    creatorUserId,
    expectedRevision: approved.revision,
  })
  assert.equal(approved.status, 'submitted')

  approved = await reviewOrganizationApplication({
    applicationId: approved.id,
    reviewerUserId,
    expectedRevision: approved.revision,
    decision: 'changes_requested',
    message: 'Please clarify the public project link before publication.',
  })
  assert.equal(approved.status, 'changes_requested')
  assert.equal(approved.canEdit, true)

  const revisedSetup = {
    ...approved.setup,
    contacts: {
      ...approved.setup.contacts,
      projectUrl: 'https://example.test/verified-organization/revised',
    },
  }
  approved = await updateOrganizationApplication({
    applicationId: approved.id,
    creatorUserId,
    expectedRevision: approved.revision,
    setup: revisedSetup,
  })
  approved = await submitOrganizationApplication({
    applicationId: approved.id,
    creatorUserId,
    expectedRevision: approved.revision,
  })
  approved = await reviewOrganizationApplication({
    applicationId: approved.id,
    reviewerUserId,
    expectedRevision: approved.revision,
    decision: 'approve',
    message: 'Approved by the lifecycle verifier.',
  })
  assert.equal(approved.status, 'approved')
  assert.equal(approved.approvedHostname, `${approvedSlug}.novyway.com`)
  organizationIds.push(approved.approvedOrganizationId)

  const organizationClient = await pool.connect()
  let organizationState
  try {
    await organizationClient.query('BEGIN')
    await organizationClient.query("SELECT set_config('app.organization_id', $1, true)", [approved.approvedOrganizationId])
    organizationState = await organizationClient.query(
      `SELECT organization.status, organization.visibility, domain.hostname, domain.verification_status,
              membership.role, membership.status AS membership_status,
              settings.governance_json, settings.feature_json
         FROM organizations organization
         JOIN organization_domains domain ON domain.organization_id = organization.id AND domain.is_primary
         JOIN organization_memberships membership ON membership.organization_id = organization.id AND membership.user_id = $2
         JOIN organization_settings settings ON settings.organization_id = organization.id
        WHERE organization.id = $1`,
      [approved.approvedOrganizationId, creatorUserId],
    )
    await organizationClient.query('COMMIT')
  } catch (error) {
    await organizationClient.query('ROLLBACK')
    throw error
  } finally {
    organizationClient.release()
  }
  assert.equal(organizationState.rowCount, 1)
  assert.equal(organizationState.rows[0].status, 'active')
  assert.equal(organizationState.rows[0].visibility, 'members_only')
  assert.equal(organizationState.rows[0].hostname, `${approvedSlug}.novyway.com`)
  assert.equal(organizationState.rows[0].verification_status, 'verified')
  assert.equal(organizationState.rows[0].role, 'owner')
  assert.equal(organizationState.rows[0].membership_status, 'active')
  assert.equal(Number(organizationState.rows[0].governance_json.quorumPercent), 40)
  assert.deepEqual(
    organizationState.rows[0].governance_json.decisionCategories,
    ['document_change', 'budget', 'advisory'],
  )
  assert.equal(organizationState.rows[0].feature_json.onboarding.address.publishAddress, false)
  assert.equal(organizationState.rows[0].feature_json.onboarding.address.addressLine, undefined)

  const notification = await configureOrganizationNotificationIntegration({
    organizationId: approved.approvedOrganizationId,
    actorUserId: creatorUserId,
    encryptedToken: 'v1.verifier-encrypted-token',
    botId: '123456789',
    botUsername: 'verified_org_bot',
    defaultChatId: '-1001234567890',
  })
  assert.equal(notification.botUsername, 'verified_org_bot')
  assert.equal(Object.hasOwn(notification, 'encryptedToken'), false)
  assert.equal(Object.hasOwn(notification, 'encrypted_token'), false)
  const publicNotification = await getOrganizationNotificationIntegration(approved.approvedOrganizationId)
  assert.equal(publicNotification.defaultChatId, '-1001234567890')
  const notificationSecret = await loadOrganizationNotificationSecret(approved.approvedOrganizationId)
  assert.equal(notificationSecret.encrypted_token, 'v1.verifier-encrypted-token')
  assert.equal(await removeOrganizationNotificationIntegration({
    organizationId: approved.approvedOrganizationId,
    actorUserId: creatorUserId,
  }), true)

  const creatorList = await listOrganizationApplicationsForCreator(creatorUserId)
  assert.equal(creatorList.some((item) => item.id === approved.id && item.status === 'approved'), true)
  const reviewList = await listOrganizationApplicationsForReview({ status: 'approved' })
  assert.equal(reviewList.some((item) => item.id === approved.id && item.creator.id === creatorUserId), true)

  let rejected = await createOrganizationApplication({
    creatorUserId,
    slug: rejectedSlug,
    name: 'Rejected organization',
    description: 'Application used to verify private rejection and timed deletion.',
    visibility: 'members_only',
  })
  applicationIds.push(rejected.id)
  rejected = await updateOrganizationApplication({
    applicationId: rejected.id,
    creatorUserId,
    expectedRevision: rejected.revision,
    setup: completeSetup(rejected),
  })
  rejected = await submitOrganizationApplication({
    applicationId: rejected.id,
    creatorUserId,
    expectedRevision: rejected.revision,
  })
  rejected = await reviewOrganizationApplication({
    applicationId: rejected.id,
    reviewerUserId,
    expectedRevision: rejected.revision,
    decision: 'reject',
    message: 'Rejected by the lifecycle verifier.',
  })
  assert.equal(rejected.status, 'rejected')
  assert.ok(rejected.rejectedPurgeAt)
  assert.equal(await getOrganizationApplicationForCreator(rejected.id, creatorUserId), null)
  assert.equal((await listOrganizationApplicationsForCreator(creatorUserId)).some((item) => item.id === rejected.id), false)
  assert.equal((await listOrganizationApplicationsForReview({ status: 'rejected' })).some((item) => item.id === rejected.id), true)

  await pool.query("UPDATE organization_applications SET rejected_purge_at = NOW() - INTERVAL '1 minute' WHERE id = $1", [rejected.id])
  assert.equal(await purgeExpiredRejectedApplications(), 1)
  assert.equal((await pool.query('SELECT 1 FROM organization_applications WHERE id = $1', [rejected.id])).rowCount, 0)
  applicationIds.splice(applicationIds.indexOf(rejected.id), 1)

  console.log(JSON.stringify({
    postgresLifecycle: true,
    changesRequestedEditable: true,
    approvalCreatesActiveTenant: true,
    verifiedSubdomainCreated: true,
    creatorBecomesOwner: true,
    notificationTokenRemainsServerOnly: true,
    rejectedHiddenImmediately: true,
    rejectedPurgedAfterRetention: true,
  }, null, 2))
} finally {
  try {
    await cleanup()
  } finally {
    await closeStorage()
  }
}
