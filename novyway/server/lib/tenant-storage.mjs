import { randomUUID } from 'node:crypto'
import { pool } from './storage.mjs'

export const DEFAULT_ORGANIZATION_ID = 'org_novyway'
export const DEFAULT_ORGANIZATION_SLUG = 'novyway'

const ORGANIZATION_ID_PATTERN = /^org_[a-z0-9][a-z0-9_]{1,62}$/
const ORGANIZATION_SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}$/
const HOSTNAME_PATTERN = /^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/
const APTOS_ADDRESS_PATTERN = /^0x[0-9a-f]{64}$/
const ORGANIZATION_ROLES = new Set([
  'owner',
  'governance_admin',
  'qualification_manager',
  'content_editor',
  'member',
  'auditor',
])
const SPONSOR_STATUSES = new Set(['reserved', 'submitted', 'confirmed', 'failed', 'expired'])
const RESERVED_ORGANIZATION_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'assets', 'auth', 'cdn', 'mail', 'novyway', 'status', 'static', 'support', 'operator', 'ops',
])

function requireOrganizationId(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!ORGANIZATION_ID_PATTERN.test(normalized)) throw new Error('invalid_organization_id')
  return normalized
}

function requireOrganizationSlug(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!ORGANIZATION_SLUG_PATTERN.test(normalized)) throw new Error('invalid_organization_slug')
  return normalized
}

function requireHostname(value) {
  const normalized = String(value ?? '').trim().toLowerCase().replace(/\.$/, '')
  if (!HOSTNAME_PATTERN.test(normalized)) throw new Error('invalid_organization_hostname')
  return normalized
}

function requireAptosAddress(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!APTOS_ADDRESS_PATTERN.test(normalized)) throw new Error('invalid_aptos_address')
  return normalized
}

function requireRole(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!ORGANIZATION_ROLES.has(normalized)) throw new Error('invalid_organization_role')
  return normalized
}

function requireNonNegativeInteger(value, name) {
  const normalized = Number(value)
  if (!Number.isSafeInteger(normalized) || normalized < 0) throw new Error(`invalid_${name}`)
  return normalized
}

function requirePositiveInteger(value, name) {
  const normalized = Number(value)
  if (!Number.isSafeInteger(normalized) || normalized < 1) throw new Error(`invalid_${name}`)
  return normalized
}

function publicOrganization(row) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    status: row.status,
    visibility: row.visibility,
    brand: row.brand_json ?? {},
    aptos: {
      network: row.aptos_network,
      moduleAddress: row.aptos_module_address,
      organizationAddress: row.aptos_organization_address,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }
}

function publicMembership(row) {
  if (!row) return null
  return {
    organizationId: row.organization_id,
    userId: row.user_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
    updatedAt: row.updated_at,
  }
}

