import { randomUUID } from 'node:crypto'
import { pool } from './storage.mjs'

const ORG = /^org_[a-z0-9][a-z0-9_]{1,62}$/
const ROLE = /^[a-z][a-z0-9_]{1,47}$/
const RESOURCE_TYPES = new Set(['election', 'document', 'exam', 'workspace'])
const AUDIENCES = new Set(['public', 'member', 'roles'])
const RESOURCE_SCOPES = Object.freeze({
  election: ['discover', 'subject', 'participate', 'results', 'ballots'],
  document: ['discover', 'content'],
  exam: ['discover', 'content', 'participate', 'results'],
  workspace: ['discover', 'content'],
})
const OWNER_CAPABILITIES = ['access.roles.write', 'access.grants.write', 'access.rules.write', 'access.resources.write']

function cleanOrganizationId(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!ORG.test(normalized)) throw new Error('invalid_organization_id')
  return normalized
}

function cleanRoleKey(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!ROLE.test(normalized) || normalized === 'owner') throw new Error('invalid_access_role_key')
  return normalized
}

function cleanResourceType(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!RESOURCE_TYPES.has(normalized)) throw new Error('invalid_resource_type')
  return normalized
}

function cleanResourceId(value) {
  const normalized = String(value ?? '').trim()
  const hasForbiddenCharacter = [...normalized].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    return codePoint <= 31 || codePoint === 127 || character === '<' || character === '>'
  })
  if (!normalized || normalized.length > 200 || hasForbiddenCharacter) throw new Error('invalid_resource_id')
  return normalized
}

function cleanResourceScope(type, value = 'discover') {
  const normalizedType = cleanResourceType(type)
  const normalized = String(value ?? 'discover').trim().toLowerCase()
  if (!RESOURCE_SCOPES[normalizedType].includes(normalized)) throw new Error('invalid_resource_scope')
  return normalized
}

function normalizeAudiencePolicy(policy) {
  if (!policy || typeof policy !== 'object' || Array.isArray(policy)) throw new Error('invalid_resource_policy')
  const audience = String(policy.audience ?? '').trim().toLowerCase()
  if (!AUDIENCES.has(audience)) throw new Error('invalid_resource_audience')
  const requiredRoles = [...new Set((policy.requiredRoles ?? policy.required_roles ?? []).map(cleanRoleKey))]
  if (audience === 'roles' && requiredRoles.length === 0) throw new Error('required_roles_empty')
  return { audience, requiredRoles: audience === 'roles' ? requiredRoles : [] }
}

function normalizeScopePolicies(type, policies, discoverPolicy) {
  const normalizedType = cleanResourceType(type)
  const result = { discover: normalizeAudiencePolicy(discoverPolicy) }
  if (policies === null || policies === undefined) return result
  if (!policies || typeof policies !== 'object' || Array.isArray(policies)) throw new Error('invalid_resource_policies')
  for (const [scope, policy] of Object.entries(policies)) {
    const normalizedScope = cleanResourceScope(normalizedType, scope)
    result[normalizedScope] = normalizeAudiencePolicy(policy)
  }
  return result
}

function normalizeRule(rule) {
  if (rule === null || rule === undefined) return null
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) throw new Error('invalid_access_rule')
  const conditions = Array.isArray(rule.conditions) ? rule.conditions : []
  if (conditions.length > 20) throw new Error('access_rule_too_large')
  return {
    mode: rule.mode === 'any' ? 'any' : 'all',
    conditions: conditions.map((condition) => {
      if (condition?.kind === 'tenure_days_at_least') {
        const days = Number(condition.days)
        if (!Number.isInteger(days) || days < 0 || days > 36_500) throw new Error('invalid_tenure_days')
        return { kind: condition.kind, days }
      }
      if (condition?.kind === 'verified_exam_passed') {
        const examId = String(condition.examId ?? '').trim()
        const minScoreBps = Number(condition.minScoreBps ?? 0)
        if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(examId) || !Number.isInteger(minScoreBps) || minScoreBps < 0 || minScoreBps > 10_000) {
          throw new Error('invalid_exam_condition')
        }
        return { kind: condition.kind, examId, minScoreBps }
      }
      if (condition?.kind === 'qualification_level_at_least') {
        const categoryId = String(condition.categoryId ?? '').trim()
        const level = Number(condition.level)
        if (!/^\d+$/.test(categoryId) || !Number.isInteger(level) || level < 0 || level > 3) throw new Error('invalid_qualification_condition')
        return { kind: condition.kind, categoryId, level }
      }
      throw new Error('invalid_access_condition')
    }),
  }
}

