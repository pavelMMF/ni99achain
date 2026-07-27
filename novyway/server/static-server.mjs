import { createServer } from 'node:http'
import { randomInt, randomUUID } from 'node:crypto'
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'
import { deserializeSignInOutput, verifySignInMessage, verifySignInSignature } from '@aptos-labs/siwa'
import { z } from 'zod'
import {
  aptosAccountBalance,
  aptosClient,
  aptosRuntime,
  aptosStatus,
  createOrganizationRelayer,
  governanceAccess,
  governanceCreator,
  qualificationSnapshot,
  createManagedAccount,
  buildSponsoredVote,
  buildSponsoredEqualAdminVote,
  deserializeAuthenticator,
  deserializeTransaction,
  submitSponsoredVote,
  submitManagedSponsoredVote,
  verifyPublishedModules,
  waitForVote,
  verifyElectionCreation,
  verifyElectionFinalization,
} from './lib/aptos-service.mjs'
import { validateSponsoredVoteTransaction } from './lib/sponsored-intent.mjs'
import { createTestnetSignInChallenge } from './lib/siwa-challenge.mjs'
import {
  clearSessionCookie,
  clearCsrfCookie,
  csrfCookie,
  enforceSameOrigin,
  json,
  parseCookies,
  publicUser,
  randomToken,
  readJson,
  requestOrigin,
  securityHeaders,
  sessionCookie,
} from './lib/http.mjs'
import {
  countActiveParticipants,
  countRecentSponsoredVotes,
  claimVoteIntent,
  consumeChallenge,
  createDatabaseBackup,
  createOrGetVoteIntent,
  createSession,
  consumePendingRegistration,
  bootstrapCreatorAccount,
  activateAptosIdentity,
  createLogicGameRound,
  creatorAccountStatus,
  dashboardAnalytics,
  dashboardDatabaseStats,
  databasePath,
  deleteSession,
  deleteSessionByHash,
  deletePendingRegistration,
  deleteUserSessions,
  getSession,
  getUserByAptosAddress,
  getUserByEmail,
  getPasswordUserByEmail,
  getPendingRegistration,
  getManagedWallet,
  getLogicGameProfile,
  getParticipantProfile,
  getSettings,
  getVoteIntent,
  hashSecret,
  initializeStorage,
  logEvent,
  latestBackup,
  listGovernanceUsers,
  listParticipants,
  linkAptosIdentity,
  listLogicGameAnsweredIds,
  listAccountConnections,
  markPasswordLogin,
  resetPasswordAndSessions,
  putEmailVerification,
  consumeEmailVerification,
  activateRegisteredUser,
  completeEmailChange,
  markVoteFinal,
  markVoteSubmissionFailed,
  markVoteSubmitted,
  putChallenge,
  putPendingRegistration,
  recordUptime,
  recordLogicGameAnswer,
  recordParticipantActivity,
  replaceQualificationSnapshots,
  setSettings,
  updateProfile,
  upsertUser,
  consumeLogicGameRound,
  createDocumentProposal,
  supportDocumentProposal,
  getDocumentProposalSupportProof,
  prepareDocumentProposalElection,
  getDocumentProposal,
  getDocumentProposalByHash,
  listDocumentProposals,
  listRecordedChainTransactions,
  publishDocumentProposal,
  recordDocumentProposalFinalization,
} from './lib/storage.mjs'
import {
  DEFAULT_ORGANIZATION_ID,
  DEFAULT_ORGANIZATION_SLUG,
  configureOrganizationSponsor,
  configureOrganizationNotificationIntegration,
  findOrganizationByDomain,
  findOrganizationBySlug,
  getOrganizationConfig,
  getOrganizationMembership,
  getOrganizationNotificationIntegration,
  getOrganizationSponsor,
  initializeTenantStorage,
  loadOrganizationNotificationSecret,
  loadOrganizationSponsorSignerMaterial,
  markOrganizationSponsorUsage,
  reserveOrganizationSponsorUsage,
  removeOrganizationNotificationIntegration,
  registerOrganizationDomain,
  syncDefaultOrganizationMembership,
  updateOrganizationProfile,
  updateOrganizationSettings,
} from './lib/tenant-storage.mjs'
import {
  createOrganizationApplication,
  getOrganizationApplicationForCreator,
  initializeOrganizationApplications,
  isSafeOrganizationMultilineText,
  listOrganizationApplicationsForCreator,
  listOrganizationApplicationsForReview,
  purgeExpiredRejectedApplications,
  reviewOrganizationApplication,
  submitOrganizationApplication,
  updateOrganizationApplication,
} from './lib/organization-applications.mjs'
import {
  filterAccessibleResourceIds,
  getAccessConsole,
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
  revokeAccessGrant,
} from './lib/organization-access.mjs'
import {
  decryptManagedPrivateKey,
  decryptOrganizationNotificationToken,
  decryptOrganizationRelayerPrivateKey,
  encryptManagedPrivateKey,
  encryptOrganizationNotificationToken,
  encryptOrganizationRelayerPrivateKey,
  hashEmailCode,
  hashPassword,
  verifyOperatorToken,
  verifyPassword,
} from './lib/credentials.mjs'
import { enforceOrganizationOrigin, resolveOrganizationRequest } from './lib/organization-context.mjs'
import { resolveOrganizationPermissions } from './lib/authorization.mjs'
import { emailDeliveryConfigured, sendPasswordChangedNotice, sendVerificationCode } from './lib/mailer.mjs'
import { filterLogicChallenges, getLogicChallenge, logicChallenges, presentLogicChallenge, scoreLogicAnswer } from './lib/logic-game.mjs'

import { canonicalJson, createProposalPayload, proposalSha256 } from './lib/document-proposal.mjs'
const webRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const distRoot = join(webRoot, 'dist')
const runtimeRoot = join(webRoot, '.runtime')
const musicRoot = join(webRoot, 'media', 'music')
const pidFile = join(runtimeRoot, 'site.pid')
const args = process.argv.slice(2)
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] ?? fallback : fallback
const host = option('--host', '127.0.0.1')
const port = Number(option('--port', '4176'))
const opsPort = Number(option('--ops-port', '4177'))
const shouldOpen = args.includes('--open')
const startedAt = new Date().toISOString()
// Sponsorship stays fail-closed until the published modules can be reproduced
const publicSiteOrigin = (process.env.PUBLIC_SITE_ORIGIN ?? 'https://novyway.com').replace(/\/$/, '')
const proposalLaunchQuorumBps = 1_000

async function telegramBotRequest(token, method, payload = null) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8_000)
  try {
    let response
    try {
      response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: payload ? 'POST' : 'GET',
        headers: payload ? { 'Content-Type': 'application/json' } : undefined,
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      })
    } catch {
      throw Object.assign(new Error('telegram_service_unavailable'), { status: 503 })
    }
    const body = await response.json().catch(() => null)
    if (!response.ok || body?.ok !== true) {
      throw Object.assign(new Error('telegram_bot_request_failed'), { status: 422 })
    }
    return body.result
  } finally {
    clearTimeout(timeout)
  }
}
const proposalSupportWindowDays = 30
// from the reviewed Move source and toolchain, not merely matched by byte hash.
const sponsorshipLocked = process.env.SPONSORSHIP_EMERGENCY_LOCK === '1'