function publicSponsor(row) {
  if (!row) return null
  return {
    organizationId: row.organization_id,
    publicAddress: row.public_address,
    custodyKind: row.custody_kind,
    status: row.status,
    limits: {
      perTransactionOctas: Number(row.per_transaction_limit_octas),
      perUserDailyOctas: Number(row.per_user_daily_limit_octas),
      dailyBudgetOctas: Number(row.daily_budget_octas),
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function publicNotificationIntegration(row) {
  if (!row) return null
  return {
    organizationId: row.organization_id,
    provider: row.provider,
    botId: row.bot_id,
    botUsername: row.bot_username,
    defaultChatId: row.default_chat_id,
    enabled: Boolean(row.enabled),
    verifiedAt: row.verified_at,
    updatedAt: row.updated_at,
  }
}

async function setOrganizationContext(client, organizationId) {
  await client.query("SELECT set_config('app.organization_id', $1, true)", [requireOrganizationId(organizationId)])
}

async function withOrganizationTransaction(organizationId, callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await setOrganizationContext(client, organizationId)
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function requireMembershipRole(client, userId, allowedRoles) {
  const result = await client.query(
    `SELECT organization_id, user_id, role, status, joined_at, updated_at
       FROM organization_memberships
      WHERE user_id = $1 AND status = 'active'`,
    [userId],
  )
  const membership = result.rows[0]
  if (!membership) throw Object.assign(new Error('organization_membership_required'), { status: 403 })
  if (!allowedRoles.includes(membership.role)) {
    throw Object.assign(new Error('organization_role_required'), { status: 403 })
  }
  return membership
}

export async function initializeTenantStorage() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('novyway_tenant_schema_v2'))")
    await client.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id text PRIMARY KEY CHECK (id ~ '^org_[a-z0-9][a-z0-9_]{1,62}$'),
        slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
        name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
        description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'suspended', 'archived')),
        visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'members_only')),
        brand_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        aptos_network text NOT NULL DEFAULT 'testnet' CHECK (aptos_network IN ('testnet', 'mainnet', 'devnet', 'local')),
        aptos_module_address text CHECK (aptos_module_address IS NULL OR aptos_module_address ~ '^0x[0-9a-f]{64}$'),
        aptos_organization_address text CHECK (aptos_organization_address IS NULL OR aptos_organization_address ~ '^0x[0-9a-f]{64}$'),
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        published_at timestamptz
      );

      CREATE TABLE IF NOT EXISTS organization_domains (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        hostname text NOT NULL CHECK (hostname = LOWER(hostname) AND hostname ~ '^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$'),
        verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
        is_primary boolean NOT NULL DEFAULT false,
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        verified_at timestamptz,
        PRIMARY KEY (organization_id, hostname),
        UNIQUE (hostname)
      );
      CREATE UNIQUE INDEX IF NOT EXISTS organization_domains_one_primary_idx
        ON organization_domains(organization_id) WHERE is_primary;

      CREATE TABLE IF NOT EXISTS organization_memberships (
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        role text NOT NULL CHECK (role IN ('owner', 'governance_admin', 'qualification_manager', 'content_editor', 'member', 'auditor')),
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended', 'left')),
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        joined_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        PRIMARY KEY (organization_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS organization_memberships_user_idx
        ON organization_memberships(user_id, status, updated_at DESC);
      CREATE INDEX IF NOT EXISTS organization_memberships_role_idx
        ON organization_memberships(organization_id, role, status);

      CREATE TABLE IF NOT EXISTS organization_settings (
        organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
        locale text NOT NULL DEFAULT 'ru' CHECK (locale IN ('ru', 'en')),
        governance_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        qualification_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        feature_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version >= 1),
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS organization_sponsor_wallets (
        organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
        public_address text NOT NULL CHECK (public_address ~ '^0x[0-9a-f]{64}$'),
        custody_kind text NOT NULL CHECK (custody_kind IN ('server_encrypted', 'external')),
        encrypted_private_key text,
        external_key_reference text,
        status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'depleted', 'revoked')),
        per_transaction_limit_octas bigint NOT NULL DEFAULT 1000000 CHECK (per_transaction_limit_octas >= 0),
        per_user_daily_limit_octas bigint NOT NULL DEFAULT 5000000 CHECK (per_user_daily_limit_octas >= 0),
        daily_budget_octas bigint NOT NULL DEFAULT 100000000 CHECK (daily_budget_octas >= 0),
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW(),
        CHECK (
          (custody_kind = 'server_encrypted' AND encrypted_private_key IS NOT NULL AND external_key_reference IS NULL)
          OR
          (custody_kind = 'external' AND encrypted_private_key IS NULL AND external_key_reference IS NOT NULL)
        )
      );
      CREATE UNIQUE INDEX IF NOT EXISTS organization_sponsor_wallets_address_idx
        ON organization_sponsor_wallets(public_address);

      CREATE TABLE IF NOT EXISTS organization_sponsor_usage (
        id uuid PRIMARY KEY,
        organization_id text NOT NULL,
        user_id uuid,
        idempotency_key uuid NOT NULL,
        intent_kind text NOT NULL CHECK (intent_kind IN ('weighted_vote', 'admin_equal_vote', 'qualification', 'governance')),
        reserved_octas bigint NOT NULL CHECK (reserved_octas >= 0),
        actual_octas bigint CHECK (actual_octas IS NULL OR actual_octas >= 0),
        status text NOT NULL CHECK (status IN ('reserved', 'submitted', 'confirmed', 'failed', 'expired')),
        tx_hash text CHECK (tx_hash IS NULL OR tx_hash ~ '^0x[0-9a-f]{64}$'),
        error_code text,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        submitted_at timestamptz,
        confirmed_at timestamptz,
        FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE RESTRICT,
        FOREIGN KEY (organization_id, user_id) REFERENCES organization_memberships(organization_id, user_id) ON DELETE RESTRICT,
        UNIQUE (organization_id, idempotency_key)
      );
      CREATE INDEX IF NOT EXISTS organization_sponsor_usage_daily_idx
        ON organization_sponsor_usage(organization_id, created_at DESC, status);
      CREATE INDEX IF NOT EXISTS organization_sponsor_usage_user_idx
        ON organization_sponsor_usage(organization_id, user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS organization_notification_integrations (
        organization_id text PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
        provider text NOT NULL DEFAULT 'telegram' CHECK (provider = 'telegram'),
        encrypted_token text NOT NULL,
        bot_id text NOT NULL CHECK (char_length(bot_id) BETWEEN 1 AND 40),
        bot_username text NOT NULL CHECK (char_length(bot_username) BETWEEN 2 AND 80),
        default_chat_id text CHECK (default_chat_id IS NULL OR char_length(default_chat_id) BETWEEN 5 AND 64),
        enabled boolean NOT NULL DEFAULT true,
        verified_at timestamptz NOT NULL,
        created_by uuid REFERENCES users(id) ON DELETE SET NULL,
        updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS organization_audit_entries (
        id uuid PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
        actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        kind text NOT NULL CHECK (char_length(kind) BETWEEN 2 AND 80),
        object_type text NOT NULL CHECK (char_length(object_type) BETWEEN 2 AND 80),
        object_id text CHECK (object_id IS NULL OR char_length(object_id) <= 200),
        details_json jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at timestamptz NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS organization_audit_entries_time_idx
        ON organization_audit_entries(organization_id, created_at DESC);
    `)
    await client.query(`
      ALTER TABLE organization_sponsor_wallets
        ALTER COLUMN per_transaction_limit_octas SET DEFAULT 1000000,
        ALTER COLUMN per_user_daily_limit_octas SET DEFAULT 5000000,
        ALTER COLUMN daily_budget_octas SET DEFAULT 100000000;
      UPDATE organization_sponsor_wallets
         SET per_transaction_limit_octas = GREATEST(per_transaction_limit_octas, 1000000);
    `)

    await setOrganizationContext(client, DEFAULT_ORGANIZATION_ID)
    await client.query(
      `INSERT INTO organizations (
         id, slug, name, description, status, visibility, aptos_network,
         aptos_module_address, created_by, created_at, updated_at, published_at
       )
       SELECT $1, $2, 'Новый Путь', 'Проверяемые решения и открытое управление.', 'active', 'public', 'testnet',
              NULL, id, NOW(), NOW(), NOW()
         FROM users
        WHERE role = 'super_admin'
        ORDER BY created_at ASC
        LIMIT 1
       ON CONFLICT (id) DO NOTHING`,
      [DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_SLUG],
    )
    await client.query(
      `INSERT INTO organizations (
         id, slug, name, description, status, visibility, aptos_network, created_at, updated_at, published_at
       ) VALUES ($1, $2, 'Новый Путь', 'Проверяемые решения и открытое управление.', 'active', 'public', 'testnet', NOW(), NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [DEFAULT_ORGANIZATION_ID, DEFAULT_ORGANIZATION_SLUG],
    )
    await client.query(
      `INSERT INTO organization_settings (organization_id, locale, governance_json, qualification_json, feature_json, schema_version, updated_at)
       VALUES ($1, 'ru', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 1, NOW())
       ON CONFLICT (organization_id) DO NOTHING`,
      [DEFAULT_ORGANIZATION_ID],
    )
    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status, created_by, joined_at, updated_at)
       SELECT $1, id,
              CASE WHEN role = 'super_admin' THEN 'owner'
                   WHEN role = 'admin' THEN 'governance_admin'
                   ELSE 'member' END,
              CASE WHEN status = 'active' THEN 'active' ELSE 'suspended' END,
              (SELECT id FROM users WHERE role = 'super_admin' ORDER BY created_at ASC LIMIT 1),
              created_at, NOW()
         FROM users
       ON CONFLICT (organization_id, user_id) DO UPDATE
         SET role = CASE
               WHEN EXCLUDED.role = 'owner' THEN 'owner'
               WHEN organization_memberships.role <> 'owner' THEN EXCLUDED.role
               ELSE organization_memberships.role
             END,
             status = EXCLUDED.status,
             updated_at = NOW()`,
      [DEFAULT_ORGANIZATION_ID],
    )

    const isolatedTables = [
      'organization_memberships',
      'organization_settings',
      'organization_sponsor_wallets',
      'organization_sponsor_usage',
      'organization_notification_integrations',
      'organization_audit_entries',
    ]
    for (const table of isolatedTables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`)
      await client.query(`ALTER TABLE ${table} FORCE ROW LEVEL SECURITY`)
      await client.query(`DROP POLICY IF EXISTS organization_isolation ON ${table}`)
      await client.query(`CREATE POLICY organization_isolation ON ${table}
        FOR ALL
        USING (organization_id = NULLIF(current_setting('app.organization_id', true), ''))
        WITH CHECK (organization_id = NULLIF(current_setting('app.organization_id', true), ''))`)
    }

    await client.query(
      `INSERT INTO schema_migrations (version, applied_at)
       VALUES (2026071901, NOW()) ON CONFLICT (version) DO NOTHING`,
    )
    await client.query(
      `INSERT INTO schema_migrations (version, applied_at)
       VALUES (2026072401, NOW()) ON CONFLICT (version) DO NOTHING`,
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function findOrganizationBySlug(slug) {
  const result = await pool.query('SELECT * FROM organizations WHERE slug = $1', [requireOrganizationSlug(slug)])
  return publicOrganization(result.rows[0])
}

export async function findOrganizationByDomain(hostname) {
  const result = await pool.query(
    `SELECT organization.*
       FROM organization_domains domain
       JOIN organizations organization ON organization.id = domain.organization_id
      WHERE domain.hostname = $1 AND domain.verification_status = 'verified'`,
    [requireHostname(hostname)],
  )
  return publicOrganization(result.rows[0])
}

export async function getOrganizationById(organizationId) {
  const result = await pool.query('SELECT * FROM organizations WHERE id = $1', [requireOrganizationId(organizationId)])
  return publicOrganization(result.rows[0])
}

export async function getOrganizationConfig(organizationId) {
  const normalizedId = requireOrganizationId(organizationId)
  return withOrganizationTransaction(normalizedId, async (client) => {
    const result = await client.query(
      `SELECT organization.*, settings.locale, settings.governance_json, settings.qualification_json,
              settings.feature_json, settings.schema_version,
              sponsor.public_address AS sponsor_public_address, sponsor.status AS sponsor_status,
              sponsor.per_transaction_limit_octas, sponsor.per_user_daily_limit_octas, sponsor.daily_budget_octas
         FROM organizations organization
         LEFT JOIN organization_settings settings ON settings.organization_id = organization.id
         LEFT JOIN organization_sponsor_wallets sponsor ON sponsor.organization_id = organization.id
        WHERE organization.id = $1`,
      [normalizedId],
    )
    const row = result.rows[0]
    if (!row) return null
    return {
      organization: publicOrganization(row),
      locale: row.locale ?? 'ru',
      governance: row.governance_json ?? {},
      qualification: row.qualification_json ?? {},
      features: row.feature_json ?? {},
      schemaVersion: row.schema_version ?? 1,
      sponsor: row.sponsor_public_address ? publicSponsor({
        organization_id: normalizedId,
        public_address: row.sponsor_public_address,
        custody_kind: 'redacted',
        status: row.sponsor_status,
        per_transaction_limit_octas: row.per_transaction_limit_octas,
        per_user_daily_limit_octas: row.per_user_daily_limit_octas,
        daily_budget_octas: row.daily_budget_octas,
      }) : null,
    }
  })
}

export async function getOrganizationMembership(organizationId, userId) {
  return withOrganizationTransaction(organizationId, async (client) => {
    const result = await client.query(
      `SELECT organization_id, user_id, role, status, joined_at, updated_at
         FROM organization_memberships WHERE user_id = $1`,
      [userId],
    )
    return publicMembership(result.rows[0])
  })
}

export async function syncDefaultOrganizationMembership({ userId, role = 'owner' }) {
  const normalizedRole = requireRole(role)
  if (!['owner', 'governance_admin'].includes(normalizedRole)) throw new Error('invalid_default_organization_role')
  return withOrganizationTransaction(DEFAULT_ORGANIZATION_ID, async (client) => {
    const result = await client.query(
      `INSERT INTO organization_memberships (
         organization_id, user_id, role, status, created_by, joined_at, updated_at
       ) VALUES ($1, $2, $3, 'active', $2, NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO UPDATE
         SET role = CASE
               WHEN EXCLUDED.role = 'owner' THEN 'owner'
               WHEN organization_memberships.role <> 'owner' THEN EXCLUDED.role
               ELSE organization_memberships.role
             END,
             status = 'active',
             updated_at = NOW()
       RETURNING organization_id, user_id, role, status, joined_at, updated_at`,
      [DEFAULT_ORGANIZATION_ID, userId, normalizedRole],
    )
    return publicMembership(result.rows[0])
  })
}
export async function listOrganizationsForUser(userId) {
  const organizations = await pool.query("SELECT id FROM organizations WHERE status <> 'archived' ORDER BY created_at")
  const memberships = []
  for (const organization of organizations.rows) {
    const membership = await getOrganizationMembership(organization.id, userId)
    if (membership?.status === 'active') memberships.push({ organization: await getOrganizationById(organization.id), membership })
  }
  return memberships
}

export async function createOrganization({ slug, name, description = '', visibility = 'public', createdBy }) {
  const normalizedSlug = requireOrganizationSlug(slug)
  if (RESERVED_ORGANIZATION_SLUGS.has(normalizedSlug)) throw new Error('reserved_organization_slug')
  const organizationId = requireOrganizationId(`org_${normalizedSlug.replaceAll('-', '_')}`)
  const normalizedName = String(name ?? '').trim()
  const normalizedDescription = String(description ?? '').trim()
  if (normalizedName.length < 2 || normalizedName.length > 120) throw new Error('invalid_organization_name')
  if (normalizedDescription.length > 2000) throw new Error('invalid_organization_description')
  if (!['public', 'unlisted', 'members_only'].includes(visibility)) throw new Error('invalid_organization_visibility')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const inserted = await client.query(
      `INSERT INTO organizations (id, slug, name, description, visibility, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [organizationId, normalizedSlug, normalizedName, normalizedDescription, visibility, createdBy],
    )
    await setOrganizationContext(client, organizationId)
    const platformHostname = normalizedSlug + '.novyway.com'
    await client.query(
      `INSERT INTO organization_domains (
         organization_id, hostname, verification_status, is_primary, created_by, verified_at
       ) VALUES ($1, $2, 'verified', true, $3, NOW())`,
      [organizationId, platformHostname, createdBy],
    )
    await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status, created_by, joined_at, updated_at)
       VALUES ($1, $2, 'owner', 'active', $2, NOW(), NOW())`,
      [organizationId, createdBy],
    )
    await client.query(
      `INSERT INTO organization_settings (organization_id, locale, governance_json, qualification_json, feature_json, updated_by, updated_at)
       VALUES ($1, 'ru', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, $2, NOW())`,
      [organizationId, createdBy],
    )
    await client.query(
      `INSERT INTO organization_audit_entries (id, organization_id, actor_user_id, kind, object_type, object_id, details_json)
       VALUES ($1, $2, $3, 'organization_created', 'organization', $2, $4::jsonb)`,
      [randomUUID(), organizationId, createdBy, JSON.stringify({ slug: normalizedSlug, hostname: platformHostname })],
    )
    await client.query('COMMIT')
    return publicOrganization(inserted.rows[0])
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function updateOrganizationProfile({
  organizationId,
  actorUserId,
  name,
  description,
  visibility,
  brand,
  status,
  aptosNetwork,
  aptosModuleAddress,
  aptosOrganizationAddress,
}) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedName = name === undefined ? null : String(name).trim()
  const normalizedDescription = description === undefined ? null : String(description).trim()
  if (normalizedName !== null && (normalizedName.length < 2 || normalizedName.length > 120)) throw new Error('invalid_organization_name')
  if (normalizedDescription !== null && normalizedDescription.length > 2000) throw new Error('invalid_organization_description')
  if (visibility !== undefined && !['public', 'unlisted', 'members_only'].includes(visibility)) throw new Error('invalid_organization_visibility')
  if (status !== undefined && !['draft', 'active', 'suspended'].includes(status)) throw new Error('invalid_organization_status')
  if (aptosNetwork !== undefined && !['testnet', 'mainnet', 'devnet', 'local'].includes(aptosNetwork)) throw new Error('invalid_aptos_network')
  const normalizedModule = aptosModuleAddress === undefined || aptosModuleAddress === null ? null : requireAptosAddress(aptosModuleAddress)
  const normalizedOrganizationAddress = aptosOrganizationAddress === undefined || aptosOrganizationAddress === null
    ? null
    : requireAptosAddress(aptosOrganizationAddress)

  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner'])
    const result = await client.query(
      `UPDATE organizations
          SET name = COALESCE($2, name),
              description = COALESCE($3, description),
              visibility = COALESCE($4, visibility),
              brand_json = COALESCE($5::jsonb, brand_json),
              status = COALESCE($6, status),
              aptos_network = COALESCE($7, aptos_network),
              aptos_module_address = CASE WHEN $8::boolean THEN $9 ELSE aptos_module_address END,
              aptos_organization_address = CASE WHEN $10::boolean THEN $11 ELSE aptos_organization_address END,
              published_at = CASE WHEN $6 = 'active' THEN COALESCE(published_at, NOW()) ELSE published_at END,
              updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [
        normalizedId,
        normalizedName,
        normalizedDescription,
        visibility ?? null,
        brand === undefined ? null : JSON.stringify(brand),
        status ?? null,
        aptosNetwork ?? null,
        aptosModuleAddress !== undefined,
        normalizedModule,
        aptosOrganizationAddress !== undefined,
        normalizedOrganizationAddress,
      ],
    )
    return publicOrganization(result.rows[0])
  })
}

export async function updateOrganizationSettings({ organizationId, actorUserId, locale, governance, qualification, features }) {
  const normalizedId = requireOrganizationId(organizationId)
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner', 'governance_admin'])
    const result = await client.query(
      `UPDATE organization_settings
          SET locale = COALESCE($2, locale),
              governance_json = COALESCE($3::jsonb, governance_json),
              qualification_json = COALESCE($4::jsonb, qualification_json),
              feature_json = COALESCE($5::jsonb, feature_json),
              schema_version = schema_version + 1,
              updated_by = $1,
              updated_at = NOW()
        WHERE organization_id = $6
        RETURNING locale, governance_json, qualification_json, feature_json, schema_version, updated_at`,
      [
        actorUserId,
        locale ?? null,
        governance === undefined ? null : JSON.stringify(governance),
        qualification === undefined ? null : JSON.stringify(qualification),
        features === undefined ? null : JSON.stringify(features),
        normalizedId,
      ],
    )
    return result.rows[0] ?? null
  })
}

export async function addOrganizationMember({ organizationId, actorUserId, userId, role = 'member' }) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedRole = requireRole(role)
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner', 'governance_admin'])
    if (normalizedRole === 'owner') await requireMembershipRole(client, actorUserId, ['owner'])
    const result = await client.query(
      `INSERT INTO organization_memberships (organization_id, user_id, role, status, created_by, joined_at, updated_at)
       VALUES ($1, $2, $3, 'active', $4, NOW(), NOW())
       ON CONFLICT (organization_id, user_id) DO UPDATE
         SET role = EXCLUDED.role, status = 'active', created_by = EXCLUDED.created_by, updated_at = NOW()
       RETURNING organization_id, user_id, role, status, joined_at, updated_at`,
      [normalizedId, userId, normalizedRole, actorUserId],
    )
    return publicMembership(result.rows[0])
  })
}

export async function registerOrganizationDomain({ organizationId, actorUserId, hostname, isPrimary = false }) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedHostname = requireHostname(hostname)
  if (normalizedHostname === 'novyway.com' || normalizedHostname.endsWith('.novyway.com')) {
    throw Object.assign(new Error('platform_domain_reserved'), { status: 409 })
  }
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner'])
    if (isPrimary) await client.query('UPDATE organization_domains SET is_primary = false WHERE organization_id = $1', [normalizedId])
    const result = await client.query(
      `INSERT INTO organization_domains (organization_id, hostname, verification_status, is_primary, created_by)
       VALUES ($1, $2, 'pending', $3, $4)
       ON CONFLICT (organization_id, hostname) DO UPDATE
         SET is_primary = EXCLUDED.is_primary
       RETURNING organization_id, hostname, verification_status, is_primary, created_at, verified_at`,
      [normalizedId, normalizedHostname, Boolean(isPrimary), actorUserId],
    )
    return result.rows[0]
  })
}

export async function configureOrganizationSponsor({
  organizationId,
  actorUserId,
  publicAddress,
  encryptedPrivateKey = null,
  externalKeyReference = null,
  perTransactionLimitOctas = 1_000_000,
  perUserDailyLimitOctas = 5_000_000,
  dailyBudgetOctas = 100_000_000,
}) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedAddress = requireAptosAddress(publicAddress)
  const custodyKind = encryptedPrivateKey ? 'server_encrypted' : 'external'
  if (custodyKind === 'external' && !String(externalKeyReference ?? '').trim()) throw new Error('external_key_reference_required')
  const limits = {
    perTransaction: requireNonNegativeInteger(perTransactionLimitOctas, 'per_transaction_limit_octas'),
    perUserDaily: requireNonNegativeInteger(perUserDailyLimitOctas, 'per_user_daily_limit_octas'),
    daily: requireNonNegativeInteger(dailyBudgetOctas, 'daily_budget_octas'),
  }
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner'])
    const result = await client.query(
      `INSERT INTO organization_sponsor_wallets (
         organization_id, public_address, custody_kind, encrypted_private_key, external_key_reference, status,
         per_transaction_limit_octas, per_user_daily_limit_octas, daily_budget_octas,
         created_by, updated_by, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8, $9, $9, NOW(), NOW())
       ON CONFLICT (organization_id) DO UPDATE SET
         public_address = EXCLUDED.public_address,
         custody_kind = EXCLUDED.custody_kind,
         encrypted_private_key = EXCLUDED.encrypted_private_key,
         external_key_reference = EXCLUDED.external_key_reference,
         status = 'active',
         per_transaction_limit_octas = EXCLUDED.per_transaction_limit_octas,
         per_user_daily_limit_octas = EXCLUDED.per_user_daily_limit_octas,
         daily_budget_octas = EXCLUDED.daily_budget_octas,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING *`,
      [
        normalizedId,
        normalizedAddress,
        custodyKind,
        encryptedPrivateKey,
        custodyKind === 'external' ? String(externalKeyReference).trim() : null,
        limits.perTransaction,
        limits.perUserDaily,
        limits.daily,
        actorUserId,
      ],
    )
    return publicSponsor(result.rows[0])
  })
}

export async function getOrganizationSponsor(organizationId) {
  return withOrganizationTransaction(organizationId, async (client) => {
    const result = await client.query('SELECT * FROM organization_sponsor_wallets WHERE organization_id = $1', [requireOrganizationId(organizationId)])
    return publicSponsor(result.rows[0])
  })
}

export async function loadOrganizationSponsorSignerMaterial(organizationId) {
  return withOrganizationTransaction(organizationId, async (client) => {
    const result = await client.query(
      `SELECT organization_id, public_address, custody_kind, encrypted_private_key, external_key_reference, status
         FROM organization_sponsor_wallets WHERE organization_id = $1`,
      [requireOrganizationId(organizationId)],
    )
    const row = result.rows[0]
    if (!row) return null
    return {
      organizationId: row.organization_id,
      publicAddress: row.public_address,
      custodyKind: row.custody_kind,
      encryptedPrivateKey: row.encrypted_private_key,
      externalKeyReference: row.external_key_reference,
      status: row.status,
    }
  })
}

export async function reserveOrganizationSponsorUsage({
  organizationId,
  userId,
  idempotencyKey,
  intentKind,
  reservedOctas,
}) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedReserved = requirePositiveInteger(reservedOctas, 'reserved_octas')
  if (!['weighted_vote', 'admin_equal_vote', 'qualification', 'governance'].includes(intentKind)) {
    throw new Error('invalid_sponsor_intent_kind')
  }
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, userId, [...ORGANIZATION_ROLES])
    const sponsorResult = await client.query(
      `SELECT * FROM organization_sponsor_wallets WHERE organization_id = $1 FOR UPDATE`,
      [normalizedId],
    )
    const sponsor = sponsorResult.rows[0]
    if (!sponsor || sponsor.status !== 'active') throw Object.assign(new Error('organization_sponsorship_unavailable'), { status: 503 })
    if (normalizedReserved > Number(sponsor.per_transaction_limit_octas)) {
      throw Object.assign(new Error('organization_sponsor_transaction_limit'), { status: 429 })
    }

    const existing = await client.query(
      `SELECT * FROM organization_sponsor_usage WHERE organization_id = $1 AND idempotency_key = $2`,
      [normalizedId, idempotencyKey],
    )
    if (existing.rows[0]) return existing.rows[0]

    const totals = await client.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status IN ('reserved', 'submitted', 'confirmed')
                           THEN COALESCE(actual_octas, reserved_octas) ELSE 0 END), 0)::bigint AS organization_total,
         COALESCE(SUM(CASE WHEN user_id = $2 AND status IN ('reserved', 'submitted', 'confirmed')
                           THEN COALESCE(actual_octas, reserved_octas) ELSE 0 END), 0)::bigint AS user_total
         FROM organization_sponsor_usage
        WHERE organization_id = $1 AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,
      [normalizedId, userId],
    )
    const organizationTotal = Number(totals.rows[0].organization_total)
    const userTotal = Number(totals.rows[0].user_total)
    if (organizationTotal + normalizedReserved > Number(sponsor.daily_budget_octas)) {
      throw Object.assign(new Error('organization_sponsor_daily_budget'), { status: 429 })
    }
    if (userTotal + normalizedReserved > Number(sponsor.per_user_daily_limit_octas)) {
      throw Object.assign(new Error('organization_sponsor_user_limit'), { status: 429 })
    }

    const result = await client.query(
      `INSERT INTO organization_sponsor_usage (
         id, organization_id, user_id, idempotency_key, intent_kind, reserved_octas, status, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, 'reserved', NOW())
       RETURNING *`,
      [randomUUID(), normalizedId, userId, idempotencyKey, intentKind, normalizedReserved],
    )
    return result.rows[0]
  })
}

export async function markOrganizationSponsorUsage({ organizationId, idempotencyKey, status, txHash = null, actualOctas = null, errorCode = null }) {
  const normalizedId = requireOrganizationId(organizationId)
  if (!SPONSOR_STATUSES.has(status)) throw new Error('invalid_sponsor_usage_status')
  const normalizedActual = actualOctas === null ? null : requireNonNegativeInteger(actualOctas, 'actual_octas')
  const normalizedHash = txHash === null ? null : requireAptosAddress(txHash)
  return withOrganizationTransaction(normalizedId, async (client) => {
    const result = await client.query(
      `UPDATE organization_sponsor_usage
          SET status = $3,
              tx_hash = COALESCE($4, tx_hash),
              actual_octas = COALESCE($5, actual_octas),
              error_code = $6,
              submitted_at = CASE WHEN $3 IN ('submitted', 'confirmed') THEN COALESCE(submitted_at, NOW()) ELSE submitted_at END,
              confirmed_at = CASE WHEN $3 = 'confirmed' THEN COALESCE(confirmed_at, NOW()) ELSE confirmed_at END
        WHERE organization_id = $1 AND idempotency_key = $2
        RETURNING *`,
      [normalizedId, idempotencyKey, status, normalizedHash, normalizedActual, errorCode],
    )
    return result.rows[0] ?? null
  })
}

export async function getOrganizationNotificationIntegration(organizationId) {
  return withOrganizationTransaction(organizationId, async (client) => {
    const result = await client.query(
      `SELECT organization_id, provider, bot_id, bot_username, default_chat_id, enabled, verified_at, updated_at
         FROM organization_notification_integrations
        WHERE organization_id = $1`,
      [requireOrganizationId(organizationId)],
    )
    return publicNotificationIntegration(result.rows[0])
  })
}

export async function loadOrganizationNotificationSecret(organizationId) {
  return withOrganizationTransaction(organizationId, async (client) => {
    const result = await client.query(
      `SELECT organization_id, encrypted_token, default_chat_id, enabled
         FROM organization_notification_integrations
        WHERE organization_id = $1`,
      [requireOrganizationId(organizationId)],
    )
    return result.rows[0] ?? null
  })
}

export async function configureOrganizationNotificationIntegration({
  organizationId,
  actorUserId,
  encryptedToken,
  botId,
  botUsername,
  defaultChatId = null,
}) {
  const normalizedId = requireOrganizationId(organizationId)
  const normalizedBotId = String(botId ?? '').trim()
  const normalizedUsername = String(botUsername ?? '').trim().replace(/^@/, '')
  const normalizedChatId = String(defaultChatId ?? '').trim() || null
  if (!encryptedToken || normalizedBotId.length < 1 || normalizedBotId.length > 40) throw new Error('invalid_notification_bot')
  if (!/^[A-Za-z0-9_]{2,80}$/.test(normalizedUsername)) throw new Error('invalid_notification_bot_username')
  if (normalizedChatId && !/^-?[0-9]{5,63}$/.test(normalizedChatId)) throw new Error('invalid_notification_chat_id')

  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner'])
    const result = await client.query(
      `INSERT INTO organization_notification_integrations (
         organization_id, provider, encrypted_token, bot_id, bot_username, default_chat_id,
         enabled, verified_at, created_by, updated_by, created_at, updated_at
       ) VALUES ($1, 'telegram', $2, $3, $4, $5, true, NOW(), $6, $6, NOW(), NOW())
       ON CONFLICT (organization_id) DO UPDATE SET
         encrypted_token = EXCLUDED.encrypted_token,
         bot_id = EXCLUDED.bot_id,
         bot_username = EXCLUDED.bot_username,
         default_chat_id = EXCLUDED.default_chat_id,
         enabled = true,
         verified_at = NOW(),
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING organization_id, provider, bot_id, bot_username, default_chat_id, enabled, verified_at, updated_at`,
      [normalizedId, encryptedToken, normalizedBotId, normalizedUsername, normalizedChatId, actorUserId],
    )
    await client.query(
      `INSERT INTO organization_audit_entries (
         id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at
       ) VALUES ($1, $2, $3, 'notification_bot_configured', 'integration', 'telegram', $4::jsonb, NOW())`,
      [randomUUID(), normalizedId, actorUserId, JSON.stringify({ botUsername: normalizedUsername, hasDefaultChat: Boolean(normalizedChatId) })],
    )
    return publicNotificationIntegration(result.rows[0])
  })
}

export async function removeOrganizationNotificationIntegration({ organizationId, actorUserId }) {
  const normalizedId = requireOrganizationId(organizationId)
  return withOrganizationTransaction(normalizedId, async (client) => {
    await requireMembershipRole(client, actorUserId, ['owner'])
    const deleted = await client.query(
      `DELETE FROM organization_notification_integrations
        WHERE organization_id = $1
        RETURNING bot_username`,
      [normalizedId],
    )
    if (deleted.rows[0]) {
      await client.query(
        `INSERT INTO organization_audit_entries (
           id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at
         ) VALUES ($1, $2, $3, 'notification_bot_removed', 'integration', 'telegram', $4::jsonb, NOW())`,
        [randomUUID(), normalizedId, actorUserId, JSON.stringify({ botUsername: deleted.rows[0].bot_username })],
      )
    }
    return Boolean(deleted.rows[0])
  })
}

export async function recordOrganizationAudit({ organizationId, actorUserId = null, kind, objectType, objectId = null, details = {} }) {
  const normalizedId = requireOrganizationId(organizationId)
  return withOrganizationTransaction(normalizedId, async (client) => {
    const result = await client.query(
      `INSERT INTO organization_audit_entries (
         id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW())
       RETURNING id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at`,
      [randomUUID(), normalizedId, actorUserId, kind, objectType, objectId, JSON.stringify(details)],
    )
    return result.rows[0]
  })
}
