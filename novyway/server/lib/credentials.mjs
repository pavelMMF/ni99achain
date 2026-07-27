import { createCipheriv, createDecipheriv, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { userInfo } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { promisify } from 'node:util'
import { secretsRoot } from './runtime-paths.mjs'

const scrypt = promisify(scryptCallback)

export function protectSecretFile(path) {
  if (process.platform !== 'win32') return
  const username = userInfo().username
  const result = spawnSync('icacls.exe', [path, '/inheritance:r', '/grant:r', `${username}:F`, '*S-1-5-18:F', '*S-1-5-32-544:F'], {
    windowsHide: true,
    stdio: 'ignore',
  })
  if (result.error || result.status !== 0) throw new Error('secret_acl_update_failed')
}

function readSecret(path, length) {
  const value = Buffer.from(readFileSync(path, 'utf8').trim(), 'base64url')
  if (value.length !== length) throw new Error(`secret_file_invalid:${path}`)
  return value
}

function secretBytes(name, length = 32) {
  const path = join(secretsRoot, name)
  if (existsSync(path)) return readSecret(path, length)
  const value = randomBytes(length)
  try {
    writeFileSync(path, value.toString('base64url'), { encoding: 'utf8', mode: 0o600, flag: 'wx' })
    protectSecretFile(path)
    return value
  } catch (error) {
    if (error?.code === 'EEXIST') return readSecret(path, length)
    throw error
  }
}

const walletKey = secretBytes('managed-wallets.key')
const organizationRelayerKey = secretBytes('organization-relayers.key')
const organizationNotificationKey = secretBytes('organization-notifications.key')
const verificationPepper = secretBytes('email-verification.key')
const operatorKey = secretBytes('operator-console.key')

export async function hashPassword(password) {
  const salt = randomBytes(16)
  const derived = await scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 })
  return `scrypt$32768$8$1$${salt.toString('base64url')}$${Buffer.from(derived).toString('base64url')}`
}

export async function verifyPassword(password, encoded) {
  const [scheme, n, r, p, saltText, expectedText] = String(encoded ?? '').split('$')
  if (scheme !== 'scrypt' || !saltText || !expectedText) return false
  const expected = Buffer.from(expectedText, 'base64url')
  if (Number(n) !== 32768 || Number(r) !== 8 || Number(p) !== 1 || expected.length !== 64) return false
  const actual = Buffer.from(await scrypt(password, Buffer.from(saltText, 'base64url'), expected.length, {
    N: Number(n), r: Number(r), p: Number(p), maxmem: 64 * 1024 * 1024,
  }))
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function encryptPrivateKey(privateKey, key) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(privateKey, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `v1.${[iv, tag, ciphertext].map((value) => value.toString('base64url')).join('.')}`
}

function decryptPrivateKey(envelope, key, errorCode) {
  const parts = String(envelope ?? '').split('.')
  const versioned = parts.length === 4 && parts[0] === 'v1'
  const [ivText, tagText, ciphertextText] = versioned ? parts.slice(1) : parts
  if (!ivText || !tagText || !ciphertextText) throw new Error(errorCode)
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivText, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64url')), decipher.final()]).toString('utf8')
}

export function encryptManagedPrivateKey(privateKey) {
  return encryptPrivateKey(privateKey, walletKey)
}

export function decryptManagedPrivateKey(envelope) {
  return decryptPrivateKey(envelope, walletKey, 'managed_wallet_key_invalid')
}

export function encryptOrganizationRelayerPrivateKey(privateKey) {
  return encryptPrivateKey(privateKey, organizationRelayerKey)
}

export function decryptOrganizationRelayerPrivateKey(envelope) {
  return decryptPrivateKey(envelope, organizationRelayerKey, 'organization_relayer_key_invalid')
}

export function encryptOrganizationNotificationToken(token) {
  return encryptPrivateKey(token, organizationNotificationKey)
}

export function decryptOrganizationNotificationToken(envelope) {
  return decryptPrivateKey(envelope, organizationNotificationKey, 'organization_notification_token_invalid')
}

export function hashEmailCode({ userId, purpose, email, code }) {
  return createHmac('sha256', verificationPepper)
    .update(`${userId}\0${purpose}\0${email.trim().toLowerCase()}\0${code}`)
    .digest('hex')
}

export function verifyOperatorToken(candidate) {
  if (typeof candidate !== 'string' || candidate.length > 256) return false
  try {
    const actual = Buffer.from(candidate, 'base64url')
    return actual.length === operatorKey.length && timingSafeEqual(actual, operatorKey)
  } catch {
    return false
  }
}