const mimeTypes = {
  '.css': 'text/css; charset=utf-8', '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.m4a': 'audio/mp4', '.mp3': 'audio/mpeg', '.webm': 'audio/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

// Background-music module: edit the playlist below and flip PUBLIC_MUSIC_ENABLED
// to control what plays site-wide. Files are read from media/music/<file>, so
// adding/removing/renaming a track here must match what's actually in that folder.
const PUBLIC_MUSIC_ENABLED = true
const musicTracks = [
  ['01.m4a', 'Трек 1'],
  ['02.m4a', 'Трек 2'],
  ['03.m4a', 'Трек 3'],
  ['04.m4a', 'Трек 4'],
  ['05.m4a', 'Трек 5'],
  ['06.m4a', 'Трек 6'],
  ['07.mp3', 'Трек 7'],
]
const publicMusicEnabled = PUBLIC_MUSIC_ENABLED

function musicAllowed(request) {
  const hostHeader = (request.headers.host ?? '').toLowerCase()
  return publicMusicEnabled || hostHeader === `127.0.0.1:${port}` || hostHeader === `localhost:${port}`
}

function sendRangedFile(request, response, filePath) {
  const stat = statSync(filePath)
  const size = stat.size
  const range = request.headers.range
  const headers = {
    'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    // Cache per URL, but let the browser revalidate so a replaced track file is
    // never served stale. The playlist URLs also carry an ?v=<mtime> tag, so a
    // changed file gets a fresh URL and can't collide with the cached bytes.
    'Cache-Control': 'private, max-age=86400, must-revalidate',
    'Last-Modified': stat.mtime.toUTCString(),
    ...securityHeaders,
  }
  if (!range) {
    response.writeHead(200, { ...headers, 'Content-Length': size })
    if (request.method === 'HEAD') return response.end()
    return createReadStream(filePath).pipe(response)
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match) {
    response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` })
    return response.end()
  }
  const start = match[1] ? Number(match[1]) : 0
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= size) {
    response.writeHead(416, { ...headers, 'Content-Range': `bytes */${size}` })
    return response.end()
  }
  response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1 })
  if (request.method === 'HEAD') return response.end()
  createReadStream(filePath, { start, end }).pipe(response)
}

const profileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).nullable().optional(),
  telegram: z.string().trim().max(80).nullable().optional(),
})
const challengeSchema = z.object({
  provider: z.enum(['google', 'apple', 'wallet']).default('wallet'),
  lang: z.enum(['ru', 'en']).default('ru'),
  action: z.enum(['sign_in', 'link', 'activate']).optional(),
  link: z.boolean().optional(),
})
const verifySchema = z.object({
  provider: z.enum(['google', 'apple', 'wallet']),
  output: z.object({ version: z.literal('3'), type: z.string(), signature: z.string(), input: z.record(z.string(), z.unknown()), publicKey: z.string() }),
})
const voteSchema = z.object({
  electionId: z.string().regex(/^\d+$/),
  yesBps: z.number().int().min(0).max(10_000),
  noBps: z.number().int().min(0).max(10_000),
  abstainBps: z.number().int().min(0).max(10_000),
  idempotencyKey: z.string().uuid(),
}).refine((value) => value.yesBps + value.noBps + value.abstainBps === 10_000, 'vote_split_must_equal_10000')
const submissionSchema = z.object({ senderAuthenticatorB64: z.string().min(16).max(16_384) })
const equalAdminVoteSchema = z.object({
  adminElectionId: z.string().regex(/^\d+$/),
  choice: z.number().int().min(1).max(3),
  idempotencyKey: z.string().uuid(),
})
const documentProposalSchema = z.object({
  idempotencyKey: z.string().uuid(),
  documentId: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
  documentTitleRu: z.string().trim().min(1).max(300),
  documentTitleEn: z.string().trim().min(1).max(300),
  baseVersion: z.string().trim().min(1).max(80),
  baseDocumentHash: z.string().trim().toLowerCase().regex(/^0x[0-9a-f]{8,64}$/),
  clauseId: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
  clauseNumber: z.string().trim().min(1).max(40),
  clauseTitleRu: z.string().trim().min(1).max(300),
  clauseTitleEn: z.string().trim().min(1).max(300),
  currentTextRu: z.string().trim().min(1).max(20_000),
  currentTextEn: z.string().trim().min(1).max(20_000),
  kind: z.enum(['replace', 'insert', 'delete']),
  proposedTextRu: z.string().trim().min(1).max(20_000),
  proposedTextEn: z.string().trim().min(1).max(20_000),
  rationaleRu: z.string().trim().min(1).max(10_000),
  rationaleEn: z.string().trim().min(1).max(10_000),
  categoryId: z.string().regex(/^\d+$/),
  durationDays: z.number().int().min(1).max(365),
  passBps: z.number().int().min(5_000).max(10_000),
  quorumBps: z.number().int().min(0).max(10_000),
  allowRevote: z.boolean().default(true),
}).strict()
const proposalPublishSchema = z.object({ txHash: z.string().regex(/^0x[0-9a-f]{64}$/i) }).strict()
const participantQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  role: z.enum(['voter', 'admin', 'super_admin']).optional(),
  sort: z.enum(['name', 'registered', 'role', 'votes', 'documents', 'exams', 'qualifications', 'score']).default('registered'),
  direction: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(30),
}).strict()
const participantActivitySchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('document_opened'), subjectId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/) }).strict(),
  z.object({
    kind: z.literal('exam_passed'),
    subjectId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
    scoreBps: z.number().int().min(0).max(10_000),
  }).strict(),
])

const passwordSchema = z.string().min(12).max(128)
const passwordRegisterSchema = z.object({
  email: z.string().trim().email().max(160),
  password: passwordSchema,
  displayName: z.string().trim().min(2).max(80),
  lang: z.enum(['ru', 'en']).default('ru'),
})
const passwordLoginSchema = z.object({ email: z.string().trim().email().max(160), password: z.string().min(1).max(128) })
const passwordResetRequestSchema = z.object({ email: z.string().trim().email().max(160), lang: z.enum(['ru', 'en']).default('ru') })
const passwordResetConfirmSchema = z.object({
  email: z.string().trim().email().max(160),
  code: z.string().regex(/^\d{6}$/),
  password: passwordSchema,
  lang: z.enum(['ru', 'en']).default('ru'),
})
const emailCodeSchema = z.object({ email: z.string().trim().email().max(160), code: z.string().regex(/^\d{6}$/), lang: z.enum(['ru', 'en']).default('ru') })
const emailChangeSchema = z.object({ email: z.string().trim().email().max(160), lang: z.enum(['ru', 'en']).default('ru') })
const opsSettingsSchema = z.object({
  registrationOpen: z.boolean().optional(), sponsorshipEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(), maxSponsoredVotesPerHour: z.number().int().min(1).max(500).optional(),
  maxSponsoredVotesGlobalPerHour: z.number().int().min(1).max(10_000).optional(),
  siteTitle: z.string().trim().min(2).max(80).optional(),
})
const creatorBootstrapSchema = z.object({
  password: passwordSchema,
}).strict()
const logicRoundSchema = z.object({
  lang: z.enum(['ru', 'en']).default('ru'),
  origin: z.enum(['all', 'documented', 'life', 'fiction']).default('documented'),
  difficulty: z.union([z.literal('all'), z.literal(1), z.literal(2), z.literal(3)]).default('all'),
}).strict()
const logicAnswerSchema = z.object({
  roundToken: z.string().min(24).max(128),
  selectedIndex: z.number().int().min(0).max(7),
})

const safeOrganizationText = z.string().trim().regex(/^[^\u0000-\u001f\u007f<>]+$/)
const safeOptionalOrganizationText = z.string().trim().max(2000)
  .refine((value) => isSafeOrganizationMultilineText(value), 'invalid_organization_description')
const reservedOrganizationSlugs = new Set([
  'www', 'api', 'admin', 'app', 'assets', 'auth', 'cdn', 'mail', 'novyway', 'status', 'static', 'support', 'operator', 'ops',
])
const organizationCreateSchema = z.object({
  slug: z.string().trim().toLowerCase().min(2).max(63).regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/).refine((value) => !reservedOrganizationSlugs.has(value), 'reserved_organization_slug'),
  name: safeOrganizationText.min(2).max(120),
  description: safeOptionalOrganizationText.default(''),
  visibility: z.enum(['public', 'unlisted', 'members_only']).default('members_only'),
}).strict()
const organizationApplicationUpdateSchema = z.object({
  expectedRevision: z.number().int().min(1),
  setup: z.record(z.string(), z.unknown()),
}).strict()
const organizationApplicationSubmitSchema = z.object({
  expectedRevision: z.number().int().min(1),
}).strict()
const organizationApplicationReviewSchema = z.object({
  expectedRevision: z.number().int().min(1),
  decision: z.enum(['approve', 'changes_requested', 'reject']),
  message: z.string().trim().max(4000).default(''),
}).strict()
const organizationTelegramBotSchema = z.object({
  token: z.string().trim().regex(/^[0-9]{6,16}:[A-Za-z0-9_-]{30,100}$/),
  defaultChatId: z.string().trim().regex(/^-?[0-9]{5,63}$/).nullable().optional(),
}).strict()
const organizationBrandSchema = z.object({
  displayName: safeOrganizationText.min(2).max(80),
  shortName: safeOrganizationText.min(2).max(24),
  accentColor: z.string().regex(/^#[0-9a-f]{6}$/i),
  logoUrl: z.union([z.literal(''), z.string().url().max(512)]).optional(),
}).strict()
const aptosAddressSchema = z.string().trim().toLowerCase().regex(/^0x[0-9a-f]{64}$/)
const organizationProfileSchema = z.object({
  name: safeOrganizationText.min(2).max(120).optional(),
  description: safeOptionalOrganizationText.optional(),
  visibility: z.enum(['public', 'unlisted', 'members_only']).optional(),
  brand: organizationBrandSchema.optional(),
  status: z.enum(['draft', 'active']).optional(),
  aptosNetwork: z.enum(['testnet', 'mainnet', 'devnet', 'local']).optional(),
  aptosModuleAddress: aptosAddressSchema.nullable().optional(),
  aptosOrganizationAddress: aptosAddressSchema.nullable().optional(),
}).strict()
const organizationSettingsSchema = z.object({
  locale: z.enum(['ru', 'en']).optional(),
  governance: z.record(z.string(), z.unknown()).optional(),
  qualification: z.record(z.string(), z.unknown()).optional(),
  features: z.record(z.string(), z.unknown()).optional(),
}).strict()
const organizationSponsorSchema = z.object({
  perTransactionLimitOctas: z.number().int().min(1).max(10_000_000).default(1_000_000),
  perUserDailyLimitOctas: z.number().int().min(1).max(100_000_000).default(5_000_000),
  dailyBudgetOctas: z.number().int().min(1).max(10_000_000_000).default(100_000_000),
}).strict()
const organizationDomainSchema = z.object({
  hostname: z.string().trim().toLowerCase().max(253).regex(/^[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?$/),
  isPrimary: z.boolean().default(false),
}).strict()

const localizedAccessTextSchema = z.object({
  ru: safeOrganizationText.min(1).max(120),
  en: safeOrganizationText.min(1).max(120),
}).strict()
const accessConditionSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('tenure_days_at_least'), days: z.number().int().min(0).max(36_500) }).strict(),
  z.object({ kind: z.literal('verified_exam_passed'), examId: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/), minScoreBps: z.number().int().min(0).max(10_000) }).strict(),
  z.object({ kind: z.literal('qualification_level_at_least'), categoryId: z.string().regex(/^\d+$/), level: z.number().int().min(0).max(3) }).strict(),
])
const accessRoleSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,47}$/),
  name: localizedAccessTextSchema,
  description: localizedAccessTextSchema,
  enabled: z.boolean().default(true),
  autoRule: z.object({ mode: z.enum(['all', 'any']).default('all'), conditions: z.array(accessConditionSchema).max(20) }).nullable().default(null),
  capabilities: z.array(z.string().trim().min(2).max(80)).max(40).default([]),
}).strict()
const accessGrantSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,47}$/),
  userId: z.string().uuid(),
  expiresAt: z.string().datetime().nullable().default(null),
}).strict()
const accessDelegationSchema = z.object({
  key: z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,47}$/),
  administratorUserId: z.string().uuid(),
  canGrant: z.boolean(),
  canEditRules: z.boolean(),
}).strict()
const resourceAudienceSchema = z.object({
  audience: z.enum(['public', 'member', 'roles']),
  requiredRoles: z.array(z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,47}$/)).max(20).default([]),
}).strict()
const resourceAccessSchema = z.object({
  type: z.enum(['election', 'document', 'exam', 'workspace']),
  id: z.string().trim().min(1).max(200),
  audience: z.enum(['public', 'member', 'roles']),
  requiredRoles: z.array(z.string().trim().toLowerCase().regex(/^[a-z][a-z0-9_]{1,47}$/)).max(20).default([]),
  policies: z.object({
    discover: resourceAudienceSchema.optional(),
    subject: resourceAudienceSchema.optional(),
    participate: resourceAudienceSchema.optional(),
    results: resourceAudienceSchema.optional(),
    ballots: resourceAudienceSchema.optional(),
    content: resourceAudienceSchema.optional(),
  }).strict().optional(),
}).strict()
const verifiedExamEvidenceSchema = z.object({
  userId: z.string().uuid(),
  examId: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
  scoreBps: z.number().int().min(0).max(10_000),
  passedAt: z.string().datetime().optional(),
  evidenceHash: z.string().trim().max(200).nullable().default(null),
}).strict()
const verifiedQualificationEvidenceSchema = z.object({
  userId: z.string().uuid(),
  categoryId: z.string().trim().regex(/^[0-9]{1,20}$/),
  level: z.number().int().min(0).max(3),
  eligible: z.boolean().default(true),
  evidenceHash: z.string().trim().max(200).nullable().default(null),
}).strict()
const accessFilterSchema = z.object({
  type: z.enum(['election', 'document', 'exam', 'workspace']),
  ids: z.array(z.string().trim().min(1).max(200)).max(500),
  scope: z.enum(['discover', 'subject', 'participate', 'results', 'ballots', 'content']).optional(),
}).strict()
function resolvePath(root, pathname) {
  const relative = normalize(decodeURIComponent(pathname).replace(/^[/\\]+/, ''))
  const candidate = resolve(root, relative)
  return candidate === root || candidate.startsWith(`${root}${sep}`) ? candidate : null
}

function sendFile(response, filePath, method, cache = true) {
  const serviceWorker = filePath.endsWith(`${sep}sw.js`)
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
    'Cache-Control': serviceWorker ? 'no-store, max-age=0' : !cache || filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=86400',
    ...(serviceWorker ? {
      'CDN-Cache-Control': 'no-store',
      'Cloudflare-CDN-Cache-Control': 'no-store',
      'Service-Worker-Allowed': '/',
    } : {}),
    ...securityHeaders,
  })
  if (method === 'HEAD') return response.end()
  createReadStream(filePath).pipe(response)
}

function sendHealth(response, method) {
  const body = JSON.stringify({ ok: true, service: 'novyway-site' })
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body), 'Cache-Control': 'no-store', 'X-Novyway-Server': '2', ...securityHeaders })
  response.end(method === 'HEAD' ? undefined : body)
}

const requestWindows = new Map()
const RATE_LIMIT_MAX_KEYS = 10_000
let lastRateLimitSweep = 0

function sweepRateLimits(nowMs) {
  if (nowMs - lastRateLimitSweep < 60_000 && requestWindows.size < RATE_LIMIT_MAX_KEYS) return
  lastRateLimitSweep = nowMs
  for (const [key, value] of requestWindows) {
    if (value.resetAt <= nowMs) requestWindows.delete(key)
  }
  while (requestWindows.size > RATE_LIMIT_MAX_KEYS) {
    requestWindows.delete(requestWindows.keys().next().value)
  }
}

function rateLimit(request, bucket, limit, windowMs) {
  const remote = request.socket.remoteAddress ?? 'unknown'
  const fromLoopback = remote === '127.0.0.1' || remote === '::1' || remote === '::ffff:127.0.0.1'
  const cloudflareAddress = fromLoopback ? request.headers['cf-connecting-ip'] : null
  const ip = String(Array.isArray(cloudflareAddress) ? cloudflareAddress[0] : cloudflareAddress ?? remote).trim()
  const key = `${bucket}:${ip}`
  const nowMs = Date.now()
  sweepRateLimits(nowMs)
  const current = requestWindows.get(key)
  if (!current || current.resetAt <= nowMs) {
    requestWindows.set(key, { count: 1, resetAt: nowMs + windowMs })
    return
  }
  current.count += 1
  if (current.count > limit) throw Object.assign(new Error('too_many_requests'), { status: 429 })
}

function rateLimitIdentifier(bucket, identifier, limit, windowMs) {
  const key = `${bucket}:${hashSecret(String(identifier).trim().toLowerCase())}`
  const nowMs = Date.now()
  sweepRateLimits(nowMs)
  const current = requestWindows.get(key)
  if (!current || current.resetAt <= nowMs) {
    requestWindows.set(key, { count: 1, resetAt: nowMs + windowMs })
    return
  }
  current.count += 1
  if (current.count > limit) throw Object.assign(new Error('too_many_requests'), { status: 429 })
}

async function sessionFromRequest(request) {
  const cookies = parseCookies(request)
  const secure = requestOrigin(request).origin.startsWith('https:')
  return getSession(secure ? cookies['__Host-sovet_session'] : cookies.sovet_session)
}

async function requireSession(request) {
  const session = await sessionFromRequest(request)
  if (!session) throw Object.assign(new Error('authentication_required'), { status: 401 })
  return session
}

async function isProtectedCreatorAccount(row) {
  const settings = await getSettings()
  const protectedByEmail = Boolean(row?.email_verified && row?.email
    && row.email.toLowerCase() === String(settings.superAdminEmail ?? '').toLowerCase())
  if (protectedByEmail) return true
  if (!row?.aptos_address) return false
  try {
    return Boolean((await governanceAccess(row.aptos_address)).isCreator)
  } catch {
    return row.role === 'super_admin'
  }
}

function organizationIdForRequest(request) {
  return request.organizationContext?.organizationId ?? DEFAULT_ORGANIZATION_ID
}

async function permissionsFor(row, organizationId = DEFAULT_ORGANIZATION_ID) {
  const userId = row?.user_id ?? row?.id
  const membership = userId ? await getOrganizationMembership(organizationId, userId) : null
  const organizationRole = membership?.status === 'active' ? membership.role : null
  const isDefaultOrganization = organizationId === DEFAULT_ORGANIZATION_ID
  const signerAddress = row?.auth_method === 'aptos_signature' && typeof row?.auth_address === 'string'
    ? row.auth_address.toLowerCase()
    : null

  let signerAccess = null
  if (signerAddress) {
    try { signerAccess = await governanceAccess(signerAddress) } catch { signerAccess = null }
  }

  let protectedCreator = false
  if (isDefaultOrganization) {
    try { protectedCreator = await isProtectedCreatorAccount(row) } catch { protectedCreator = false }
  }

  return resolveOrganizationPermissions({
    organizationRole,
    protectedCreator,
    legacyRole: row?.role ?? 'voter',
    signerAccess,
    isDefaultOrganization,
  })
}

async function exposedUser(row, csrfToken, organizationId = DEFAULT_ORGANIZATION_ID) {
  return publicUser(row, csrfToken, await permissionsFor(row, organizationId))
}

function activeMembership(membership) {
  return membership?.status === 'active' ? membership : null
}

function organizationAccessFor(configuration, membership) {
  const visibility = configuration?.organization?.visibility ?? 'public'
  const member = activeMembership(membership)
  return {
    visibility,
    memberOnly: visibility === 'members_only',
    canViewWorkspace: visibility !== 'members_only' || Boolean(member),
  }
}

function organizationPublicShell(configuration, membership) {
  if (!configuration) return null
  const access = organizationAccessFor(configuration, membership)
  if (access.canViewWorkspace) return { ...configuration, access, membership }
  return {
    organization: configuration.organization,
    locale: configuration.locale,
    features: {},
    schemaVersion: configuration.schemaVersion,
    membership: null,
    access,
  }
}

async function requireSuperAdmin(request, organizationId = organizationIdForRequest(request)) {
  const session = await requireSession(request)
  const permissions = await permissionsFor(session, organizationId)
  if (!permissions.isSuperAdmin) throw Object.assign(new Error('super_admin_required'), { status: 403 })
  return session
}

function requirePlatformRequest(request) {
  if (request.organizationContext?.explicit) {
    throw Object.assign(new Error('not_found'), { status: 404 })
  }
}

async function requirePlatformSuperAdmin(request) {
  requirePlatformRequest(request)
  const session = await requireSession(request)
  if (!await isProtectedCreatorAccount(session)) {
    throw Object.assign(new Error('platform_super_admin_required'), { status: 403 })
  }
  return session
}

async function requireGovernanceAdmin(request, organizationId = organizationIdForRequest(request)) {
  const session = await requireSession(request)
  const permissions = await permissionsFor(session, organizationId)
  if (!permissions.isAdmin) throw Object.assign(new Error('governance_admin_required'), { status: 403 })
  return session
}

async function requireOrganizationOwner(request, organizationId = organizationIdForRequest(request)) {
  const session = await requireSession(request)
  const membership = await getOrganizationMembership(organizationId, session.user_id)
  if (membership?.status !== 'active' || membership.role !== 'owner') {
    throw Object.assign(new Error('organization_owner_required'), { status: 403 })
  }
  return session
}

async function requireOrganizationAdmin(request, organizationId = organizationIdForRequest(request)) {
  const session = await requireSession(request)
  const membership = await getOrganizationMembership(organizationId, session.user_id)
  if (membership?.status !== 'active' || !['owner', 'governance_admin'].includes(membership.role)) {
    throw Object.assign(new Error('organization_admin_required'), { status: 403 })
  }
  return session
}

function votingAddressFor(session) {
  if (session.auth_method === 'aptos_signature' && typeof session.auth_address === 'string') {
    return session.auth_address.toLowerCase()
  }
  if (session.wallet_kind === 'managed') return session.aptos_address.toLowerCase()
  throw Object.assign(new Error('aptos_signature_required'), { status: 403 })
}

const sponsoredVoteReservedOctas = 1_000_000

async function sponsoredWriteContext({ request, session, settings, idempotencyKey, intentKind }) {
  const organizationId = organizationIdForRequest(request)
  if (organizationId === DEFAULT_ORGANIZATION_ID) {
    if (!settings.sponsorshipEnabled) throw Object.assign(new Error('sponsorship_disabled'), { status: 503 })
    const chain = await aptosStatus()
    if (!chain.sourceParityVerified) throw Object.assign(new Error('contract_source_mismatch'), { status: 503 })
    if (!chain.ok || Number(chain.relayerBalanceOctas ?? 0) < sponsoredVoteReservedOctas) {
      throw Object.assign(new Error('relayer_unfunded'), { status: 503 })
    }
    if (await countRecentSponsoredVotes(session.user_id, organizationId) >= settings.maxSponsoredVotesPerHour) {
      throw Object.assign(new Error('sponsorship_rate_limited'), { status: 429 })
    }
    if (await countRecentSponsoredVotes(null, organizationId) >= settings.maxSponsoredVotesGlobalPerHour * 4) {
      throw Object.assign(new Error('sponsorship_global_rate_limited'), { status: 429 })
    }
    return { organizationId, feePayerAddress: aptosRuntime.relayerAddress, feePayerPrivateKey: null, usageIdempotencyKey: null }
  }

  const sponsor = await loadOrganizationSponsorSignerMaterial(organizationId)
  if (!sponsor || sponsor.status !== 'active') throw Object.assign(new Error('organization_sponsorship_unavailable'), { status: 503 })
  if (sponsor.custodyKind !== 'server_encrypted' || !sponsor.encryptedPrivateKey) {
    throw Object.assign(new Error('organization_sponsor_external_signer_not_configured'), { status: 503 })
  }
  const [chain, balanceOctas] = await Promise.all([aptosStatus(), aptosAccountBalance(sponsor.publicAddress)])
  if (!chain.sourceParityVerified) throw Object.assign(new Error('contract_source_mismatch'), { status: 503 })
  if (!chain.ok || Number(balanceOctas ?? 0) < sponsoredVoteReservedOctas) {
    throw Object.assign(new Error('organization_relayer_unfunded'), { status: 503 })
  }
  await reserveOrganizationSponsorUsage({
    organizationId,
    userId: session.user_id,
    idempotencyKey,
    intentKind,
    reservedOctas: sponsoredVoteReservedOctas,
  })
  return {
    organizationId,
    feePayerAddress: sponsor.publicAddress,
    feePayerPrivateKey: decryptOrganizationRelayerPrivateKey(sponsor.encryptedPrivateKey),
    usageIdempotencyKey: idempotencyKey,
  }
}

async function startSession(response, request, user, authMethod = 'password', authAddress = null) {
  const token = randomToken()
  const csrfToken = randomToken(24)
  let privileged = false
  if (authMethod === 'aptos_signature' && typeof authAddress === 'string') {
    try { privileged = Boolean((await governanceAccess(authAddress)).isAdmin) } catch { privileged = false }
  }
  const lifetimeSeconds = privileged ? 12 * 60 * 60 : 14 * 24 * 60 * 60
  const expiresAt = new Date(Date.now() + lifetimeSeconds * 1000).toISOString()
  await createSession({ userId: user.id, token, csrfToken, expiresAt, authMethod, authAddress })
  const secure = requestOrigin(request).origin.startsWith('https:')
  const organizationId = organizationIdForRequest(request)
  return { user: await exposedUser({ ...user, auth_method: authMethod, auth_address: authAddress }, csrfToken, organizationId), cookies: [sessionCookie(token, lifetimeSeconds, secure), csrfCookie(csrfToken, lifetimeSeconds, secure)] }
}

async function issueEmailCode({ user, email, deliveryEmail = email, purpose, lang, parentVerificationId = null }) {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
  const normalizedEmail = email.trim().toLowerCase()
  const codeHash = hashEmailCode({ userId: user.id, purpose, email: normalizedEmail, code })
  const verificationId = await putEmailVerification({
    userId: user.id,
    purpose,
    targetEmail: normalizedEmail,
    codeHash,
    expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    parentVerificationId,
  })
  await sendVerificationCode({ to: deliveryEmail.trim().toLowerCase(), code, purpose, lang })
  return verificationId
}

function requireCsrf(request, session) {
  enforceSameOrigin(request)
  const token = request.headers['x-csrf-token']
  if (typeof token !== 'string' || hashSecret(token) !== session.csrf_hash) {
    throw Object.assign(new Error('invalid_csrf'), { status: 403 })
  }
}

async function handlePublicApi(request, response, url, organizationContext) {
  enforceOrganizationOrigin(request, organizationContext)
  if (request.method !== 'GET' && request.method !== 'HEAD' && url.pathname !== '/api/auth/logout') {
    const settings = await getSettings()
    if (settings.maintenanceMode) return json(response, 503, { error: 'maintenance_mode' }, { 'Retry-After': '300' })
  }
  if (url.pathname === '/api/music/playlist' && request.method === 'GET') {
    const allowed = musicAllowed(request)
    const tracks = allowed ? musicTracks.filter(([file]) => existsSync(join(musicRoot, file))).map(([file, title], index) => ({
      id: index + 1,
      title,
      // ?v=<mtime> busts the browser HTTP cache when a track file is replaced.
      url: `/media/music/${encodeURIComponent(file)}?v=${Math.trunc(statSync(join(musicRoot, file)).mtimeMs)}`,
    })) : []
    return json(response, 200, {
      enabled: tracks.length === musicTracks.length,
      localPreview: !publicMusicEnabled,
      tracks,
      legalNotice: publicMusicEnabled ? null : 'Local preview only. Set PUBLIC_MUSIC_ENABLED to true in server/static-server.mjs to enable on the public site.',
    }, { 'Cache-Control': 'no-store' })
  }
  const publicOrganizationConfigMatch = url.pathname.match(/^\/api\/organizations\/([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)\/config$/)
  if (publicOrganizationConfigMatch && request.method === 'GET') {
    const organization = await findOrganizationBySlug(publicOrganizationConfigMatch[1])
    if (!organization || organization.status !== 'active') return json(response, 404, { error: 'organization_not_found' })
    const session = await sessionFromRequest(request)
    const [configuration, membership] = await Promise.all([
      getOrganizationConfig(organization.id),
      session ? getOrganizationMembership(organization.id, session.user_id) : null,
    ])
    const exposedConfiguration = organizationPublicShell(configuration, membership)
    return json(response, 200, {
      ...exposedConfiguration,
      verification: { status: 'verified', orgSlug: organization.slug, verifiedAt: new Date().toISOString() },
    }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/config' && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    const [settings, configuration, membership] = await Promise.all([
      getSettings(),
      getOrganizationConfig(organizationContext.organizationId),
      session ? getOrganizationMembership(organizationContext.organizationId, session.user_id) : null,
    ])
    const exposedConfiguration = organizationPublicShell(configuration, membership)
    const access = organizationAccessFor(configuration, membership)
    const sponsorEnabled = access.canViewWorkspace && (configuration?.sponsor?.status === 'active'
      || (organizationContext.organizationId === DEFAULT_ORGANIZATION_ID && settings.sponsorshipEnabled))
    return json(response, 200, {
      network: configuration?.organization?.aptos?.network ?? 'testnet',
      moduleAddress: configuration?.organization?.aptos?.moduleAddress ?? aptosRuntime.moduleAddress,
      organization: exposedConfiguration,
      features: {
        accounts: true,
        aptosConnect: true,
        passwordAccounts: true,
        emailDelivery: emailDeliveryConfigured(),
        sponsoredVotes: sponsorEnabled && !sponsorshipLocked,
      },
    })
  }
  if (url.pathname === '/api/organization' && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    const [configuration, membership] = await Promise.all([
      getOrganizationConfig(organizationContext.organizationId),
      session ? getOrganizationMembership(organizationContext.organizationId, session.user_id) : null,
    ])
    return json(response, 200, organizationPublicShell(configuration, membership), { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/me' && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    const access = await resolveOrganizationAccess(organizationContext.organizationId, session?.user_id ?? null)
    return json(response, 200, { access }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access' && request.method === 'GET') {
    const session = await requireOrganizationAdmin(request)
    const access = await getAccessConsole(organizationContext.organizationId, session.user_id)
    return json(response, 200, { access }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/roles' && request.method === 'PUT') {
    const session = await requireOrganizationAdmin(request)
    requireCsrf(request, session)
    const input = accessRoleSchema.parse(await readJson(request, 64_000))
    const role = await putAccessRole({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 200, { role }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/grants' && request.method === 'PUT') {
    const session = await requireOrganizationAdmin(request)
    requireCsrf(request, session)
    const input = accessGrantSchema.parse(await readJson(request, 8_192))
    await putAccessGrant({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/grants' && request.method === 'DELETE') {
    const session = await requireOrganizationAdmin(request)
    requireCsrf(request, session)
    const input = accessGrantSchema.omit({ expiresAt: true }).parse(await readJson(request, 8_192))
    await revokeAccessGrant({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/delegations' && request.method === 'PUT') {
    const session = await requireOrganizationOwner(request)
    requireCsrf(request, session)
    const input = accessDelegationSchema.parse(await readJson(request, 8_192))
    await putAccessDelegation({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/resources' && request.method === 'PUT') {
    const session = await requireOrganizationOwner(request)
    requireCsrf(request, session)
    const input = resourceAccessSchema.parse(await readJson(request, 16_384))
    await putResourceAccess({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/evidence/exams' && request.method === 'PUT') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const input = verifiedExamEvidenceSchema.parse(await readJson(request, 8_192))
    await putVerifiedExamResult({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/evidence/qualifications' && request.method === 'PUT') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const input = verifiedQualificationEvidenceSchema.parse(await readJson(request, 8_192))
    await putVerifiedQualificationResult({ organizationId: organizationContext.organizationId, actorUserId: session.user_id, ...input })
    return json(response, 204, null, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/access/filter' && request.method === 'POST') {
    const session = await sessionFromRequest(request)
    const input = accessFilterSchema.parse(await readJson(request, 32_768))
    const ids = await filterAccessibleResourceIds({
      organizationId: organizationContext.organizationId,
      userId: session?.user_id ?? null,
      type: input.type,
      ids: input.ids,
      scope: input.scope ?? 'discover',
    })
    return json(response, 200, { ids }, { 'Cache-Control': 'no-store' })
  }
  const accessResourceMatch = url.pathname.match(/^\/api\/organization\/access\/resources\/(election|document|exam|workspace)\/([^/]+)$/)
  if (accessResourceMatch && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    const resourceType = accessResourceMatch[1]
    const resourceId = decodeURIComponent(accessResourceMatch[2])
    const scope = url.searchParams.get('scope') ?? 'discover'
    await requireResourceAccess({
      organizationId: organizationContext.organizationId,
      userId: session?.user_id ?? null,
      type: resourceType,
      id: resourceId,
      scope,
    })
    const permissions = await getResourcePermissions({
      organizationId: organizationContext.organizationId,
      userId: session?.user_id ?? null,
      type: resourceType,
      id: resourceId,
    })
    return json(response, 200, { allowed: true, permissions }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organizations' && request.method === 'POST') {
    return json(response, 410, { error: 'organization_application_required' }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization-applications' && request.method === 'GET') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    const applications = await listOrganizationApplicationsForCreator(session.user_id)
    return json(response, 200, { applications }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization-applications' && request.method === 'POST') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-application-create', session.user_id, 5, 24 * 60 * 60_000)
    const input = organizationCreateSchema.parse(await readJson(request, 16_384))
    const application = await createOrganizationApplication({ ...input, creatorUserId: session.user_id })
    return json(response, 201, { application }, { 'Cache-Control': 'no-store' })
  }
  const organizationApplicationMatch = url.pathname.match(/^\/api\/organization-applications\/([0-9a-f-]{36})$/i)
  if (organizationApplicationMatch && request.method === 'GET') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    const application = await getOrganizationApplicationForCreator(organizationApplicationMatch[1], session.user_id)
    return application
      ? json(response, 200, { application }, { 'Cache-Control': 'no-store' })
      : json(response, 404, { error: 'organization_application_not_found' }, { 'Cache-Control': 'no-store' })
  }
  if (organizationApplicationMatch && request.method === 'PATCH') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-application-update', session.user_id, 180, 60 * 60_000)
    const input = organizationApplicationUpdateSchema.parse(await readJson(request, 150_000))
    const application = await updateOrganizationApplication({
      applicationId: organizationApplicationMatch[1],
      creatorUserId: session.user_id,
      ...input,
    })
    return json(response, 200, { application }, { 'Cache-Control': 'no-store' })
  }
  const organizationApplicationSubmitMatch = url.pathname.match(/^\/api\/organization-applications\/([0-9a-f-]{36})\/submit$/i)
  if (organizationApplicationSubmitMatch && request.method === 'POST') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-application-submit', session.user_id, 12, 24 * 60 * 60_000)
    const input = organizationApplicationSubmitSchema.parse(await readJson(request, 8_192))
    const application = await submitOrganizationApplication({
      applicationId: organizationApplicationSubmitMatch[1],
      creatorUserId: session.user_id,
      ...input,
    })
    return json(response, 200, { application }, { 'Cache-Control': 'no-store' })
  }
  const organizationApplicationBotMatch = url.pathname.match(/^\/api\/organization-applications\/([0-9a-f-]{36})\/notification-bot$/i)
  if (organizationApplicationBotMatch) {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    const application = await getOrganizationApplicationForCreator(organizationApplicationBotMatch[1], session.user_id)
    if (!application) return json(response, 404, { error: 'organization_application_not_found' }, { 'Cache-Control': 'no-store' })
    if (application.status !== 'approved' || !application.approvedOrganizationId) {
      return json(response, 409, { error: 'organization_not_approved' }, { 'Cache-Control': 'no-store' })
    }

    if (request.method === 'GET') {
      const integration = await getOrganizationNotificationIntegration(application.approvedOrganizationId)
      return json(response, 200, { integration }, { 'Cache-Control': 'no-store' })
    }
    if (request.method === 'PUT') {
      requireCsrf(request, session)
      rateLimitIdentifier('organization-notification-bot-configure', session.user_id, 10, 24 * 60 * 60_000)
      const input = organizationTelegramBotSchema.parse(await readJson(request, 8_192))
      const bot = await telegramBotRequest(input.token, 'getMe')
      if (!bot?.is_bot || !bot?.id || !bot?.username) {
        throw Object.assign(new Error('telegram_bot_identity_invalid'), { status: 422 })
      }
      const integration = await configureOrganizationNotificationIntegration({
        organizationId: application.approvedOrganizationId,
        actorUserId: session.user_id,
        encryptedToken: encryptOrganizationNotificationToken(input.token),
        botId: String(bot.id),
        botUsername: String(bot.username),
        defaultChatId: input.defaultChatId ?? null,
      })
      return json(response, 200, { integration }, { 'Cache-Control': 'no-store' })
    }
    if (request.method === 'DELETE') {
      requireCsrf(request, session)
      rateLimitIdentifier('organization-notification-bot-remove', session.user_id, 10, 24 * 60 * 60_000)
      await removeOrganizationNotificationIntegration({
        organizationId: application.approvedOrganizationId,
        actorUserId: session.user_id,
      })
      return json(response, 200, { removed: true }, { 'Cache-Control': 'no-store' })
    }
  }
  const organizationApplicationBotTestMatch = url.pathname.match(/^\/api\/organization-applications\/([0-9a-f-]{36})\/notification-bot\/test$/i)
  if (organizationApplicationBotTestMatch && request.method === 'POST') {
    requirePlatformRequest(request)
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-notification-bot-test', session.user_id, 10, 60 * 60_000)
    const application = await getOrganizationApplicationForCreator(organizationApplicationBotTestMatch[1], session.user_id)
    if (!application) return json(response, 404, { error: 'organization_application_not_found' }, { 'Cache-Control': 'no-store' })
    if (application.status !== 'approved' || !application.approvedOrganizationId) {
      return json(response, 409, { error: 'organization_not_approved' }, { 'Cache-Control': 'no-store' })
    }
    const material = await loadOrganizationNotificationSecret(application.approvedOrganizationId)
    if (!material?.enabled) return json(response, 409, { error: 'notification_bot_not_configured' }, { 'Cache-Control': 'no-store' })
    if (!material.default_chat_id) return json(response, 409, { error: 'notification_chat_not_configured' }, { 'Cache-Control': 'no-store' })
    await telegramBotRequest(decryptOrganizationNotificationToken(material.encrypted_token), 'sendMessage', {
      chat_id: material.default_chat_id,
      text: 'Совет онлайн: тестовое уведомление. Бот организации подключён.',
      disable_notification: true,
    })
    return json(response, 200, { sent: true }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/platform/organization-applications' && request.method === 'GET') {
    await requirePlatformSuperAdmin(request)
    const rawStatus = url.searchParams.get('status')
    const status = rawStatus
      ? z.enum(['draft', 'submitted', 'changes_requested', 'approved', 'rejected']).parse(rawStatus)
      : null
    const applications = await listOrganizationApplicationsForReview({ status })
    return json(response, 200, { applications }, { 'Cache-Control': 'no-store' })
  }
  const organizationApplicationReviewMatch = url.pathname.match(/^\/api\/platform\/organization-applications\/([0-9a-f-]{36})\/review$/i)
  if (organizationApplicationReviewMatch && request.method === 'POST') {
    const session = await requirePlatformSuperAdmin(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-application-review', session.user_id, 120, 60 * 60_000)
    const input = organizationApplicationReviewSchema.parse(await readJson(request, 16_384))
    const application = await reviewOrganizationApplication({
      applicationId: organizationApplicationReviewMatch[1],
      reviewerUserId: session.user_id,
      ...input,
    })
    return json(response, 200, { application }, { 'Cache-Control': 'no-store' })
  }  if (url.pathname === '/api/organization/profile' && request.method === 'PATCH') {
    const session = await requireOrganizationOwner(request)
    requireCsrf(request, session)
    const input = organizationProfileSchema.parse(await readJson(request, 32_768))
    if (input.status === 'active') {
      const configuration = await getOrganizationConfig(organizationContext.organizationId)
      if (!configuration?.sponsor || !configuration.organization.aptos.organizationAddress) {
        throw Object.assign(new Error('organization_publish_requirements_missing'), { status: 409 })
      }
    }
    const organization = await updateOrganizationProfile({
      organizationId: organizationContext.organizationId,
      actorUserId: session.user_id,
      ...input,
    })
    return json(response, 200, { organization }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/settings' && request.method === 'PATCH') {
    const session = await requireOrganizationAdmin(request)
    requireCsrf(request, session)
    const input = organizationSettingsSchema.parse(await readJson(request, 64_000))
    const settings = await updateOrganizationSettings({
      organizationId: organizationContext.organizationId,
      actorUserId: session.user_id,
      ...input,
    })
    return json(response, 200, { settings }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/sponsor' && request.method === 'GET') {
    const session = await requireOrganizationOwner(request)
    const sponsor = await getOrganizationSponsor(organizationContext.organizationId)
    const balanceOctas = sponsor ? await aptosAccountBalance(sponsor.publicAddress) : 0
    return json(response, 200, {
      sponsor,
      balanceOctas: String(balanceOctas),
      balanceApt: Number(balanceOctas) / 100_000_000,
      canRotate: false,
      requestedBy: session.user_id,
    }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/sponsor' && request.method === 'POST') {
    const session = await requireOrganizationOwner(request)
    requireCsrf(request, session)
    rateLimitIdentifier('organization-sponsor-create', session.user_id, 3, 24 * 60 * 60_000)
    const input = organizationSponsorSchema.parse(await readJson(request, 8_192))
    const existing = await getOrganizationSponsor(organizationContext.organizationId)
    if (existing) throw Object.assign(new Error('organization_sponsor_already_configured'), { status: 409 })
    const relayer = createOrganizationRelayer()
    const sponsor = await configureOrganizationSponsor({
      organizationId: organizationContext.organizationId,
      actorUserId: session.user_id,
      publicAddress: relayer.aptosAddress,
      encryptedPrivateKey: encryptOrganizationRelayerPrivateKey(relayer.privateKey),
      ...input,
    })
    return json(response, 201, { sponsor, balanceOctas: '0', balanceApt: 0 }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/organization/domains' && request.method === 'POST') {
    const session = await requireOrganizationOwner(request)
    requireCsrf(request, session)
    const input = organizationDomainSchema.parse(await readJson(request, 8_192))
    const domain = await registerOrganizationDomain({
      organizationId: organizationContext.organizationId,
      actorUserId: session.user_id,
      ...input,
    })
    return json(response, 201, { domain }, { 'Cache-Control': 'no-store' })
  }
  if (organizationContext.organizationId !== DEFAULT_ORGANIZATION_ID && url.pathname.startsWith('/api/v1/')) {
    const organizationScopedV1Write = url.pathname === '/api/v1/vote-intents'
      || url.pathname === '/api/v1/admin-election-vote-intents'
      || /^\/api\/v1\/vote-intents\/[0-9a-f-]+\/(?:managed-submission|submission)$/.test(url.pathname)
      || /^\/api\/v1\/operations\/[0-9a-f-]+$/.test(url.pathname)
    if (!organizationScopedV1Write) return json(response, 409, { error: 'organization_v2_endpoint_not_ready' })
  }
  if (url.pathname === '/api/v1/participants' && request.method === 'GET') {
    const query = participantQuerySchema.parse({
      search: url.searchParams.get('search') || undefined,
      role: url.searchParams.get('role') || undefined,
      sort: url.searchParams.get('sort') || undefined,
      direction: url.searchParams.get('direction') || undefined,
      page: url.searchParams.get('page') || undefined,
      pageSize: url.searchParams.get('pageSize') || undefined,
    })
    return json(response, 200, await listParticipants(query), { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/v1/me/activity' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('participant-activity', session.user_id, 240, 60 * 60_000)
    const input = participantActivitySchema.parse(await readJson(request, 8_000))
    const metadata = input.kind === 'exam_passed' ? { scoreBps: input.scoreBps, source: 'platform_exam' } : {}
    const activity = await recordParticipantActivity({
      userId: session.user_id,
      kind: input.kind,
      subjectId: input.subjectId,
      metadata,
    })
    return json(response, activity.created ? 201 : 200, { activity }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/v1/me/qualifications/sync' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('qualification-sync', session.user_id, 12, 60 * 60_000)
    const qualifications = await qualificationSnapshot(session.aptos_address)
    await replaceQualificationSnapshots(session.user_id, qualifications)
    return json(response, 200, { qualifications }, { 'Cache-Control': 'no-store' })
  }
  const participantMatch = url.pathname.match(/^\/api\/v1\/participants\/([^/]{1,100})$/)
  if (participantMatch && request.method === 'GET') {
    const identifier = decodeURIComponent(participantMatch[1])
    if (!/^[0-9a-f-]{36}$/i.test(identifier) && !/^0x[0-9a-f]{64}$/i.test(identifier)) {
      return json(response, 400, { error: 'invalid_participant_id' })
    }
    const participant = await getParticipantProfile(identifier)
    return participant
      ? json(response, 200, { participant }, { 'Cache-Control': 'no-store' })
      : json(response, 404, { error: 'participant_not_found' })
  }
  if (url.pathname === '/api/v1/document-proposals' && request.method === 'GET') {
    const documentId = url.searchParams.get('documentId')
    const electionId = url.searchParams.get('electionId')
    if (documentId && !/^[a-z0-9][a-z0-9-]{0,79}$/.test(documentId)) {
      throw Object.assign(new Error('invalid_document_id'), { status: 400 })
    }
    if (electionId && !/^\d+$/.test(electionId)) throw Object.assign(new Error('invalid_election_id'), { status: 400 })
    const viewer = await sessionFromRequest(request)
    const viewerUserId = viewer?.user_id ?? null
    if (documentId) await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'document', id: documentId, scope: 'content' })
    if (electionId) await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'election', id: electionId, scope: 'subject' })
    const proposals = await listDocumentProposals({ documentId, electionId, viewerUserId })
    const documentIds = [...new Set(proposals.map((proposal) => proposal.documentId))]
    const electionIds = [...new Set(proposals.map((proposal) => proposal.electionId).filter(Boolean))]
    const visibleDocumentIds = new Set(await filterAccessibleResourceIds({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'document', ids: documentIds, scope: 'content' }))
    const visibleElectionIds = new Set(await filterAccessibleResourceIds({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'election', ids: electionIds, scope: 'subject' }))
    const visibleProposals = proposals.filter((proposal) => visibleDocumentIds.has(proposal.documentId) && (!proposal.electionId || visibleElectionIds.has(proposal.electionId)))
    return json(response, 200, { proposals: visibleProposals }, { 'Cache-Control': 'no-store' })
  }
  const proposalHashMatch = url.pathname.match(/^\/api\/v1\/document-proposals\/sha256\/(0x[0-9a-f]{64})$/i)
  if (proposalHashMatch && request.method === 'GET') {
    const proposal = await getDocumentProposalByHash(proposalHashMatch[1])
    if (!proposal) return json(response, 404, { error: 'proposal_not_found' })
    const body = proposal.canonicalText
    response.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(body),
      'Cache-Control': 'public, max-age=31536000, immutable',
      ...securityHeaders,
    })
    return response.end(body)
  }
  const proposalSupportMatch = url.pathname.match(/^\/api\/v1\/document-proposals\/([0-9a-f-]{36})\/support$/)
  if (proposalSupportMatch && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimitIdentifier('proposal-support', session.user_id, 60, 24 * 60 * 60_000)
    const currentProposal = await getDocumentProposal(proposalSupportMatch[1], { viewerUserId: session.user_id })
    if (!currentProposal) return json(response, 404, { error: 'proposal_not_found' })
    await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: session.user_id, type: 'document', id: currentProposal.documentId, scope: 'content' })
    if (currentProposal.electionId) await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: session.user_id, type: 'election', id: currentProposal.electionId, scope: 'participate' })
    const proposal = await supportDocumentProposal({
      id: proposalSupportMatch[1],
      userId: session.user_id,
      supporterAddress: session.aptos_address,
    })
    await logEvent('governance', 'ok', 'Document proposal supported', {
      proposalId: proposal.id,
      supporterAddress: session.aptos_address,
    })
    return json(response, 200, { proposal }, { 'Cache-Control': 'no-store' })
  }
  const proposalProofMatch = url.pathname.match(/^\/api\/v1\/document-proposals\/([0-9a-f-]{36})\/support-proof$/)
  if (proposalProofMatch && request.method === 'GET') {
    const proof = await getDocumentProposalSupportProof(proposalProofMatch[1])
    return proof
      ? json(response, 200, proof, { 'Cache-Control': 'public, max-age=60' })
      : json(response, 404, { error: 'support_proof_not_found' })
  }
  const publicProposalMatch = url.pathname.match(/^\/api\/v1\/document-proposals\/([0-9a-f-]{36})$/)
  if (publicProposalMatch && request.method === 'GET') {
    const viewer = await sessionFromRequest(request)
    const viewerUserId = viewer?.user_id ?? null
    const proposal = await getDocumentProposal(publicProposalMatch[1], { viewerUserId })
    if (!proposal) return json(response, 404, { error: 'proposal_not_found' })
    await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'document', id: proposal.documentId, scope: 'content' })
    if (proposal.electionId) await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: viewerUserId, type: 'election', id: proposal.electionId, scope: 'subject' })
    return json(response, 200, { proposal }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/v1/chain-transactions' && request.method === 'GET') {
    return json(response, 200, { transactionHashes: await listRecordedChainTransactions() }, { 'Cache-Control': 'no-store' })
  }
  if (url.pathname === '/api/v1/governance/document-proposals' && request.method === 'GET') {
    const session = await requireGovernanceAdmin(request)
    const documentId = url.searchParams.get('documentId')
    return json(response, 200, {
      proposals: await listDocumentProposals({ documentId, includeDrafts: true, viewerUserId: session.user_id }),
    }, { 'Cache-Control': 'no-store' })
  }
  if ((url.pathname === '/api/v1/document-proposals' || url.pathname === '/api/v1/governance/document-proposals') && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimit(request, 'document-proposal-create', 30, 60 * 60_000)
    rateLimitIdentifier('document-proposal-create-user', session.user_id, 10, 24 * 60 * 60_000)
    const input = documentProposalSchema.parse(await readJson(request, 96_000))
    await requireResourceAccess({ organizationId: organizationContext.organizationId, userId: session.user_id, type: 'document', id: input.documentId, scope: 'content' })
    const id = randomUUID()
    const createdAt = new Date().toISOString()
    const eligibleAccounts = await countActiveParticipants()
    const proportionalThreshold = Math.ceil(eligibleAccounts * proposalLaunchQuorumBps / 10_000)
    const requiredSupporters = Math.min(eligibleAccounts, Math.max(eligibleAccounts > 1 ? 2 : 1, proportionalThreshold))
    const supportDeadlineAt = new Date(Date.now() + proposalSupportWindowDays * 86_400_000).toISOString()
    const launch = {
      snapshotAt: createdAt,
      eligibleAccounts,
      quorumBps: proposalLaunchQuorumBps,
      requiredSupporters,
      supportDeadlineAt,
    }
    const payload = createProposalPayload(input, {
      id,
      createdAt,
      createdByAddress: session.aptos_address,
      launch,
    })
    const canonicalText = canonicalJson(payload)
    const metadataHash = proposalSha256(payload)
    const metadataUri = `${publicSiteOrigin}/api/v1/document-proposals/sha256/${metadataHash}`
    const proposal = await createDocumentProposal({
      id,
      documentId: input.documentId,
      clauseId: input.clauseId,
      categoryId: input.categoryId,
      canonicalText,
      payload,
      metadataHash,
      metadataUri,
      chainId: 2,
      moduleAddress: aptosRuntime.moduleAddress,
      deploymentGeneration: aptosRuntime.deploymentGeneration,
      createdBy: session.user_id,
      createdByAddress: session.aptos_address,
      idempotencyKey: input.idempotencyKey,
      createdAt,
      supportSnapshotAt: createdAt,
      supportEligibleCount: eligibleAccounts,
      supportQuorumBps: proposalLaunchQuorumBps,
      supportRequiredCount: requiredSupporters,
      supportDeadlineAt,
    })
    await logEvent('governance', 'ok', 'Document proposal initiated', {
      proposalId: proposal.id,
      documentId: proposal.documentId,
      requiredSupporters,
      eligibleAccounts,
    })
    return json(response, 201, { proposal }, { 'Cache-Control': 'no-store' })
  }
  const prepareProposalMatch = url.pathname.match(/^\/api\/v1\/governance\/document-proposals\/([0-9a-f-]{36})\/prepare-election$/)
  if (prepareProposalMatch && request.method === 'POST') {
    const session = await requireGovernanceAdmin(request)
    requireCsrf(request, session)
    rateLimitIdentifier('document-proposal-prepare', session.user_id, 30, 60 * 60_000)
    const current = await getDocumentProposal(prepareProposalMatch[1], { includeDrafts: true, viewerUserId: session.user_id })
    if (!current) return json(response, 404, { error: 'proposal_not_found' })
    if (current.status !== 'ready') return json(response, 409, { error: 'proposal_not_ready' })
    const durationDays = Number(current.payload.voting.durationDays ?? 14)
    const endsAtSecs = String(Math.floor(Date.now() / 1000) + durationDays * 86_400)
    const proposal = await prepareDocumentProposalElection({
      id: current.id,
      endsAtSecs,
      viewerUserId: session.user_id,
    })
    return json(response, 200, {
      proposal,
      transaction: {
        function: `${aptosRuntime.moduleAddress}::weighted_voting::create_election`,
        functionArguments: [
          proposal.categoryId,
          Array.from(Buffer.from(proposal.metadataHash.slice(2), 'hex')),
          Array.from(Buffer.from(proposal.metadataUri, 'utf8')),
          '0',
          proposal.payload.voting.endsAtSecs,
          proposal.payload.voting.passBps,
          proposal.payload.voting.quorumBps,
          proposal.payload.voting.allowRevote,
        ],
      },
    }, { 'Cache-Control': 'no-store' })
  }
  const publishProposalMatch = url.pathname.match(/^\/api\/v1\/governance\/document-proposals\/([0-9a-f-]{36})\/publish$/)
  if (publishProposalMatch && request.method === 'POST') {
    const session = await requireGovernanceAdmin(request)
    requireCsrf(request, session)
    rateLimit(request, 'document-proposal-publish', 60, 60 * 60_000)
    const input = proposalPublishSchema.parse(await readJson(request))
    const proposal = await getDocumentProposal(publishProposalMatch[1], { includeDrafts: true })
    if (!proposal) return json(response, 404, { error: 'proposal_not_found' })
    const verified = await verifyElectionCreation({
      txHash: input.txHash,
      expectedAdmin: session.auth_address,
      expectedCategoryId: proposal.categoryId,
      expectedMetadataHash: proposal.metadataHash,
      expectedMetadataUri: proposal.metadataUri,
      expectedEndsAtSecs: proposal.payload.voting.endsAtSecs,
      expectedPassBps: proposal.payload.voting.passBps,
      expectedQuorumBps: proposal.payload.voting.quorumBps,
      expectedAllowRevote: proposal.payload.voting.allowRevote,
    })
    if (verified.chainId !== proposal.chainId
      || verified.moduleAddress !== proposal.moduleAddress.toLowerCase()
      || verified.deploymentGeneration !== proposal.deploymentGeneration) {
      throw Object.assign(new Error('proposal_deployment_mismatch'), { status: 409 })
    }
    const published = await publishDocumentProposal({
      id: proposal.id,
      electionId: verified.electionId,
      txHash: verified.txHash,
    })
    await logEvent('governance', 'ok', 'Document amendment election published', {
      proposalId: proposal.id,
      electionId: verified.electionId,
      txHash: verified.txHash,
      documentId: proposal.documentId,
    })
    return json(response, 200, { proposal: published, verification: verified }, { 'Cache-Control': 'no-store' })
  }
  const finalizeProposalMatch = url.pathname.match(/^\/api\/v1\/governance\/document-proposals\/([0-9a-f-]{36})\/finalize$/)
  if (finalizeProposalMatch && request.method === 'POST') {
    const session = await requireGovernanceAdmin(request)
    requireCsrf(request, session)
    rateLimit(request, 'document-proposal-finalize', 60, 60 * 60_000)
    const input = proposalPublishSchema.parse(await readJson(request))
    const proposal = await getDocumentProposal(finalizeProposalMatch[1], { includeDrafts: true })
    if (!proposal || proposal.status !== 'published' || !proposal.electionId) {
      return json(response, 404, { error: 'published_proposal_not_found' })
    }
    const verified = await verifyElectionFinalization({
      txHash: input.txHash,
      expectedSender: session.auth_address,
      expectedElectionId: proposal.electionId,
    })
    const finalized = await recordDocumentProposalFinalization({
      id: proposal.id,
      txHash: verified.txHash,
    })
    await logEvent('governance', 'ok', 'Document amendment election finalized', {
      proposalId: proposal.id,
      electionId: verified.electionId,
      txHash: verified.txHash,
      quorumMet: verified.quorumMet,
      passed: verified.passed,
      documentId: proposal.documentId,
    })
    return json(response, 200, { proposal: finalized, verification: verified }, { 'Cache-Control': 'no-store' })
  }


  if (url.pathname === '/api/logic-game/state' && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    return json(response, 200, {
      authenticated: Boolean(session),
      totalChallenges: logicChallenges.length,
      profile: await getLogicGameProfile(session?.user_id ?? null),
    })
  }
  if (url.pathname === '/api/logic-game/round' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'logic-game-round', 90, 60 * 60_000)
    const input = logicRoundSchema.parse(await readJson(request))
    const session = await sessionFromRequest(request)
    if (session) requireCsrf(request, session)
    const answered = new Set(await listLogicGameAnsweredIds(session?.user_id ?? null))
    const selection = filterLogicChallenges(logicChallenges, input)
    const selectionAnswered = selection.reduce((count, challenge) => count + Number(answered.has(challenge.id)), 0)
    const remaining = selection.filter((challenge) => !answered.has(challenge.id))
    if (remaining.length === 0) {
      return json(response, 200, {
        complete: true,
        totalChallenges: logicChallenges.length,
        selectionTotal: selection.length,
        selectionAnswered,
        profile: await getLogicGameProfile(session?.user_id ?? null),
      })
    }
    const challenge = remaining[randomInt(0, remaining.length)]
    const roundToken = randomToken(24)
    await createLogicGameRound({
      token: roundToken,
      userId: session?.user_id ?? null,
      challengeId: challenge.id,
      lang: input.lang,
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    })
    return json(response, 201, {
      complete: false,
      roundToken,
      challenge: presentLogicChallenge(challenge, input.lang),
      totalChallenges: logicChallenges.length,
      selectionTotal: selection.length,
      selectionAnswered,
      profile: await getLogicGameProfile(session?.user_id ?? null),
    })
  }
  if (url.pathname === '/api/logic-game/answer' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'logic-game-answer', 120, 60 * 60_000)
    const input = logicAnswerSchema.parse(await readJson(request))
    const round = await consumeLogicGameRound(input.roundToken)
    if (!round) return json(response, 400, { error: 'logic_round_invalid_or_expired' })
    const session = await sessionFromRequest(request)
    if (round.user_id) {
      if (!session || session.user_id !== round.user_id) return json(response, 403, { error: 'logic_round_session_mismatch' })
      requireCsrf(request, session)
    }
    const challenge = getLogicChallenge(round.challenge_id)
    if (!challenge || input.selectedIndex >= challenge.segments[round.lang].length) {
      return json(response, 400, { error: 'logic_answer_invalid' })
    }
    const result = scoreLogicAnswer(challenge, input.selectedIndex, round.lang)
    const saved = await recordLogicGameAnswer({
      userId: round.user_id,
      challengeId: challenge.id,
      selectedIndex: input.selectedIndex,
      correct: result.correct,
      points: result.points,
    })
    return json(response, 200, {
      ...result,
      points: saved.recorded || !round.user_id ? result.points : 0,
      recorded: saved.recorded,
      profile: saved.profile,
      totalChallenges: logicChallenges.length,
    })
  }
  if (url.pathname === '/api/auth/password/register' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'password-register', 5, 15 * 60_000)
    if (!(await getSettings()).registrationOpen) return json(response, 503, { error: 'registration_closed' })
    if (!emailDeliveryConfigured()) return json(response, 503, { error: 'email_delivery_not_configured' })
    const input = passwordRegisterSchema.parse(await readJson(request))
    const normalizedEmail = input.email.trim().toLowerCase()
    rateLimitIdentifier('password-register-email', normalizedEmail, 4, 30 * 60_000)
    const account = createManagedAccount()
    const pendingId = randomUUID()
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const codeHash = hashEmailCode({ userId: pendingId, purpose: 'register', email: normalizedEmail, code })
    try {
      await putPendingRegistration({
        id: pendingId,
        email: normalizedEmail,
        displayName: input.displayName,
        passwordHash: await hashPassword(input.password),
        aptosAddress: account.aptosAddress,
        encryptedPrivateKey: encryptManagedPrivateKey(account.privateKey),
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      })
      try {
        await sendVerificationCode({ to: normalizedEmail, code, purpose: 'register', lang: input.lang })
      } catch (error) {
        await deletePendingRegistration(pendingId)
        throw error
      }
      return json(response, 201, { verificationRequired: true, email: normalizedEmail })
    } catch (error) {
      if (error?.code === '23505' || error?.message === 'email_already_registered') return json(response, 409, { error: 'email_already_registered' })
      throw error
    }
  }
  if (url.pathname === '/api/auth/password/verify' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'password-verify', 10, 15 * 60_000)
    const input = emailCodeSchema.parse(await readJson(request))
    rateLimitIdentifier('password-verify-email', input.email, 10, 30 * 60_000)
    const staged = await getPendingRegistration(input.email)
    if (staged) {
      const codeHash = hashEmailCode({ userId: staged.id, purpose: 'register', email: input.email, code: input.code })
      const user = await consumePendingRegistration({ id: staged.id, email: input.email, codeHash })
      if (!user) return json(response, 400, { error: 'verification_invalid' })
      const session = await startSession(response, request, user)
      await logEvent('auth', 'ok', 'Email registration confirmed', { userId: user.id })
      return json(response, 200, { user: session.user }, { 'Set-Cookie': session.cookies })
    }
    // Compatibility path for a registration created before staged accounts were introduced.
    const pending = await getUserByEmail(input.email)
    if (!pending || pending.provider !== 'email' || pending.status !== 'pending') return json(response, 400, { error: 'verification_invalid' })
    const codeHash = hashEmailCode({ userId: pending.id, purpose: 'register', email: input.email, code: input.code })
    const verified = await consumeEmailVerification({ userId: pending.id, purpose: 'register', targetEmail: input.email, codeHash })
    if (!verified) return json(response, 400, { error: 'verification_invalid' })
    const user = await activateRegisteredUser(pending.id)
    if (!user) return json(response, 409, { error: 'account_activation_failed' })
    const session = await startSession(response, request, user)
    await logEvent('auth', 'ok', 'Email registration confirmed', { userId: user.id })
    return json(response, 200, { user: session.user }, { 'Set-Cookie': session.cookies })
  }
  if (url.pathname === '/api/auth/password/login' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'password-login', 10, 15 * 60_000)
    const input = passwordLoginSchema.parse(await readJson(request))
    rateLimitIdentifier('password-login-email', input.email, 12, 30 * 60_000)
    const account = await getUserByEmail(input.email)
    if (!account || !account.email_verified || account.status !== 'active' || !await verifyPassword(input.password, account.password_hash)) {
      return json(response, 401, { error: 'email_or_password_invalid' })
    }
    const user = await markPasswordLogin(account.id)
    const session = await startSession(response, request, user)
    await logEvent('auth', 'ok', 'Password sign-in', { userId: user.id })
    return json(response, 200, { user: session.user }, { 'Set-Cookie': session.cookies })
  }
  if (url.pathname === '/api/auth/password/reset/request' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'password-reset-request', 5, 30 * 60_000)
    const input = passwordResetRequestSchema.parse(await readJson(request))
    const normalizedEmail = input.email.trim().toLowerCase()
    rateLimitIdentifier('password-reset-email', normalizedEmail, 3, 60 * 60_000)
    const account = await getPasswordUserByEmail(normalizedEmail)
    const protectedCreator = account ? await isProtectedCreatorAccount(account) : false
    if (account?.email_verified && account.status === 'active' && !protectedCreator && emailDeliveryConfigured()) {
      issueEmailCode({ user: account, email: normalizedEmail, purpose: 'password_reset', lang: input.lang })
        .then(() => logEvent('auth', 'ok', 'Password reset code issued', { userId: account.id }))
        .catch((error) => logEvent('auth', 'error', 'Password reset delivery failed', { userId: account.id, error: error?.message ?? 'unknown' }).catch(() => {}))
    }
    return json(response, 202, { accepted: true })
  }
  if (url.pathname === '/api/auth/password/reset/confirm' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'password-reset-confirm', 10, 30 * 60_000)
    const input = passwordResetConfirmSchema.parse(await readJson(request))
    const normalizedEmail = input.email.trim().toLowerCase()
    rateLimitIdentifier('password-reset-confirm-email', normalizedEmail, 8, 30 * 60_000)
    const account = await getPasswordUserByEmail(normalizedEmail)
    if (!account?.email_verified || account.status !== 'active' || await isProtectedCreatorAccount(account)) return json(response, 400, { error: 'password_reset_invalid' })
    const codeHash = hashEmailCode({ userId: account.id, purpose: 'password_reset', email: normalizedEmail, code: input.code })
    const verified = await consumeEmailVerification({ userId: account.id, purpose: 'password_reset', targetEmail: normalizedEmail, codeHash })
    if (!verified) return json(response, 400, { error: 'password_reset_invalid' })
    const user = await resetPasswordAndSessions({ userId: account.id, passwordHash: await hashPassword(input.password) })
    if (!user) return json(response, 400, { error: 'password_reset_invalid' })
    await logEvent('auth', 'ok', 'Password reset completed; sessions revoked', { userId: user.id })
    sendPasswordChangedNotice({ to: normalizedEmail, lang: input.lang }).catch(() => {})
    const secure = requestOrigin(request).origin.startsWith('https:')
    return json(response, 200, { changed: true }, { 'Set-Cookie': [clearSessionCookie(secure), clearCsrfCookie(secure)] })
  }
  if (url.pathname === '/api/auth/challenge' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'siwa-challenge', 30, 60_000)
    const input = challengeSchema.parse(await readJson(request))
    const action = input.action ?? (input.link ? 'link' : 'sign_in')
    const boundSession = action === 'sign_in' ? null : await requireSession(request)
    if (boundSession) requireCsrf(request, boundSession)
    const { host: domain, origin } = requestOrigin(request)
    const expected = createTestnetSignInChallenge({ domain, origin, lang: input.lang })
    await putChallenge({
      nonce: expected.nonce,
      expected,
      providerHint: input.provider,
      purpose: action,
      linkUserId: boundSession?.user_id,
      linkSessionHash: boundSession?.token_hash,
    })
    return json(response, 201, expected)
  }
  if (url.pathname === '/api/auth/verify' && request.method === 'POST') {
    enforceSameOrigin(request)
    rateLimit(request, 'siwa-verify', 40, 10 * 60_000)
    const body = verifySchema.parse(await readJson(request, 65_536))
    const output = await deserializeSignInOutput(body.output)
    const challenge = typeof output.input.nonce === 'string' && output.input.nonce.length <= 128
      ? await consumeChallenge(output.input.nonce)
      : null
    if (!challenge || challenge.provider_hint !== body.provider) return json(response, 400, { error: 'challenge_invalid_or_expired' })
    const linkSession = challenge.link_user_id ? await requireSession(request) : null
    if (linkSession) {
      requireCsrf(request, linkSession)
      if (linkSession.user_id !== challenge.link_user_id || linkSession.token_hash !== challenge.link_session_hash) {
        return json(response, 403, { error: 'link_session_mismatch' })
      }
    }
    const [signatureResult, messageResult] = await Promise.all([
      verifySignInSignature(output, { aptos: aptosClient }),
      verifySignInMessage({ publicKey: output.publicKey, expected: challenge.expected, input: output.input }, { aptos: aptosClient }),
    ])
    if (!signatureResult.valid || !messageResult.valid) return json(response, 401, { error: 'signature_verification_failed' })
    let user
    if (challenge.purpose === 'activate') {
      user = await activateAptosIdentity({
        userId: challenge.link_user_id,
        aptosAddress: output.input.address,
        provider: body.provider,
      })
      const access = await governanceAccess(output.input.address)
      if (access.isCreator) {
        await deleteUserSessions(user.id)
        const freshSession = await startSession(response, request, user, 'aptos_signature', output.input.address)
        return json(response, 200, { user: freshSession.user, activated: true, sessionRotated: true }, { 'Set-Cookie': freshSession.cookies })
      }
      const freshSession = await startSession(response, request, user, 'aptos_signature', output.input.address)
      await deleteSessionByHash(linkSession.token_hash)
      await logEvent('auth', 'ok', 'Linked sign-in method activated', { userId: user.id, address: output.input.address })
      return json(response, 200, { user: freshSession.user, activated: true, sessionRotated: true }, { 'Set-Cookie': freshSession.cookies })
    }
    if (challenge.purpose === 'link') {
      const access = await governanceAccess(output.input.address)
      user = await linkAptosIdentity({ userId: challenge.link_user_id, aptosAddress: output.input.address, provider: body.provider, makePrimary: access.isCreator })
      if (access.isCreator) {
        await deleteUserSessions(user.id)
        const freshSession = await startSession(response, request, user, 'aptos_signature', output.input.address)
        return json(response, 200, { user: freshSession.user, linked: true, sessionRotated: true }, { 'Set-Cookie': freshSession.cookies })
      }
      const freshSession = await startSession(response, request, user, 'aptos_signature', output.input.address)
      await deleteSessionByHash(linkSession.token_hash)
      await logEvent('auth', 'ok', 'Sign-in method linked and activated', { userId: user.id, provider: body.provider, address: output.input.address })
      return json(response, 200, { user: freshSession.user, linked: true, sessionRotated: true }, { 'Set-Cookie': freshSession.cookies })
    }
    const existingUser = await getUserByAptosAddress(output.input.address)
    if (!existingUser && !(await getSettings()).registrationOpen) {
      return json(response, 503, { error: 'registration_closed' })
    }
    user = await upsertUser({ aptosAddress: output.input.address, provider: body.provider })
    const session = await startSession(response, request, user, 'aptos_signature', output.input.address)
    await logEvent('auth', 'ok', 'Пользователь вошёл', { userId: user.id, provider: body.provider, address: user.aptos_address })
    return json(response, 200, { user: session.user }, { 'Set-Cookie': session.cookies })
  }
  if (url.pathname === '/api/me' && request.method === 'GET') {
    const session = await sessionFromRequest(request)
    const cookies = parseCookies(request)
    const csrfToken = cookies['__Host-sovet_csrf'] ?? cookies.sovet_csrf
    const validCsrf = csrfToken && hashSecret(csrfToken) === session?.csrf_hash ? csrfToken : null
    return json(response, 200, { user: session ? await exposedUser(session, validCsrf, organizationContext.organizationId) : null })
  }
  if (url.pathname === '/api/me' && request.method === 'PATCH') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const user = await updateProfile(session.user_id, profileSchema.parse(await readJson(request)))
    return json(response, 200, {
      user: await exposedUser({ ...user, auth_method: session.auth_method, auth_address: session.auth_address }, request.headers['x-csrf-token']),
    })
  }
  if (url.pathname === '/api/me/connections' && request.method === 'GET') {
    const session = await requireSession(request)
    return json(response, 200, await listAccountConnections(session.user_id))
  }
  if (url.pathname === '/api/me/email-change' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimit(request, 'email-change', 5, 30 * 60_000)
    if (!emailDeliveryConfigured()) return json(response, 503, { error: 'email_delivery_not_configured' })
    const input = emailChangeSchema.parse(await readJson(request))
    const existing = await getUserByEmail(input.email)
    if (existing && existing.id !== session.user_id) return json(response, 409, { error: 'email_already_registered' })
    const [permissions, settings] = await Promise.all([permissionsFor(session), getSettings()])
    const protectedByEmail = Boolean(session.email_verified && session.email
      && session.email.toLowerCase() === String(settings.superAdminEmail ?? '').toLowerCase())
    const requiresOldInbox = Boolean((permissions.isSuperAdmin || protectedByEmail) && session.email_verified && session.email)
    const purpose = requiresOldInbox ? 'change_email_old' : 'change_email_new'
    const deliveryEmail = requiresOldInbox ? session.email : input.email
    await issueEmailCode({ user: session, email: input.email, deliveryEmail, purpose, lang: input.lang })
    return json(response, 202, {
      verificationRequired: true,
      email: input.email.trim().toLowerCase(),
      stage: requiresOldInbox ? 'old' : 'new',
    })
  }
  if (url.pathname === '/api/me/email-change/verify' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    rateLimit(request, 'email-change-verify', 10, 30 * 60_000)
    const input = emailCodeSchema.parse(await readJson(request))
    const [before, settings] = await Promise.all([permissionsFor(session), getSettings()])
    const protectedByEmail = Boolean(session.email_verified && session.email
      && session.email.toLowerCase() === String(settings.superAdminEmail ?? '').toLowerCase())
    const requiresTwoStage = before.isSuperAdmin || protectedByEmail
    if (requiresTwoStage) {
      const oldPurpose = 'change_email_old'
      const oldCodeHash = hashEmailCode({ userId: session.user_id, purpose: oldPurpose, email: input.email, code: input.code })
      const oldVerified = await consumeEmailVerification({ userId: session.user_id, purpose: oldPurpose, targetEmail: input.email, codeHash: oldCodeHash })
      if (oldVerified) {
        await issueEmailCode({
          user: session,
          email: input.email,
          deliveryEmail: input.email,
          purpose: 'change_email_new',
          lang: input.lang,
          parentVerificationId: oldVerified.id,
        })
        return json(response, 202, { verificationRequired: true, nextVerificationRequired: true, stage: 'new', email: input.email.trim().toLowerCase() })
      }
    }
    const newPurpose = 'change_email_new'
    const newCodeHash = hashEmailCode({ userId: session.user_id, purpose: newPurpose, email: input.email, code: input.code })
    const user = await completeEmailChange({
      userId: session.user_id,
      email: input.email,
      codeHash: newCodeHash,
      requiresParent: requiresTwoStage,
      updateSuperAdminEmail: requiresTwoStage,
    })
    if (!user) return json(response, 400, { error: 'verification_invalid' })
    const nextSession = await startSession(response, request, user, session.auth_method, session.auth_address)
    await logEvent('auth', 'ok', 'Verified email changed', { userId: user.id, superAdminChanged: requiresTwoStage })
    return json(response, 200, {
      user: nextSession.user,
    }, { 'Set-Cookie': nextSession.cookies })
  }
  if (url.pathname === '/api/v1/governance/users' && request.method === 'GET') {
    await requireSuperAdmin(request)
    const users = await listGovernanceUsers()
    return json(response, 200, { users: users.map((user) => ({
      id: user.id,
      aptosAddress: user.aptos_address,
      displayName: user.display_name,
      provider: user.provider,
      role: user.role,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
    })) })
  }
  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    enforceSameOrigin(request)
    const cookies = parseCookies(request)
    const secure = requestOrigin(request).origin.startsWith('https:')
    await deleteSession(secure ? cookies['__Host-sovet_session'] : cookies.sovet_session)
    return json(response, 200, { ok: true }, { 'Set-Cookie': [clearSessionCookie(secure), clearCsrfCookie(secure)] })
  }
  if (url.pathname === '/api/v1/vote-intents' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const settings = await getSettings()
    if (sponsorshipLocked) return json(response, 503, { error: 'sponsorship_emergency_locked' })
    const input = voteSchema.parse(await readJson(request))
    const organizationId = organizationIdForRequest(request)
    await requireResourceAccess({ organizationId, userId: session.user_id, type: 'election', id: input.electionId, scope: 'participate' })
    const sponsorship = await sponsoredWriteContext({ request, session, settings, idempotencyKey: input.idempotencyKey, intentKind: 'weighted_vote' })
    const senderAddress = votingAddressFor(session)
    const built = await buildSponsoredVote({ senderAddress, feePayerAddress: sponsorship.feePayerAddress, ...input })
    const intent = await createOrGetVoteIntent({
      organizationId: sponsorship.organizationId,
      intentKind: 'weighted_vote',
      userId: session.user_id,
      senderAddress,
      ...input,
      ...built,
    })
    return json(response, 201, { intentId: intent.id, rawTransactionB64: intent.raw_transaction_b64, expiresAt: intent.expires_at, preview: built.preview })
  }
  if (url.pathname === '/api/v1/admin-election-vote-intents' && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const settings = await getSettings()
    if (sponsorshipLocked) return json(response, 503, { error: 'sponsorship_emergency_locked' })
    const input = equalAdminVoteSchema.parse(await readJson(request))
    const organizationId = organizationIdForRequest(request)
    await requireResourceAccess({ organizationId, userId: session.user_id, type: 'election', id: input.adminElectionId, scope: 'participate' })
    const sponsorship = await sponsoredWriteContext({ request, session, settings, idempotencyKey: input.idempotencyKey, intentKind: 'admin_equal_vote' })
    const senderAddress = votingAddressFor(session)
    const built = await buildSponsoredEqualAdminVote({ senderAddress, feePayerAddress: sponsorship.feePayerAddress, ...input })
    const allocations = input.choice === 1 ? [10_000, 0, 0] : input.choice === 2 ? [0, 10_000, 0] : [0, 0, 10_000]
    const intent = await createOrGetVoteIntent({
      organizationId: sponsorship.organizationId,
      intentKind: 'admin_equal_vote',
      userId: session.user_id, senderAddress, electionId: input.adminElectionId,
      yesBps: allocations[0], noBps: allocations[1], abstainBps: allocations[2], idempotencyKey: input.idempotencyKey, ...built,
    })
    return json(response, 201, { intentId: intent.id, rawTransactionB64: intent.raw_transaction_b64, expiresAt: intent.expires_at, preview: built.preview })
  }
  const managedSubmissionMatch = url.pathname.match(/^\/api\/v1\/vote-intents\/([0-9a-f-]+)\/managed-submission$/)
  if (managedSubmissionMatch && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const settings = await getSettings()
    if (sponsorshipLocked) return json(response, 503, { error: 'sponsorship_emergency_locked' })
    const organizationId = organizationIdForRequest(request)
    if (organizationId === DEFAULT_ORGANIZATION_ID && !settings.sponsorshipEnabled) return json(response, 503, { error: 'sponsorship_disabled' })
    const senderAddress = votingAddressFor(session)
    const intent = await getVoteIntent(managedSubmissionMatch[1], organizationId)
    if (!intent || intent.user_id !== session.user_id) return json(response, 404, { error: 'intent_not_found' })
    if (intent.status !== 'prepared') return json(response, 409, { error: 'intent_already_used', txHash: intent.tx_hash })
    if (new Date(intent.expires_at).getTime() <= Date.now()) return json(response, 409, { error: 'intent_expired' })
    await requireResourceAccess({ organizationId, userId: session.user_id, type: 'election', id: intent.election_id, scope: 'participate' })
    const managedWallet = await getManagedWallet(session.user_id)
    if (!managedWallet || managedWallet.aptos_address.toLowerCase() !== senderAddress
      || intent.sender_address.toLowerCase() !== senderAddress) return json(response, 403, { error: 'managed_wallet_required' })
    const [chain, parity] = await Promise.all([aptosStatus(), verifyPublishedModules({ force: true })])
    if (!chain.ok || !parity.verified) return json(response, 503, { error: 'contract_source_mismatch' })
    const sponsorship = await sponsoredWriteContext({ request, session, settings, idempotencyKey: intent.idempotency_key, intentKind: intent.intent_kind })
    const transaction = deserializeTransaction(intent.raw_transaction_b64)
    try {
      validateSponsoredVoteTransaction({
        transaction, intent, senderAddress,
        feePayerAddress: sponsorship.feePayerAddress,
        moduleAddress: aptosRuntime.moduleAddress,
      })
    } catch (error) {
      return json(response, 409, { error: error?.code ?? 'intent_transaction_mismatch' })
    }
    const claimed = await claimVoteIntent({
      id: intent.id,
      userId: session.user_id,
      organizationId,
      globalHourlyLimit: settings.maxSponsoredVotesGlobalPerHour,
    })
    if (!claimed) {
      const current = await getVoteIntent(intent.id, organizationId)
      return json(response, 409, { error: 'intent_already_used', txHash: current?.tx_hash ?? null })
    }
    try {
      const pending = await submitManagedSponsoredVote({
        transaction,
        privateKey: decryptManagedPrivateKey(managedWallet.encrypted_private_key),
        feePayerPrivateKey: sponsorship.feePayerPrivateKey,
      })
      await markVoteSubmitted(claimed.id, pending.hash)
      if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: 'submitted', txHash: pending.hash })
      await logEvent('vote', 'ok', 'Managed sponsored vote submitted', { userId: session.user_id, electionId: claimed.election_id, txHash: pending.hash })
      waitForVote(pending.hash).then(async (result) => {
        await markVoteFinal(claimed.id, result.success, result.success ? null : result.vm_status)
        if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: result.success ? 'confirmed' : 'failed', txHash: pending.hash, errorCode: result.success ? null : result.vm_status })
      }).catch(() => {})
      return json(response, 202, { operationId: claimed.id, txHash: pending.hash, status: 'submitted', explorerUrl: `https://explorer.aptoslabs.com/txn/${pending.hash}?network=testnet` })
    } catch (error) {
      await markVoteSubmissionFailed(claimed.id)
      if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: 'failed', errorCode: error?.message ?? 'submission_failed' })
      throw error
    }
  }
  const submissionMatch = url.pathname.match(/^\/api\/v1\/vote-intents\/([0-9a-f-]+)\/submission$/)
  if (submissionMatch && request.method === 'POST') {
    const session = await requireSession(request)
    requireCsrf(request, session)
    const settings = await getSettings()
    if (sponsorshipLocked) return json(response, 503, { error: 'sponsorship_emergency_locked' })
    const organizationId = organizationIdForRequest(request)
    if (organizationId === DEFAULT_ORGANIZATION_ID && !settings.sponsorshipEnabled) return json(response, 503, { error: 'sponsorship_disabled' })
    const senderAddress = votingAddressFor(session)
    const intent = await getVoteIntent(submissionMatch[1], organizationId)
    if (!intent || intent.user_id !== session.user_id) return json(response, 404, { error: 'intent_not_found' })
    if (intent.status !== 'prepared') return json(response, 409, { error: 'intent_already_used', txHash: intent.tx_hash })
    if (new Date(intent.expires_at).getTime() <= Date.now()) return json(response, 409, { error: 'intent_expired' })
    await requireResourceAccess({ organizationId, userId: session.user_id, type: 'election', id: intent.election_id, scope: 'participate' })
    const { senderAuthenticatorB64 } = submissionSchema.parse(await readJson(request))
    const [chain, parity] = await Promise.all([aptosStatus(), verifyPublishedModules({ force: true })])
    if (!chain.ok || !parity.verified) return json(response, 503, { error: 'contract_source_mismatch' })
    const sponsorship = await sponsoredWriteContext({ request, session, settings, idempotencyKey: intent.idempotency_key, intentKind: intent.intent_kind })
    const transaction = deserializeTransaction(intent.raw_transaction_b64)
    try {
      validateSponsoredVoteTransaction({
        transaction, intent, senderAddress,
        feePayerAddress: sponsorship.feePayerAddress,
        moduleAddress: aptosRuntime.moduleAddress,
      })
    } catch (error) {
      return json(response, 409, { error: error?.code ?? 'intent_transaction_mismatch' })
    }
    const senderAuthenticator = deserializeAuthenticator(senderAuthenticatorB64)
    const claimed = await claimVoteIntent({
      id: intent.id,
      userId: session.user_id,
      organizationId,
      globalHourlyLimit: settings.maxSponsoredVotesGlobalPerHour,
    })
    if (!claimed) {
      const current = await getVoteIntent(intent.id, organizationId)
      return json(response, 409, { error: 'intent_already_used', txHash: current?.tx_hash ?? null })
    }
    try {
      const pending = await submitSponsoredVote({ transaction, senderAuthenticator, feePayerPrivateKey: sponsorship.feePayerPrivateKey })
      await markVoteSubmitted(claimed.id, pending.hash)
      if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: 'submitted', txHash: pending.hash })
      await logEvent('vote', 'ok', 'Sponsored vote submitted to Aptos Testnet', { userId: session.user_id, electionId: claimed.election_id, txHash: pending.hash })
      waitForVote(pending.hash).then(async (result) => {
        await markVoteFinal(claimed.id, result.success, result.success ? null : result.vm_status)
        if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: result.success ? 'confirmed' : 'failed', txHash: pending.hash, errorCode: result.success ? null : result.vm_status })
      }).catch(() => {})
      return json(response, 202, { operationId: claimed.id, txHash: pending.hash, status: 'submitted', explorerUrl: `https://explorer.aptoslabs.com/txn/${pending.hash}?network=testnet` })
    } catch (error) {
      await markVoteSubmissionFailed(claimed.id)
      if (sponsorship.usageIdempotencyKey) await markOrganizationSponsorUsage({ organizationId, idempotencyKey: sponsorship.usageIdempotencyKey, status: 'failed', errorCode: error?.message ?? 'submission_failed' })
      throw error
    }
  }
  const operationMatch = url.pathname.match(/^\/api\/v1\/operations\/([0-9a-f-]+)$/)
  if (operationMatch && request.method === 'GET') {
    const session = await requireSession(request)
    const organizationId = organizationIdForRequest(request)
    const intent = await getVoteIntent(operationMatch[1], organizationId)
    if (!intent || intent.user_id !== session.user_id) return json(response, 404, { error: 'operation_not_found' })
    return json(response, 200, { operationId: intent.id, status: intent.status, txHash: intent.tx_hash, errorCode: intent.error_code })
  }
  return json(response, 404, { error: 'not_found' })
}

