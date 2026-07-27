import { randomUUID } from 'node:crypto'
import { pool } from './storage.mjs'

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])$/
const ORGANIZATION_ID_PATTERN = /^org_[a-z0-9][a-z0-9_]{1,62}$/
const RESERVED_SLUGS = new Set([
  'www', 'api', 'admin', 'app', 'assets', 'auth', 'cdn', 'mail', 'novyway', 'status', 'static', 'support', 'operator', 'ops',
])
const EDITABLE_STATUSES = new Set(['draft', 'changes_requested'])
const VISIBILITIES = new Set(['public', 'unlisted', 'members_only'])
const APPLICATION_TEMPLATE_IDS = new Set(['expert-weighted', 'equal-member', 'simple-committee'])
const INVITATION_MODES = new Set(['secure-link', 'email-review', 'manual'])
const DECISION_CATEGORIES = new Set([
  'document_change', 'budget', 'project', 'personnel', 'election', 'rule_change', 'advisory',
])
const CONTACT_LINK_KINDS = new Set(['telegram', 'instagram', 'vk', 'youtube', 'discord', 'other'])
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function httpError(code, status) {
  return Object.assign(new Error(code), { status })
}

function requireUuid(value, code = 'invalid_application_id') {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(normalized)) {
    throw httpError(code, 400)
  }
  return normalized
}

function requireSlug(value) {
  const normalized = String(value ?? '').trim().toLowerCase()
  if (!SLUG_PATTERN.test(normalized)) throw httpError('invalid_organization_slug', 400)
  if (RESERVED_SLUGS.has(normalized)) throw httpError('reserved_organization_slug', 409)
  return normalized
}

function requireText(value, minimum, maximum, code) {
  const normalized = String(value ?? '').trim()
  if (normalized.length < minimum || normalized.length > maximum || /[\u0000-\u001f\u007f<>]/.test(normalized)) {
    throw httpError(code, 400)
  }
  return normalized
}

function requireOptionalText(value, maximum, code) {
  const normalized = String(value ?? '').trim()
  if (!isSafeOrganizationMultilineText(normalized, maximum)) throw httpError(code, 400)
  return normalized
}

export function isSafeOrganizationMultilineText(value, maximum = 2000) {
  const normalized = String(value ?? '').trim()
  if (normalized.length > maximum) return false
  return ![...normalized].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    const forbiddenControl = codePoint <= 8
      || codePoint === 11
      || codePoint === 12
      || (codePoint >= 14 && codePoint <= 31)
      || codePoint === 127
    return forbiddenControl || character === '<' || character === '>'
  })
}

function requireVisibility(value) {
  const normalized = String(value ?? 'members_only')
  if (!VISIBILITIES.has(normalized)) throw httpError('invalid_organization_visibility', 400)
  return normalized
}

function requireRevision(value) {
  const normalized = Number(value)
  if (!Number.isSafeInteger(normalized) || normalized < 1) throw httpError('invalid_application_revision', 400)
  return normalized
}

function initialSetup(slug, name) {
  return {
    version: 2,
    orgSlug: slug,
    currentStep: 0,
    completedSteps: [],
    templateId: 'expert-weighted',
    people: { memberEstimate: '10', invitationMode: 'secure-link', invitees: '' },
    governance: {
      quorumPercent: '40',
      approvalPercent: '60',
      committeeSize: '7',
      decisionCategories: ['document_change', 'budget', 'advisory'],
      customDecisionCategory: '',
    },
    branding: { displayName: name, shortName: name.slice(0, 24), accentColor: '#E64232', logoUrl: '' },
    address: {
      hasPhysicalAddress: false,
      publishAddress: false,
      addressLine: '',
      city: '',
      region: '',
      postalCode: '',
      country: '',
    },
    contacts: { projectUrl: '', links: [] },
    updatedAt: new Date().toISOString(),
  }
}

function publicEvent(row, platform = false) {
  return {
    id: row.id,
    kind: row.event_kind,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    note: row.note || null,
    createdAt: row.created_at,
    ...(platform ? { actorUserId: row.actor_user_id } : {}),
  }
}

