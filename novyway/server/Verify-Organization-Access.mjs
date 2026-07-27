import assert from 'node:assert/strict'
import { randomBytes, randomUUID } from 'node:crypto'
import { closeStorage, initializeStorage, pool } from './lib/storage.mjs'
import { initializeTenantStorage } from './lib/tenant-storage.mjs'
import {
  filterAccessibleResourceIds,
  getResourcePermissions,
  initializeOrganizationAccess,
  putAccessDelegation,
  putAccessGrant,
  putAccessRole,
  putResourceAccess,
  putVerifiedExamResult,
  putVerifiedQualificationResult,
  requireResourceAccess,
  resolveOrganizationAccess,
} from './lib/organization-access.mjs'

const suffix = randomBytes(5).toString('hex')
const organizationId = `org_access_${suffix}`
const ownerId = randomUUID()
const administratorId = randomUUID()
const memberId = randomUUID()
const outsiderId = randomUUID()
const users = [ownerId, administratorId, memberId, outsiderId]

await initializeStorage()
await initializeTenantStorage()

try {
  await pool.query(
    `INSERT INTO users (id, aptos_address, provider, role, status, created_at, last_login_at)
     VALUES ($1, $5, 'wallet', 'voter', 'active', NOW(), NOW()),
            ($2, $6, 'wallet', 'voter', 'active', NOW(), NOW()),
            ($3, $7, 'wallet', 'voter', 'active', NOW(), NOW()),
            ($4, $8, 'wallet', 'voter', 'active', NOW(), NOW())`,
    [...users, ...users.map((id) => `0x${id.replaceAll('-', '').padEnd(64, '0')}`)],
  )
  await pool.query(
    `INSERT INTO organizations (id, slug, name, status, visibility)
     VALUES ($1, $2, 'Access verification', 'active', 'members_only')`,
    [organizationId, `access-${suffix}`],
  )
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationId])
    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status, joined_at, created_by)
       VALUES ($1, $2, 'owner', 'active', NOW() - INTERVAL '90 days', $2),
              ($1, $3, 'governance_admin', 'active', NOW() - INTERVAL '30 days', $2),
              ($1, $4, 'member', 'active', NOW() - INTERVAL '20 days', $2)`,
      [organizationId, ownerId, administratorId, memberId],
    )
    await client.query('COMMIT')
  } finally {
    client.release()
  }

  await initializeOrganizationAccess()
  await putAccessRole({
    organizationId,
    actorUserId: ownerId,
    key: 'verified_member',
    name: { ru: 'Проверенный участник', en: 'Verified member' },
    autoRule: { mode: 'all', conditions: [{ kind: 'tenure_days_at_least', days: 14 }] },
  })
  assert.equal((await resolveOrganizationAccess(organizationId, ownerId)).owner, true)
  assert.deepEqual((await resolveOrganizationAccess(organizationId, memberId)).roles, ['member', 'verified_member'])
  assert.equal((await resolveOrganizationAccess(organizationId, administratorId)).roles.includes('governance_admin'), true)
  assert.equal((await resolveOrganizationAccess(organizationId, outsiderId)).member, false)

  await putAccessRole({
    organizationId,
    actorUserId: ownerId,
    key: 'qualified_reviewer',
    name: { ru: 'Квалифицированный рецензент', en: 'Qualified reviewer' },
    autoRule: {
      mode: 'all',
      conditions: [
        { kind: 'verified_exam_passed', examId: 'logic-l1', minScoreBps: 7000 },
        { kind: 'qualification_level_at_least', categoryId: '2', level: 2 },
      ],
    },
  })
  await putVerifiedExamResult({ organizationId, actorUserId: ownerId, userId: memberId, examId: 'logic-l1', scoreBps: 8200 })
  assert.equal((await resolveOrganizationAccess(organizationId, memberId)).roles.includes('qualified_reviewer'), false)
  await putVerifiedQualificationResult({ organizationId, actorUserId: ownerId, userId: memberId, categoryId: '2', level: 2 })
  assert.equal((await resolveOrganizationAccess(organizationId, memberId)).roles.includes('qualified_reviewer'), true)

  await putResourceAccess({
    organizationId,
    actorUserId: ownerId,
    type: 'election',
    id: 'layered-1',
    audience: 'public',
    requiredRoles: [],
    policies: {
      discover: { audience: 'public', requiredRoles: [] },
      subject: { audience: 'roles', requiredRoles: ['verified_member'] },
      participate: { audience: 'roles', requiredRoles: ['verified_member'] },
      results: { audience: 'public', requiredRoles: [] },
      ballots: { audience: 'public', requiredRoles: [] },
    },
  })
  assert.deepEqual(
    await filterAccessibleResourceIds({ organizationId, userId: outsiderId, type: 'election', ids: ['public-1', 'layered-1'], scope: 'discover' }),
    ['public-1', 'layered-1'],
  )
  assert.deepEqual(
    await filterAccessibleResourceIds({ organizationId, userId: outsiderId, type: 'election', ids: ['public-1', 'layered-1'], scope: 'subject' }),
    ['public-1'],
  )
  assert.deepEqual(
    await filterAccessibleResourceIds({ organizationId, userId: outsiderId, type: 'election', ids: ['public-1', 'layered-1'], scope: 'results' }),
    ['public-1', 'layered-1'],
  )
  assert.equal((await getResourcePermissions({ organizationId, userId: memberId, type: 'election', id: 'layered-1' })).participate, true)
  await assert.rejects(
    requireResourceAccess({ organizationId, userId: outsiderId, type: 'election', id: 'layered-1', scope: 'participate' }),
    (error) => error?.status === 403,
  )

  await putResourceAccess({
    organizationId,
    actorUserId: ownerId,
    type: 'election',
    id: 'admin-only',
    audience: 'roles',
    requiredRoles: ['governance_admin'],
    policies: {
      discover: { audience: 'roles', requiredRoles: ['governance_admin'] },
      subject: { audience: 'roles', requiredRoles: ['governance_admin'] },
      participate: { audience: 'roles', requiredRoles: ['governance_admin'] },
    },
  })
  assert.equal((await getResourcePermissions({ organizationId, userId: administratorId, type: 'election', id: 'admin-only' })).participate, true)
  assert.equal((await getResourcePermissions({ organizationId, userId: memberId, type: 'election', id: 'admin-only' })).discover, false)

  await putResourceAccess({
    organizationId,
    actorUserId: ownerId,
    type: 'document',
    id: 'public-output',
    audience: 'public',
    requiredRoles: [],
    policies: {
      discover: { audience: 'public', requiredRoles: [] },
      content: { audience: 'roles', requiredRoles: ['qualified_reviewer'] },
    },
  })
  assert.equal((await getResourcePermissions({ organizationId, userId: outsiderId, type: 'document', id: 'public-output' })).discover, true)
  assert.equal((await getResourcePermissions({ organizationId, userId: outsiderId, type: 'document', id: 'public-output' })).content, false)
  assert.equal((await getResourcePermissions({ organizationId, userId: memberId, type: 'document', id: 'public-output' })).content, true)
  await putAccessRole({
    organizationId,
    actorUserId: ownerId,
    key: 'reviewer',
    name: { ru: 'Рецензент', en: 'Reviewer' },
  })
  await putAccessDelegation({
    organizationId,
    actorUserId: ownerId,
    key: 'reviewer',
    administratorUserId: administratorId,
    canGrant: true,
    canEditRules: false,
  })
  await putAccessGrant({ organizationId, actorUserId: administratorId, key: 'reviewer', userId: memberId })
  assert.deepEqual((await resolveOrganizationAccess(organizationId, memberId)).roles, ['member', 'qualified_reviewer', 'reviewer', 'verified_member'])
  await assert.rejects(
    putAccessRole({ organizationId, actorUserId: administratorId, key: 'reviewer', name: { ru: 'Иное', en: 'Changed' } }),
    (error) => error?.status === 403,
  )

  console.log('Organization access policy checks passed.')
} finally {
  await pool.query('DELETE FROM organizations WHERE id = $1', [organizationId]).catch(() => {})
  await pool.query('DELETE FROM users WHERE id = ANY($1::uuid[])', [users]).catch(() => {})
  await closeStorage()
}