async function withOrganization(organizationId, callback) {
  const id = cleanOrganizationId(organizationId)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT set_config('app.organization_id', $1, true)", [id])
    const result = await callback(client, id)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function membership(client, userId) {
  const { rows } = await client.query(
    'SELECT user_id, role, status, joined_at FROM organization_memberships WHERE user_id = $1',
    [userId],
  )
  return rows[0] ?? null
}

async function requireOwnerOrDelegation(client, actorUserId, roleKey, operation) {
  const actor = await membership(client, actorUserId)
  if (!actor || actor.status !== 'active') throw Object.assign(new Error('organization_membership_required'), { status: 403 })
  if (actor.role === 'owner') return actor
  if (actor.role !== 'governance_admin') throw Object.assign(new Error('organization_owner_required'), { status: 403 })
  const column = operation === 'grant' ? 'can_grant' : 'can_edit_rules'
  const { rows } = await client.query(
    `SELECT ${column} AS allowed FROM organization_access_delegations
      WHERE administrator_user_id = $1 AND role_key = $2`,
    [actorUserId, roleKey],
  )
  if (!rows[0]?.allowed) throw Object.assign(new Error('access_delegation_required'), { status: 403 })
  return actor
}

async function requireEvidenceManager(client, actorUserId) {
  const actor = await membership(client, actorUserId)
  if (!actor || actor.status !== 'active' || !['owner', 'qualification_manager'].includes(actor.role)) {
    throw Object.assign(new Error('qualification_manager_required'), { status: 403 })
  }
  return actor
}
async function bumpRevision(client, organizationId) {
  await client.query(
    'UPDATE organization_access_state SET revision = revision + 1, updated_at = NOW() WHERE organization_id = $1',
    [organizationId],
  )
}

async function audit(client, organizationId, actorUserId, kind, objectType, objectId, details = {}) {
  await client.query(
    `INSERT INTO organization_audit_entries
      (id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())`,
    [randomUUID(), organizationId, actorUserId, kind, objectType, objectId, JSON.stringify(details)],
  )
}

export async function initializeOrganizationAccess() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('novyway_organization_access_v1'))")
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_access_state (
        organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
        revision bigint NOT NULL DEFAULT 1 CHECK (revision >= 1),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS organization_access_roles (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_key text NOT NULL CHECK (role_key ~ '^[a-z][a-z0-9_]{1,47}$' AND role_key <> 'owner'),
        name_json jsonb NOT NULL,
        description_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        enabled boolean NOT NULL DEFAULT true,
        auto_rule_json jsonb,
        capabilities text[] NOT NULL DEFAULT '{}'::text[],
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (organization_id, role_key)
      );
      CREATE TABLE IF NOT EXISTS organization_access_grants (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_key text NOT NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        granted_by uuid REFERENCES users(id) ON DELETE SET NULL,
        granted_at timestamptz NOT NULL DEFAULT NOW(),
        expires_at timestamptz,
        revoked_at timestamptz,
        PRIMARY KEY (organization_id, role_key, user_id),
        FOREIGN KEY (organization_id, role_key) REFERENCES organization_access_roles(organization_id, role_key) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS organization_access_grants_user_idx
        ON organization_access_grants(organization_id, user_id, revoked_at, expires_at);
      CREATE TABLE IF NOT EXISTS organization_access_delegations (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        role_key text NOT NULL,
        administrator_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        can_grant boolean NOT NULL DEFAULT false,
        can_edit_rules boolean NOT NULL DEFAULT false,
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (organization_id, role_key, administrator_user_id),
        FOREIGN KEY (organization_id, role_key) REFERENCES organization_access_roles(organization_id, role_key) ON DELETE CASCADE,
        FOREIGN KEY (organization_id, administrator_user_id) REFERENCES organization_memberships(organization_id, user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS organization_resource_access (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        resource_type text NOT NULL CHECK (resource_type IN ('election', 'document', 'exam', 'workspace')),
        resource_id text NOT NULL CHECK (char_length(resource_id) BETWEEN 1 AND 200),
        audience text NOT NULL CHECK (audience IN ('public', 'member', 'roles')),
        required_roles text[] NOT NULL DEFAULT '{}'::text[],
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (organization_id, resource_type, resource_id)
      );
      ALTER TABLE organization_resource_access
        ADD COLUMN IF NOT EXISTS scope_policies jsonb NOT NULL DEFAULT '{}'::jsonb;
      CREATE TABLE IF NOT EXISTS organization_verified_exam_results (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        exam_id text NOT NULL CHECK (exam_id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
        score_bps integer NOT NULL CHECK (score_bps BETWEEN 0 AND 10000),
        verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
        passed_at timestamptz NOT NULL,
        evidence_hash text,
        PRIMARY KEY (organization_id, user_id, exam_id)
      );
      CREATE TABLE IF NOT EXISTS organization_verified_qualification_results (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        category_id text NOT NULL CHECK (category_id ~ '^[0-9]{1,20}$'),
        level integer NOT NULL CHECK (level BETWEEN 0 AND 3),
        eligible boolean NOT NULL DEFAULT true,
        verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
        verified_at timestamptz NOT NULL DEFAULT NOW(),
        evidence_hash text,
        PRIMARY KEY (organization_id, user_id, category_id)
      );
    `)
    const isolatedTables = [
      'organization_access_state',
      'organization_access_roles',
      'organization_access_grants',
      'organization_access_delegations',
      'organization_resource_access',
      'organization_verified_exam_results',
      'organization_verified_qualification_results',
    ]
    for (const table of isolatedTables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
      await client.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`)
      await client.query(`DROP POLICY IF EXISTS organization_isolation ON ${table}`)
      await client.query(`CREATE POLICY organization_isolation ON ${table}
        FOR ALL USING (organization_id = NULLIF(current_setting('app.organization_id', true), ''))
        WITH CHECK (organization_id = NULLIF(current_setting('app.organization_id', true), ''))`)
    }
    const { rows: organizations } = await client.query('SELECT id FROM organizations')
    for (const organization of organizations) {
      await client.query("SELECT set_config('app.organization_id', $1, true)", [organization.id])
      await client.query('INSERT INTO organization_access_state (organization_id) VALUES ($1) ON CONFLICT DO NOTHING', [organization.id])
    }
    await client.query('INSERT INTO schema_migrations (version, applied_at) VALUES (2026071902, NOW()) ON CONFLICT DO NOTHING')
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

async function evidenceFor(client, userId) {
  const memberResult = await client.query('SELECT role, status, joined_at FROM organization_memberships WHERE user_id = $1', [userId])
  const examsResult = await client.query('SELECT exam_id, score_bps FROM organization_verified_exam_results WHERE user_id = $1', [userId])
  const qualificationsResult = await client.query('SELECT category_id, level, eligible FROM organization_verified_qualification_results WHERE user_id = $1', [userId])
  return {
    membership: memberResult.rows[0] ?? null,
    exams: new Map(examsResult.rows.map((row) => [row.exam_id, Number(row.score_bps)])),
    qualifications: new Map(qualificationsResult.rows.filter((row) => row.eligible).map((row) => [row.category_id, Number(row.level)])),
  }
}

function conditionMatches(condition, evidence, now) {
  if (condition.kind === 'tenure_days_at_least') {
    if (!evidence.membership?.joined_at) return false
    return now - new Date(evidence.membership.joined_at).getTime() >= condition.days * 86_400_000
  }
  if (condition.kind === 'verified_exam_passed') return (evidence.exams.get(condition.examId) ?? -1) >= condition.minScoreBps
  if (condition.kind === 'qualification_level_at_least') return (evidence.qualifications.get(condition.categoryId) ?? -1) >= condition.level
  return false
}

function ruleMatches(rule, evidence) {
  if (!rule || !Array.isArray(rule.conditions) || rule.conditions.length === 0) return false
  const matches = rule.conditions.map((condition) => conditionMatches(condition, evidence, Date.now()))
  return rule.mode === 'any' ? matches.some(Boolean) : matches.every(Boolean)
}

export async function resolveOrganizationAccess(organizationId, userId = null) {
  return withOrganization(organizationId, async (client, id) => {
    const state = await client.query('SELECT revision FROM organization_access_state WHERE organization_id = $1', [id])
    const empty = { revision: Number(state.rows[0]?.revision ?? 1), member: false, owner: false, membershipRole: null, roles: [], capabilities: [] }
    if (!userId) return empty
    const evidence = await evidenceFor(client, userId)
    if (!evidence.membership || evidence.membership.status !== 'active') return empty
    const owner = evidence.membership.role === 'owner'
    const rolesResult = await client.query('SELECT role_key, auto_rule_json, capabilities FROM organization_access_roles WHERE enabled = true')
    const grantsResult = await client.query(
      `SELECT role_key FROM organization_access_grants
        WHERE user_id = $1 AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > NOW())`,
      [userId],
    )
    const effective = new Set(grantsResult.rows.map((row) => row.role_key))
    if (!owner) effective.add(evidence.membership.role)
    for (const row of rolesResult.rows) if (ruleMatches(row.auto_rule_json, evidence)) effective.add(row.role_key)
    const capabilities = new Set(owner ? OWNER_CAPABILITIES : [])
    for (const row of rolesResult.rows) {
      if (!effective.has(row.role_key)) continue
      for (const capability of row.capabilities ?? []) capabilities.add(capability)
    }
    return {
      revision: empty.revision,
      member: true,
      owner,
      membershipRole: evidence.membership.role,
      roles: [...effective].sort(),
      capabilities: [...capabilities].sort(),
    }
  })
}

export async function getAccessConsole(organizationId, actorUserId) {
  return withOrganization(organizationId, async (client, id) => {
    const actor = await membership(client, actorUserId)
    if (!actor || actor.status !== 'active' || !['owner', 'governance_admin'].includes(actor.role)) {
      throw Object.assign(new Error('organization_admin_required'), { status: 403 })
    }
    const state = await client.query('SELECT revision, updated_at FROM organization_access_state WHERE organization_id = $1', [id])
    const roles = await client.query('SELECT role_key, name_json, description_json, enabled, auto_rule_json, capabilities, created_at, updated_at FROM organization_access_roles ORDER BY role_key')
    const grants = await client.query('SELECT role_key, user_id, granted_by, granted_at, expires_at FROM organization_access_grants WHERE revoked_at IS NULL ORDER BY granted_at DESC')
    const delegations = await client.query('SELECT role_key, administrator_user_id, can_grant, can_edit_rules, updated_at FROM organization_access_delegations ORDER BY role_key')
    const resources = await client.query('SELECT resource_type, resource_id, audience, required_roles, scope_policies, updated_at FROM organization_resource_access ORDER BY resource_type, resource_id')
    const administrators = await client.query(`SELECT m.user_id, m.role, COALESCE(u.display_name, u.email, u.aptos_address) AS label
      FROM organization_memberships m JOIN users u ON u.id = m.user_id
      WHERE m.status = 'active' AND m.role IN ('owner', 'governance_admin') ORDER BY m.role, label`)
    const members = await client.query(`SELECT m.user_id, m.role, COALESCE(u.display_name, u.email, u.aptos_address) AS label
      FROM organization_memberships m JOIN users u ON u.id = m.user_id
      WHERE m.status = 'active' ORDER BY label, m.user_id`)
    const verifiedExams = await client.query('SELECT user_id, exam_id, score_bps, passed_at, evidence_hash FROM organization_verified_exam_results ORDER BY passed_at DESC')
    const verifiedQualifications = await client.query('SELECT user_id, category_id, level, eligible, verified_at, evidence_hash FROM organization_verified_qualification_results ORDER BY verified_at DESC')
    return {
      revision: Number(state.rows[0]?.revision ?? 1),
      updatedAt: state.rows[0]?.updated_at ?? null,
      actorRole: actor.role,
      roles: roles.rows.map((row) => ({
        key: row.role_key, name: row.name_json, description: row.description_json, enabled: row.enabled,
        autoRule: row.auto_rule_json, capabilities: row.capabilities ?? [], createdAt: row.created_at, updatedAt: row.updated_at,
      })),
      grants: grants.rows,
      delegations: delegations.rows,
      resources: resources.rows,
      administrators: administrators.rows,
      members: members.rows,
      verifiedExams: verifiedExams.rows,
      verifiedQualifications: verifiedQualifications.rows,
    }
  })
}

export async function putVerifiedExamResult({ organizationId, actorUserId, userId, examId, scoreBps, passedAt = new Date().toISOString(), evidenceHash = null }) {
  const normalizedExamId = String(examId ?? '').trim().toLowerCase()
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(normalizedExamId)) throw new Error('invalid_exam_id')
  if (!Number.isInteger(scoreBps) || scoreBps < 0 || scoreBps > 10_000) throw new Error('invalid_exam_score')
  return withOrganization(organizationId, async (client, id) => {
    await requireEvidenceManager(client, actorUserId)
    const target = await membership(client, userId)
    if (!target || target.status !== 'active') throw new Error('target_membership_required')
    await client.query(`INSERT INTO organization_verified_exam_results
      (organization_id, user_id, exam_id, score_bps, verified_by, passed_at, evidence_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (organization_id, user_id, exam_id) DO UPDATE SET
        score_bps = EXCLUDED.score_bps, verified_by = EXCLUDED.verified_by,
        passed_at = EXCLUDED.passed_at, evidence_hash = EXCLUDED.evidence_hash`,
    [id, userId, normalizedExamId, scoreBps, actorUserId, passedAt, evidenceHash])
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'verified_exam_updated', 'exam', normalizedExamId, { userId, scoreBps, evidenceHash })
  })
}

export async function putVerifiedQualificationResult({ organizationId, actorUserId, userId, categoryId, level, eligible = true, evidenceHash = null }) {
  const normalizedCategoryId = String(categoryId ?? '').trim()
  if (!/^[0-9]{1,20}$/.test(normalizedCategoryId)) throw new Error('invalid_category_id')
  if (!Number.isInteger(level) || level < 0 || level > 3) throw new Error('invalid_qualification_level')
  return withOrganization(organizationId, async (client, id) => {
    await requireEvidenceManager(client, actorUserId)
    const target = await membership(client, userId)
    if (!target || target.status !== 'active') throw new Error('target_membership_required')
    await client.query(`INSERT INTO organization_verified_qualification_results
      (organization_id, user_id, category_id, level, eligible, verified_by, verified_at, evidence_hash)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
      ON CONFLICT (organization_id, user_id, category_id) DO UPDATE SET
        level = EXCLUDED.level, eligible = EXCLUDED.eligible, verified_by = EXCLUDED.verified_by,
        verified_at = NOW(), evidence_hash = EXCLUDED.evidence_hash`,
    [id, userId, normalizedCategoryId, level, Boolean(eligible), actorUserId, evidenceHash])
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'verified_qualification_updated', 'qualification', normalizedCategoryId, { userId, level, eligible, evidenceHash })
  })
}
export async function putAccessRole({ organizationId, actorUserId, key, name, description = {}, enabled = true, autoRule = null, capabilities = [] }) {
  const normalizedKey = cleanRoleKey(key)
  const normalizedRule = normalizeRule(autoRule)
  return withOrganization(organizationId, async (client, id) => {
    const actor = await requireOwnerOrDelegation(client, actorUserId, normalizedKey, 'rules')
    const normalizedCapabilities = [...new Set(capabilities.map((value) => String(value).trim()).filter(Boolean))]
    if (actor.role !== 'owner' && normalizedCapabilities.length) throw Object.assign(new Error('owner_required_for_capabilities'), { status: 403 })
    const { rows } = await client.query(
      `INSERT INTO organization_access_roles
        (organization_id, role_key, name_json, description_json, enabled, auto_rule_json, capabilities, created_by, updated_by)
       VALUES ($1, $2, $3::jsonb, $4::jsonb, $5, $6::jsonb, $7, $8, $8)
       ON CONFLICT (organization_id, role_key) DO UPDATE SET
         name_json = EXCLUDED.name_json, description_json = EXCLUDED.description_json,
         enabled = EXCLUDED.enabled, auto_rule_json = EXCLUDED.auto_rule_json,
         capabilities = CASE WHEN $9 THEN EXCLUDED.capabilities ELSE organization_access_roles.capabilities END,
         updated_by = EXCLUDED.updated_by, updated_at = NOW()
       RETURNING role_key, name_json, description_json, enabled, auto_rule_json, capabilities, updated_at`,
      [id, normalizedKey, JSON.stringify(name), JSON.stringify(description), Boolean(enabled),
        normalizedRule === null ? null : JSON.stringify(normalizedRule), normalizedCapabilities, actorUserId, actor.role === 'owner'],
    )
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'access_role_updated', 'access_role', normalizedKey, { enabled, autoRule: normalizedRule })
    return rows[0]
  })
}