function assertOpsRequest(request) {
  const hostHeader = (request.headers.host ?? '').toLowerCase()
  if (hostHeader !== `127.0.0.1:${opsPort}` && hostHeader !== `localhost:${opsPort}`) {
    throw Object.assign(new Error('ops_host_rejected'), { status: 403 })
  }
  const origin = request.headers.origin
  if (origin && origin !== `http://127.0.0.1:${opsPort}` && origin !== `http://localhost:${opsPort}`) {
    throw Object.assign(new Error('ops_origin_rejected'), { status: 403 })
  }
  if (!verifyOperatorToken(request.headers['x-sovet-operator-key'])) {
    throw Object.assign(new Error('ops_authentication_required'), { status: 401 })
  }
}

async function handleOps(request, response, url) {
  assertOpsRequest(request)
  if (url.pathname === '/api/dashboard' && request.method === 'GET') {
    const [chain, database, settings, creatorAddress] = await Promise.all([aptosStatus(), dashboardDatabaseStats(), getSettings(), governanceCreator()])
    const creatorAccount = await creatorAccountStatus({ email: settings.superAdminEmail, creatorAddress })
    return json(response, 200, {
      service: { ok: true, pid: process.pid, startedAt, uptimeSeconds: Math.floor(process.uptime()), memory: process.memoryUsage(), publicUrl: 'https://novyway.com' },
      chain,
      database: { ...database, path: databasePath, engine: 'PostgreSQL 17' },
      settings: { ...settings, sponsorshipLocked, emailDeliveryConfigured: emailDeliveryConfigured() },
      contract: {
        moduleAddress: aptosRuntime.moduleAddress,
        publishedBytecodeAllowlisted: aptosRuntime.sourceParityVerified,
        reproducibleSource: aptosRuntime.reproducibleSourceVerified,
        sourceDigest: aptosRuntime.sourceDigest,
      },
      creatorAccount,
    })
  }
  if (url.pathname === '/api/analytics' && request.method === 'GET') {
    return json(response, 200, await dashboardAnalytics(url.searchParams.get('range') ?? '24h'))
  }
  if (url.pathname === '/api/settings' && request.method === 'PATCH') {
    const values = opsSettingsSchema.parse(await readJson(request))
    if (values.sponsorshipEnabled && sponsorshipLocked) return json(response, 409, { error: 'sponsorship_emergency_locked' })
    await logEvent('settings', 'ok', 'Обновлены настройки сайта', { keys: Object.keys(values) })
    return json(response, 200, { settings: await setSettings(values) })
  }
  if (url.pathname === '/api/backups' && request.method === 'POST') {
    return json(response, 201, { backup: await createDatabaseBackup() })
  }
  if (url.pathname === '/api/creator-account/bootstrap' && request.method === 'POST') {
    const input = creatorBootstrapSchema.parse(await readJson(request, 16_384))
    const [settings, creatorAddress] = await Promise.all([getSettings(), governanceCreator()])
    const account = await bootstrapCreatorAccount({
      email: String(settings.superAdminEmail ?? ''),
      passwordHash: await hashPassword(input.password),
      creatorAddress,
    })
    await syncDefaultOrganizationMembership({ userId: account.userId, role: 'owner' })
    return json(response, 200, { account })
  }
  if (url.pathname === '/api/restart' && request.method === 'POST') {
    json(response, 202, { ok: true, message: 'Сервис перезапускается' })
    setTimeout(() => shutdown(75), 250)
    return
  }
  if (url.pathname === '/api/stop' && request.method === 'POST') {
    json(response, 202, { ok: true, message: 'Сервис останавливается' })
    setTimeout(() => shutdown(0), 250)
    return
  }
  if (url.pathname.startsWith('/api/')) return json(response, 404, { error: 'not_found' })
  return json(response, 404, { error: 'native_operator_application_required' })
}