function publicApplication(row, events = [], platform = false) {
  if (!row) return null
  return {
    id: row.id,
    slug: row.requested_slug,
    name: row.name,
    description: row.description,
    visibility: row.visibility,
    status: row.status,
    revision: Number(row.revision),
    schemaVersion: Number(row.schema_version),
    setup: row.setup_json ?? {},
    reviewMessage: row.review_message || null,
    canEdit: EDITABLE_STATUSES.has(row.status),
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    approvedOrganizationId: row.approved_organization_id,
    approvedHostname: row.status === 'approved' ? `${row.requested_slug}.novyway.com` : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    events: events.map((event) => publicEvent(event, platform)),
    ...(platform ? {
      creator: {
        id: row.creator_user_id,
        email: row.creator_email || null,
        displayName: row.creator_display_name || null,
      },
      rejectedPurgeAt: row.rejected_purge_at,
    } : {}),
  }
}

async function eventsFor(client, applicationId) {
  const result = await client.query(
    `SELECT id, actor_user_id, event_kind, from_status, to_status, note, created_at
       FROM organization_application_events
      WHERE application_id = $1
      ORDER BY created_at ASC, id ASC`,
    [applicationId],
  )
  return result.rows
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function integerIn(value, minimum, maximum) {
  return /^\d+$/.test(String(value ?? ''))
    && Number(value) >= minimum
    && Number(value) <= maximum
}

function textIn(value, minimum, maximum) {
  const normalized = String(value ?? '').trim()
  return normalized.length >= minimum
    && normalized.length <= maximum
    && isSafeOrganizationMultilineText(normalized, maximum)
}

function optionalHttpUrl(value) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return true
  try {
    const parsed = new URL(normalized)
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

function setupV1Ready(setup) {
  if (!Array.isArray(setup.completedSteps) || ![0, 1, 2, 3, 4].every((step) => setup.completedSteps.includes(step))) return false
  const branding = setup.branding ?? {}
  const address = setup.address ?? {}
  const decision = setup.firstDecision ?? {}
  const people = setup.people ?? {}
  const governance = setup.governance ?? {}
  return typeof branding.displayName === 'string' && branding.displayName.trim().length >= 2
    && typeof branding.shortName === 'string' && branding.shortName.trim().length >= 2
    && /^#[0-9a-f]{6}$/i.test(String(branding.accentColor ?? ''))
    && typeof address.addressLine === 'string' && address.addressLine.trim().length >= 3
    && typeof address.city === 'string' && address.city.trim().length >= 2
    && typeof address.postalCode === 'string' && address.postalCode.trim().length >= 2
    && typeof address.country === 'string' && address.country.trim().length >= 2
    && typeof decision.title === 'string' && decision.title.trim().length >= 5
    && typeof decision.summary === 'string' && decision.summary.trim().length >= 20
    && integerIn(decision.closesInDays, 1, 90)
    && integerIn(people.memberEstimate, 1, 100000)
    && integerIn(governance.quorumPercent, 1, 100)
    && integerIn(governance.approvalPercent, 50, 100)
}

function setupV2Ready(setup) {
  if (!Array.isArray(setup.completedSteps) || ![0, 1, 2, 3].every((step) => setup.completedSteps.includes(step))) return false
  if (!APPLICATION_TEMPLATE_IDS.has(setup.templateId)) return false

  const people = isRecord(setup.people) ? setup.people : {}
  const governance = isRecord(setup.governance) ? setup.governance : {}
  const branding = isRecord(setup.branding) ? setup.branding : {}
  const address = isRecord(setup.address) ? setup.address : {}
  const contacts = isRecord(setup.contacts) ? setup.contacts : {}

  if (!integerIn(people.memberEstimate, 1, 100000) || !INVITATION_MODES.has(people.invitationMode)) return false
  const invitees = String(people.invitees ?? '').split(/\r?\n/).map((value) => value.trim()).filter(Boolean)
  if (invitees.length > 50 || invitees.some((email) => email.length > 254 || !EMAIL_PATTERN.test(email))) return false

  if (!integerIn(governance.quorumPercent, 1, 100) || !integerIn(governance.approvalPercent, 50, 100)) return false
  if (setup.templateId === 'simple-committee' && !integerIn(governance.committeeSize, 1, 99)) return false
  const categories = Array.isArray(governance.decisionCategories) ? governance.decisionCategories : []
  if (categories.some((category) => !DECISION_CATEGORIES.has(category))) return false
  const customCategory = String(governance.customDecisionCategory ?? '').trim()
  if (!categories.length && !textIn(customCategory, 2, 60)) return false
  if (customCategory && !textIn(customCategory, 2, 60)) return false

  if (!textIn(branding.displayName, 2, 80) || !textIn(branding.shortName, 2, 24)) return false
  if (!/^#[0-9a-f]{6}$/i.test(String(branding.accentColor ?? ''))) return false
  if (!optionalHttpUrl(branding.logoUrl) || !optionalHttpUrl(contacts.projectUrl)) return false

  const links = Array.isArray(contacts.links) ? contacts.links : []
  if (links.length > 8 || links.some((link) => {
    if (!isRecord(link) || !CONTACT_LINK_KINDS.has(link.kind) || !optionalHttpUrl(link.url) || !String(link.url ?? '').trim()) return true
    return link.kind === 'other' && !textIn(link.label, 2, 40)
  })) return false

  if (address.hasPhysicalAddress) {
    if (!textIn(address.addressLine, 3, 120)
      || !textIn(address.city, 2, 80)
      || !textIn(address.postalCode, 2, 20)
      || !textIn(address.country, 2, 80)) return false
    if (String(address.region ?? '').trim() && !textIn(address.region, 2, 80)) return false
  }
  return true
}

function setupReady(setup) {
  if (!isRecord(setup)) return false
  if (setup.version === 1) return setupV1Ready(setup)
  if (setup.version === 2) return setupV2Ready(setup)
  return false
}

async function insertEvent(client, { applicationId, actorUserId, kind, fromStatus = null, toStatus = null, note = null }) {
  await client.query(
    `INSERT INTO organization_application_events (
       id, application_id, actor_user_id, event_kind, from_status, to_status, note, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [randomUUID(), applicationId, actorUserId, kind, fromStatus, toStatus, note],
  )
}

export async function initializeOrganizationApplications() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('novyway_organization_applications_v1'))")
    await client.query(`
      CREATE TABLE IF NOT EXISTS organization_applications (
        id uuid PRIMARY KEY,
        creator_user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        requested_slug text NOT NULL UNIQUE CHECK (requested_slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
        name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
        description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
        visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'unlisted', 'members_only')),
        status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'changes_requested', 'approved', 'rejected')),
        setup_json jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (octet_length(setup_json::text) <= 131072),
        schema_version integer NOT NULL DEFAULT 1 CHECK (schema_version >= 1),
        revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
        review_message text CHECK (review_message IS NULL OR char_length(review_message) <= 4000),
        submitted_at timestamptz,
        reviewed_at timestamptz,
        reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
        rejected_purge_at timestamptz,
        approved_organization_id text UNIQUE REFERENCES organizations(id) ON DELETE SET NULL,
        created_at timestamptz NOT NULL DEFAULT NOW(),
        updated_at timestamptz NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS organization_applications_creator_idx
        ON organization_applications(creator_user_id, updated_at DESC);
      CREATE INDEX IF NOT EXISTS organization_applications_review_idx
        ON organization_applications(status, submitted_at ASC, updated_at ASC);
      CREATE INDEX IF NOT EXISTS organization_applications_purge_idx
        ON organization_applications(rejected_purge_at) WHERE status = 'rejected';

      CREATE TABLE IF NOT EXISTS organization_application_events (
        id uuid PRIMARY KEY,
        application_id uuid NOT NULL REFERENCES organization_applications(id) ON DELETE CASCADE,
        actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        event_kind text NOT NULL CHECK (event_kind IN ('created', 'updated', 'submitted', 'changes_requested', 'approved', 'rejected')),
        from_status text,
        to_status text,
        note text CHECK (note IS NULL OR char_length(note) <= 4000),
        created_at timestamptz NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS organization_application_events_time_idx
        ON organization_application_events(application_id, created_at ASC);
    `)
    await client.query(
      `INSERT INTO schema_migrations (version, applied_at)
       VALUES (2026072101, NOW()) ON CONFLICT (version) DO NOTHING`,
    )
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function createOrganizationApplication({ creatorUserId, slug, name, description = '', visibility = 'members_only' }) {
  const normalizedSlug = requireSlug(slug)
  const normalizedName = requireText(name, 2, 120, 'invalid_organization_name')
  const normalizedDescription = requireOptionalText(description, 2000, 'invalid_organization_description')
  const normalizedVisibility = requireVisibility(visibility)
  const applicationId = randomUUID()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query("SELECT pg_advisory_xact_lock(hashtext('organization_slug:' || $1))", [normalizedSlug])
    const existing = await client.query('SELECT 1 FROM organizations WHERE slug = $1', [normalizedSlug])
    if (existing.rowCount) throw httpError('organization_slug_unavailable', 409)
    const inserted = await client.query(
      `INSERT INTO organization_applications (
         id, creator_user_id, requested_slug, name, description, visibility, setup_json, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, NOW(), NOW())
       RETURNING *`,
      [applicationId, creatorUserId, normalizedSlug, normalizedName, normalizedDescription, normalizedVisibility, JSON.stringify(initialSetup(normalizedSlug, normalizedName))],
    )
    await insertEvent(client, { applicationId, actorUserId: creatorUserId, kind: 'created', toStatus: 'draft' })
    await client.query('COMMIT')
    return publicApplication(inserted.rows[0], await eventsFor(pool, applicationId))
  } catch (error) {
    await client.query('ROLLBACK')
    if (error?.code === '23505') throw httpError('organization_slug_unavailable', 409)
    throw error
  } finally {
    client.release()
  }
}

export async function listOrganizationApplicationsForCreator(creatorUserId) {
  const result = await pool.query(
    `SELECT * FROM organization_applications
      WHERE creator_user_id = $1 AND status <> 'rejected'
      ORDER BY updated_at DESC`,
    [creatorUserId],
  )
  return Promise.all(result.rows.map(async (row) => publicApplication(row, await eventsFor(pool, row.id))))
}

export async function getOrganizationApplicationForCreator(applicationId, creatorUserId) {
  const normalizedId = requireUuid(applicationId)
  const result = await pool.query(
    `SELECT * FROM organization_applications
      WHERE id = $1 AND creator_user_id = $2 AND status <> 'rejected'`,
    [normalizedId, creatorUserId],
  )
  return publicApplication(result.rows[0], result.rows[0] ? await eventsFor(pool, normalizedId) : [])
}

export async function updateOrganizationApplication({ applicationId, creatorUserId, expectedRevision, setup }) {
  const normalizedId = requireUuid(applicationId)
  const revision = requireRevision(expectedRevision)
  if (!isRecord(setup) || ![1, 2].includes(setup.version)) throw httpError('unsupported_application_setup', 400)
  const serializedSetup = JSON.stringify(setup)
  if (Buffer.byteLength(serializedSetup, 'utf8') > 131072) throw httpError('application_setup_too_large', 413)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const current = await client.query(
      `SELECT * FROM organization_applications
        WHERE id = $1 AND creator_user_id = $2 AND status <> 'rejected'
        FOR UPDATE`,
      [normalizedId, creatorUserId],
    )
    const row = current.rows[0]
    if (!row) throw httpError('organization_application_not_found', 404)
    if (!EDITABLE_STATUSES.has(row.status)) throw httpError('organization_application_not_editable', 409)
    if (Number(row.revision) !== revision) throw httpError('organization_application_revision_conflict', 409)
    if (setup.orgSlug !== row.requested_slug) throw httpError('application_setup_slug_mismatch', 400)
    const updated = await client.query(
      `UPDATE organization_applications
          SET setup_json = $1::jsonb, schema_version = $2, revision = revision + 1, updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
      [serializedSetup, setup.version, normalizedId],
    )
    await insertEvent(client, { applicationId: normalizedId, actorUserId: creatorUserId, kind: 'updated', fromStatus: row.status, toStatus: row.status })
    await client.query('COMMIT')
    return publicApplication(updated.rows[0], await eventsFor(pool, normalizedId))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function submitOrganizationApplication({ applicationId, creatorUserId, expectedRevision }) {
  const normalizedId = requireUuid(applicationId)
  const revision = requireRevision(expectedRevision)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const current = await client.query(
      `SELECT * FROM organization_applications
        WHERE id = $1 AND creator_user_id = $2 AND status <> 'rejected'
        FOR UPDATE`,
      [normalizedId, creatorUserId],
    )
    const row = current.rows[0]
    if (!row) throw httpError('organization_application_not_found', 404)
    if (!EDITABLE_STATUSES.has(row.status)) throw httpError('organization_application_not_submittable', 409)
    if (Number(row.revision) !== revision) throw httpError('organization_application_revision_conflict', 409)
    if (!setupReady(row.setup_json)) throw httpError('organization_application_incomplete', 409)
    const updated = await client.query(
      `UPDATE organization_applications
          SET status = 'submitted', review_message = NULL, submitted_at = NOW(),
              revision = revision + 1, updated_at = NOW()
        WHERE id = $1
        RETURNING *`,
      [normalizedId],
    )
    await insertEvent(client, { applicationId: normalizedId, actorUserId: creatorUserId, kind: 'submitted', fromStatus: row.status, toStatus: 'submitted' })
    await client.query('COMMIT')
    return publicApplication(updated.rows[0], await eventsFor(pool, normalizedId))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function listOrganizationApplicationsForReview({ status = null } = {}) {
  const allowed = new Set(['draft', 'submitted', 'changes_requested', 'approved', 'rejected'])
  if (status && !allowed.has(status)) throw httpError('invalid_application_status', 400)
  const result = await pool.query(
    `SELECT application.*, creator.email AS creator_email, creator.display_name AS creator_display_name
       FROM organization_applications application
       JOIN users creator ON creator.id = application.creator_user_id
      WHERE ($1::text IS NULL OR application.status = $1)
      ORDER BY CASE application.status WHEN 'submitted' THEN 0 WHEN 'changes_requested' THEN 1 ELSE 2 END,
               application.submitted_at ASC NULLS LAST, application.updated_at DESC`,
    [status],
  )
  return Promise.all(result.rows.map(async (row) => publicApplication(row, await eventsFor(pool, row.id), true)))
}

export async function reviewOrganizationApplication({ applicationId, reviewerUserId, expectedRevision, decision, message = '' }) {
  const normalizedId = requireUuid(applicationId)
  const revision = requireRevision(expectedRevision)
  const normalizedDecision = String(decision ?? '')
  if (!['approve', 'changes_requested', 'reject'].includes(normalizedDecision)) throw httpError('invalid_application_decision', 400)
  const normalizedMessage = requireOptionalText(message, 4000, 'invalid_application_review_message')
  if (normalizedDecision !== 'approve' && normalizedMessage.length < 4) throw httpError('application_review_message_required', 400)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const current = await client.query(
      `SELECT application.*, creator.email AS creator_email, creator.display_name AS creator_display_name
         FROM organization_applications application
         JOIN users creator ON creator.id = application.creator_user_id
        WHERE application.id = $1
        FOR UPDATE`,
      [normalizedId],
    )
    const row = current.rows[0]
    if (!row) throw httpError('organization_application_not_found', 404)
    if (row.status !== 'submitted') throw httpError('organization_application_not_reviewable', 409)
    if (Number(row.revision) !== revision) throw httpError('organization_application_revision_conflict', 409)

    if (normalizedDecision === 'approve') {
      await client.query("SELECT pg_advisory_xact_lock(hashtext('organization_slug:' || $1))", [row.requested_slug])
      const occupied = await client.query('SELECT 1 FROM organizations WHERE slug = $1', [row.requested_slug])
      if (occupied.rowCount) throw httpError('organization_slug_unavailable', 409)
      const organizationId = `org_${row.requested_slug.replaceAll('-', '_')}`
      if (!ORGANIZATION_ID_PATTERN.test(organizationId)) throw httpError('invalid_organization_id', 400)
      const setup = row.setup_json ?? {}
      const brand = setup.branding ?? {}
      const governance = setup.governance ?? {}
      const v2 = setup.version === 2
      const address = setup.address ?? {}
      const contacts = setup.contacts ?? {}
      const feature = {
        onboarding: {
          templateId: setup.templateId,
          people: {
            memberEstimate: setup.people?.memberEstimate,
            invitationMode: setup.people?.invitationMode,
          },
          ...(v2 ? {
            decisionCategories: governance.decisionCategories ?? [],
            customDecisionCategory: governance.customDecisionCategory ?? '',
            contacts: {
              projectUrl: contacts.projectUrl ?? '',
              links: Array.isArray(contacts.links) ? contacts.links : [],
            },
            address: address.publishAddress
              ? address
              : { hasPhysicalAddress: Boolean(address.hasPhysicalAddress), publishAddress: false },
          } : {
            address,
            firstDecision: setup.firstDecision ?? {},
          }),
        },
      }
      await client.query(
        `INSERT INTO organizations (
           id, slug, name, description, status, visibility, brand_json, aptos_network,
           created_by, created_at, updated_at, published_at
         ) VALUES ($1, $2, $3, $4, 'active', $5, $6::jsonb, 'testnet', $7, NOW(), NOW(), NOW())`,
        [organizationId, row.requested_slug, brand.displayName || row.name, row.description, row.visibility, JSON.stringify(brand), row.creator_user_id],
      )
      await client.query("SELECT set_config('app.organization_id', $1, true)", [organizationId])
      await client.query(
        `INSERT INTO organization_domains (
           organization_id, hostname, verification_status, is_primary, created_by, created_at, verified_at
         ) VALUES ($1, $2, 'verified', true, $3, NOW(), NOW())`,
        [organizationId, `${row.requested_slug}.novyway.com`, reviewerUserId],
      )
      await client.query(
        `INSERT INTO organization_memberships (
           organization_id, user_id, role, status, created_by, joined_at, updated_at
         ) VALUES ($1, $2, 'owner', 'active', $3, NOW(), NOW())`,
        [organizationId, row.creator_user_id, reviewerUserId],
      )
      await client.query(
        `INSERT INTO organization_settings (
           organization_id, locale, governance_json, qualification_json, feature_json, schema_version, updated_by, updated_at
         ) VALUES ($1, 'ru', $2::jsonb, '{}'::jsonb, $3::jsonb, $4, $5, NOW())`,
        [organizationId, JSON.stringify(governance), JSON.stringify(feature), setup.version || 1, reviewerUserId],
      )
      await client.query(
        `INSERT INTO organization_audit_entries (
           id, organization_id, actor_user_id, kind, object_type, object_id, details_json, created_at
         ) VALUES ($1, $2, $3, 'organization_approved', 'organization', $2, $4::jsonb, NOW())`,
        [randomUUID(), organizationId, reviewerUserId, JSON.stringify({ applicationId: normalizedId, slug: row.requested_slug })],
      )
      const updated = await client.query(
        `UPDATE organization_applications
            SET status = 'approved', review_message = $1, reviewed_at = NOW(), reviewed_by = $2,
                rejected_purge_at = NULL, approved_organization_id = $3,
                revision = revision + 1, updated_at = NOW()
          WHERE id = $4
          RETURNING *`,
        [normalizedMessage || null, reviewerUserId, organizationId, normalizedId],
      )
      await insertEvent(client, { applicationId: normalizedId, actorUserId: reviewerUserId, kind: 'approved', fromStatus: 'submitted', toStatus: 'approved', note: normalizedMessage || null })
      await client.query('COMMIT')
      return publicApplication({ ...updated.rows[0], creator_email: row.creator_email, creator_display_name: row.creator_display_name }, await eventsFor(pool, normalizedId), true)
    }

    const nextStatus = normalizedDecision === 'reject' ? 'rejected' : 'changes_requested'
    const updated = await client.query(
      `UPDATE organization_applications
          SET status = $1, review_message = $2, reviewed_at = NOW(), reviewed_by = $3,
              rejected_purge_at = CASE WHEN $1 = 'rejected' THEN NOW() + INTERVAL '30 days' ELSE NULL END,
              revision = revision + 1, updated_at = NOW()
        WHERE id = $4
        RETURNING *`,
      [nextStatus, normalizedMessage, reviewerUserId, normalizedId],
    )
    await insertEvent(client, { applicationId: normalizedId, actorUserId: reviewerUserId, kind: nextStatus, fromStatus: 'submitted', toStatus: nextStatus, note: normalizedMessage })
    await client.query('COMMIT')
    return publicApplication({ ...updated.rows[0], creator_email: row.creator_email, creator_display_name: row.creator_display_name }, await eventsFor(pool, normalizedId), true)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function purgeExpiredRejectedApplications() {
  const result = await pool.query(
    `DELETE FROM organization_applications
      WHERE status = 'rejected' AND rejected_purge_at <= NOW()
      RETURNING id`,
  )
  return result.rowCount ?? 0
}