export async function putAccessGrant({ organizationId, actorUserId, key, userId, expiresAt = null }) {
  const normalizedKey = cleanRoleKey(key)
  return withOrganization(organizationId, async (client, id) => {
    await requireOwnerOrDelegation(client, actorUserId, normalizedKey, 'grant')
    const target = await membership(client, userId)
    if (!target || target.status !== 'active') throw new Error('target_membership_required')
    await client.query(
      `INSERT INTO organization_access_grants
        (organization_id, role_key, user_id, granted_by, granted_at, expires_at, revoked_at)
       VALUES ($1, $2, $3, $4, NOW(), $5, NULL)
       ON CONFLICT (organization_id, role_key, user_id) DO UPDATE SET
         granted_by = EXCLUDED.granted_by, granted_at = NOW(), expires_at = EXCLUDED.expires_at, revoked_at = NULL`,
      [id, normalizedKey, userId, actorUserId, expiresAt],
    )
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'access_role_granted', 'access_role', normalizedKey, { userId, expiresAt })
  })
}

export async function revokeAccessGrant({ organizationId, actorUserId, key, userId }) {
  const normalizedKey = cleanRoleKey(key)
  return withOrganization(organizationId, async (client, id) => {
    await requireOwnerOrDelegation(client, actorUserId, normalizedKey, 'grant')
    await client.query('UPDATE organization_access_grants SET revoked_at = NOW() WHERE role_key = $1 AND user_id = $2 AND revoked_at IS NULL', [normalizedKey, userId])
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'access_role_revoked', 'access_role', normalizedKey, { userId })
  })
}

