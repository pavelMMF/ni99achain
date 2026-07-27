import type { OrganizationAptosConfig } from '../../tenancy/organization'

const RPC_BY_NETWORK: Record<OrganizationAptosConfig['network'], string> = {
  testnet: 'https://fullnode.testnet.aptoslabs.com/v1',
  mainnet: 'https://fullnode.mainnet.aptoslabs.com/v1',
  devnet: 'https://fullnode.devnet.aptoslabs.com/v1',
  local: 'http://127.0.0.1:8080/v1',
}

export type OrganizationGovernanceConfig = OrganizationAptosConfig & {
  moduleAddress: string
  organizationAddress: string
}

export function organizationGovernanceConfig(
  value: OrganizationAptosConfig | null | undefined,
): OrganizationGovernanceConfig | null {
  if (!value?.moduleAddress || !value.organizationAddress) return null
  return {
    ...value,
    moduleAddress: value.moduleAddress,
    organizationAddress: value.organizationAddress,
  }
}

export function organizationGovernanceEntry(
  config: OrganizationGovernanceConfig,
  functionName: 'set_new_voters_enabled' | 'set_voter_admission' | 'register_as_voter',
): `${string}::governance::${string}` {
  return `${config.moduleAddress}::governance::${functionName}`
}

async function organizationView(
  config: OrganizationGovernanceConfig,
  functionName: 'organization_exists' | 'organization_owner' | 'is_admin' | 'new_voters_enabled' | 'is_voter_admitted',
  args: unknown[],
): Promise<unknown[]> {
  const response = await fetch(`${RPC_BY_NETWORK[config.network]}/view`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      function: `${config.moduleAddress}::governance::${functionName}`,
      type_arguments: [],
      arguments: args,
    }),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`aptos_view_${response.status}${detail ? `:${detail.slice(0, 180)}` : ''}`)
  }
  const result = await response.json()
  if (!Array.isArray(result)) throw new Error('aptos_view_invalid_response')
  return result
}

function boolResult(result: unknown[]) {
  if (result[0] !== true && result[0] !== false) throw new Error('aptos_view_invalid_boolean')
  return result[0]
}

export async function readOrganizationVoterPolicy(config: OrganizationGovernanceConfig) {
  const [exists, enabled, owner] = await Promise.all([
    organizationView(config, 'organization_exists', [config.organizationAddress]).then(boolResult),
    organizationView(config, 'new_voters_enabled', [config.organizationAddress]).then(boolResult),
    organizationView(config, 'organization_owner', [config.organizationAddress]),
  ])
  if (!exists) throw new Error('organization_not_published_in_aptos')
  if (typeof owner[0] !== 'string') throw new Error('aptos_view_invalid_owner')
  return { enabled, owner: owner[0].toLowerCase() }
}

export async function readOrganizationAdmin(
  config: OrganizationGovernanceConfig,
  account: string,
) {
  return organizationView(config, 'is_admin', [config.organizationAddress, account]).then(boolResult)
}

export async function readOrganizationVoterAdmission(
  config: OrganizationGovernanceConfig,
  account: string,
) {
  return organizationView(config, 'is_voter_admitted', [config.organizationAddress, account]).then(boolResult)
}

export async function waitForOrganizationTransaction(
  config: OrganizationGovernanceConfig,
  hash: string,
) {
  const rpc = RPC_BY_NETWORK[config.network]
  for (let attempt = 0; attempt < 45; attempt += 1) {
    const response = await fetch(`${rpc}/transactions/by_hash/${encodeURIComponent(hash)}`, { cache: 'no-store' })
    if (response.ok) {
      const transaction = await response.json() as { success?: boolean; vm_status?: string }
      if (!transaction.success) throw new Error(transaction.vm_status ?? 'transaction_failed')
      return
    }
    if (response.status !== 404) throw new Error(`aptos_transaction_${response.status}`)
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  throw new Error('transaction_confirmation_timeout')
}

export function organizationTransactionExplorer(config: OrganizationGovernanceConfig, hash: string) {
  if (config.network === 'local') return null
  return `https://explorer.aptoslabs.com/txn/${encodeURIComponent(hash)}?network=${config.network}`
}