if (!existsSync(join(distRoot, 'index.html'))) throw new Error(`Production build is missing: ${distRoot}. Run npm.cmd run build first.`)
await initializeStorage()
await initializeTenantStorage()
await initializeOrganizationApplications()
await initializeOrganizationAccess()

const publicServer = createServer(async (request, response) => {
  try {
    const requestedUrl = new URL(request.url ?? '/', `http://${host}:${port}`)
    if (requestedUrl.pathname === '/__health' && (request.method === 'GET' || request.method === 'HEAD')) return sendHealth(response, request.method)
    const organizationContext = await resolveOrganizationRequest({
      request,
      url: requestedUrl,
      findBySlug: findOrganizationBySlug,
      findByDomain: findOrganizationByDomain,
      defaultSlug: DEFAULT_ORGANIZATION_SLUG,
    })
    request.organizationContext = organizationContext
    const url = organizationContext.url
    if (organizationContext.hostname === 'www.novyway.com') {
      response.writeHead(308, {
        Location: `https://novyway.com${requestedUrl.pathname}${requestedUrl.search}`,
        'Cache-Control': 'no-store',
        ...securityHeaders,
      })
      response.end()
      return
    }
    if (requestedUrl.pathname.startsWith('/api/')) return await handlePublicApi(request, response, url, organizationContext)
    if (request.method !== 'GET' && request.method !== 'HEAD') return json(response, 405, { error: 'method_not_allowed' }, { Allow: 'GET, HEAD' })
    const musicMatch = requestedUrl.pathname.match(/^\/media\/music\/([^/]+)$/)
    if (musicMatch) {
      if (!musicAllowed(request)) return json(response, 403, { error: 'music_public_license_required' })
      const candidate = resolvePath(musicRoot, decodeURIComponent(musicMatch[1]))
      if (!candidate || !existsSync(candidate) || !statSync(candidate).isFile()) return json(response, 404, { error: 'music_not_found' })
      return sendRangedFile(request, response, candidate)
    }
    const candidate = resolvePath(distRoot, requestedUrl.pathname)
    if (candidate && existsSync(candidate) && statSync(candidate).isFile()) return sendFile(response, candidate, request.method)
    return sendFile(response, join(distRoot, 'index.html'), request.method)
  } catch (error) {
    const status = error?.status ?? (error instanceof z.ZodError ? 400 : 500)
    if (status === 500) console.error('[public]', error instanceof Error ? error.message : error)
    return json(response, status, { error: status === 500 ? 'internal_error' : error.message, details: error instanceof z.ZodError ? error.issues : undefined })
  }
})