export async function putAccessDelegation({ organizationId, actorUserId, key, administratorUserId, canGrant, canEditRules }) {
  const normalizedKey = cleanRoleKey(key)
  return withOrganization(organizationId, async (client, id) => {
    const actor = await membership(client, actorUserId)
    if (actor?.status !== 'active' || actor.role !== 'owner') throw Object.assign(new Error('organization_owner_required'), { status: 403 })
    const administrator = await membership(client, administratorUserId)
    if (administrator?.status !== 'active' || administrator.role !== 'governance_admin') throw new Error('governance_administrator_required')
    await client.query(
      `INSERT INTO organization_access_delegations
        (organization_id, role_key, administrator_user_id, can_grant, can_edit_rules, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (organization_id, role_key, administrator_user_id) DO UPDATE SET
         can_grant = EXCLUDED.can_grant, can_edit_rules = EXCLUDED.can_edit_rules, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
      [id, normalizedKey, administratorUserId, Boolean(canGrant), Boolean(canEditRules), actorUserId],
    )
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'access_delegation_updated', 'access_role', normalizedKey, { administratorUserId, canGrant, canEditRules })
  })
}

export async function putResourceAccess({ organizationId, actorUserId, type, id: rawId, audience, requiredRoles = [], policies = null }) {
  const normalizedType = cleanResourceType(type)
  const normalizedId = cleanResourceId(rawId)
  const normalizedPolicies = normalizeScopePolicies(normalizedType, policies, { audience, requiredRoles })
  const discover = normalizedPolicies.discover
  return withOrganization(organizationId, async (client, id) => {
    const actor = await membership(client, actorUserId)
    if (actor?.status !== 'active' || actor.role !== 'owner') throw Object.assign(new Error('organization_owner_required'), { status: 403 })
    await client.query(
      `INSERT INTO organization_resource_access
        (organization_id, resource_type, resource_id, audience, required_roles, scope_policies, updated_by, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
       ON CONFLICT (organization_id, resource_type, resource_id) DO UPDATE SET
         audience = EXCLUDED.audience, required_roles = EXCLUDED.required_roles, scope_policies = EXCLUDED.scope_policies,
         updated_by = EXCLUDED.updated_by, updated_at = NOW()` ,
      [id, normalizedType, normalizedId, discover.audience, discover.requiredRoles, JSON.stringify(normalizedPolicies), actorUserId],
    )
    await bumpRevision(client, id)
    await audit(client, id, actorUserId, 'resource_access_updated', normalizedType, normalizedId, { policies: normalizedPolicies })
  })
}

function storedPolicy(policy, type, scope) {
  if (!policy) return null
  const scoped = policy.scope_policies && typeof policy.scope_policies === 'object' ? policy.scope_policies : {}
  const explicit = scoped[scope]
  if (explicit) return normalizeAudiencePolicy(explicit)
  const discover = scoped.discover ?? { audience: policy.audience, requiredRoles: policy.required_roles ?? [] }
  return normalizeAudiencePolicy(discover)
}

function policyPermits(policy, access) {
  if (!policy || policy.audience === 'public') return true
  if (access.owner) return true
  if (policy.audience === 'member') return access.member
  return policy.requiredRoles.some((key) => access.roles.includes(key))
}

async function loadResourcePolicy(client, type, id) {
  const { rows } = await client.query(
    'SELECT resource_id, audience, required_roles, scope_policies FROM organization_resource_access WHERE resource_type = $1 AND resource_id = $2',
    [type, id],
  )
  return rows[0] ?? null
}

export async function getResourcePermissions({ organizationId, userId = null, type, id }) {
  const normalizedType = cleanResourceType(type)
  const normalizedId = cleanResourceId(id)
  const access = await resolveOrganizationAccess(organizationId, userId)
  return withOrganization(organizationId, async (client) => {
    const policy = await loadResourcePolicy(client, normalizedType, normalizedId)
    return Object.fromEntries(RESOURCE_SCOPES[normalizedType].map((scope) => [scope, policyPermits(storedPolicy(policy, normalizedType, scope), access)]))
  })
}

export async function filterAccessibleResourceIds({ organizationId, userId = null, type, ids, scope = 'discover' }) {
  const normalizedType = cleanResourceType(type)
  const normalizedScope = cleanResourceScope(normalizedType, scope)
  const normalizedIds = [...new Set(ids.map(cleanResourceId))].slice(0, 500)
  const access = await resolveOrganizationAccess(organizationId, userId)
  return withOrganization(organizationId, async (client) => {
    if (normalizedIds.length === 0) return []
    const { rows } = await client.query(
      'SELECT resource_id, audience, required_roles, scope_policies FROM organization_resource_access WHERE resource_type = $1 AND resource_id = ANY($2::text[])',
      [normalizedType, normalizedIds],
    )
    const policies = new Map(rows.map((row) => [row.resource_id, row]))
    return normalizedIds.filter((id) => policyPermits(storedPolicy(policies.get(id), normalizedType, normalizedScope), access))
  })
}

export async function requireResourceAccess({ organizationId, userId = null, type, id, scope = 'discover' }) {
  const allowed = await filterAccessibleResourceIds({ organizationId, userId, type, ids: [id], scope })
  if (allowed.length === 0) throw Object.assign(new Error('resource_access_denied'), { status: 403 })
}
