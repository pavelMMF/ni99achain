import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const [contract, tests, ui, adapter, admin] = await Promise.all([
  readFile(resolve('../aptos-voting-core/v2/sources/governance.move'), 'utf8'),
  readFile(resolve('../aptos-voting-core/v2/tests/governance_tests.move'), 'utf8'),
  readFile(resolve('src/ui/components/VoterAdmissionPolicy.tsx'), 'utf8'),
  readFile(resolve('src/adapters/aptos/organizationGovernance.ts'), 'utf8'),
  readFile(resolve('src/screens/Admin.tsx'), 'utf8'),
])

assert.match(contract, /new_voters_enabled: bool/, 'each organization must own its registration policy')
assert.match(contract, /voter_admissions: Table<address, bool>/, 'admission must be organization-local on chain')
assert.match(contract, /public entry fun set_new_voters_enabled/, 'an administrator policy transaction is required')
assert.match(contract, /public entry fun register_as_voter/, 'open registration must have a user transaction')
assert.match(contract, /public entry fun set_voter_admission/, 'manual administrator admission is required')
assert.match(contract, /qualification\.eligible && is_voter_admitted_internal\(org, key\.account\)/, 'future snapshots must require qualification and admission')
assert.match(contract, /public fun new_voters_enabled/, 'the policy must be independently readable')
assert.match(contract, /public fun is_voter_admitted/, 'admission must be independently readable')

assert.match(tests, /admin_controls_open_registration_and_explicit_admission/, 'self-registration must have a Move test')
assert.match(tests, /qualification_grant_admits_but_revocation_excludes_snapshot/, 'snapshot filtering must have a Move test')
assert.match(tests, /expected_failure\(abort_code = 14/, 'unauthorized policy changes must be rejected')

assert.match(adapter, /set_new_voters_enabled/, 'the browser adapter must expose the policy transaction')
assert.match(adapter, /register_as_voter/, 'the browser adapter must expose self-registration')
assert.match(ui, /activeAptosAddress \?\? user\?\.aptosAddress/, 'profile admission must follow the active signing address')
assert.match(ui, /X-CSRF-Token/, 'V2 public addresses must be stored through the protected organization API')
assert.match(ui, /signerIsAdmin/, 'the UI must verify the connected on-chain administrator')
assert.match(admin, /legacyToolsAvailable/, 'custom organizations must not receive Novyway V1 controls')

console.log('V2 voter admission regression checks passed.')