const opsServer = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', `http://127.0.0.1:${opsPort}`)
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'POST' && request.method !== 'PATCH') return json(response, 405, { error: 'method_not_allowed' })
    await handleOps(request, response, url)
  } catch (error) {
    const status = error?.status ?? (error instanceof z.ZodError ? 400 : 500)
    if (status === 500) console.error('[ops]', error instanceof Error ? error.message : error)
    json(response, status, { error: status === 500 ? 'internal_error' : error.message })
  }
})

publicServer.listen(port, host, async () => {
  mkdirSync(runtimeRoot, { recursive: true })
  writeFileSync(pidFile, String(process.pid), 'utf8')
  console.log(`Novyway public service: http://${host}:${port}/`)
  console.log(`Novyway operator console: http://127.0.0.1:${opsPort}/`)
  await logEvent('service', 'ok', 'Сервис запущен', { pid: process.pid })
  if (shouldOpen && process.platform === 'win32') spawn('cmd.exe', ['/c', 'start', '', 'https://novyway.com/'], { detached: true, stdio: 'ignore' }).unref()
})
opsServer.listen(opsPort, '127.0.0.1')

async function sampleUptime() {
  try {
    const chain = await aptosStatus()
    await recordUptime({ publicOk: publicServer.listening, aptosOk: chain.ok, latencyMs: chain.latencyMs })
  } catch (error) {
    // Monitoring must never take the public service down when PostgreSQL or Aptos is briefly unavailable.
    console.error('[uptime]', error instanceof Error ? error.message : String(error))
  }
}
setTimeout(sampleUptime, 1500)
const sampleTimer = setInterval(sampleUptime, 60_000)
sampleTimer.unref()

async function ensureDailyBackup() {
  const latest = await latestBackup()
  if (!latest || Date.now() - new Date(latest.created_at).getTime() > 24 * 60 * 60_000) await createDatabaseBackup()
}
setTimeout(() => ensureDailyBackup().catch((error) => console.error('[backup]', error.message)), 10_000)
const backupTimer = setInterval(() => ensureDailyBackup().catch((error) => console.error('[backup]', error.message)), 6 * 60 * 60_000)
backupTimer.unref()

setTimeout(() => purgeExpiredRejectedApplications().catch((error) => console.error('[application-purge]', error.message)), 12_000)
const applicationPurgeTimer = setInterval(
  () => purgeExpiredRejectedApplications().catch((error) => console.error('[application-purge]', error.message)),
  6 * 60 * 60_000,
)
applicationPurgeTimer.unref()

function cleanupPidFile() {
  try {
    if (existsSync(pidFile) && readFileSync(pidFile, 'utf8').trim() === String(process.pid)) rmSync(pidFile, { force: true })
  } catch { /* shutdown continues even if OneDrive temporarily locks the file */ }
}

function shutdown(code = 0) {
  clearInterval(sampleTimer)
  clearInterval(backupTimer)
  clearInterval(applicationPurgeTimer)
  let pending = 2
  const done = () => { if (--pending === 0) { cleanupPidFile(); process.exit(code) } }
  publicServer.close(done)
  opsServer.close(done)
  setTimeout(() => { cleanupPidFile(); process.exit(code) }, 3000).unref()
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => shutdown(0))
process.on('exit', cleanupPidFile)
