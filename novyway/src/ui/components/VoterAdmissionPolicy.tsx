import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { Link } from 'react-router-dom'
import {
  organizationGovernanceConfig,
  organizationGovernanceEntry,
  organizationTransactionExplorer,
  readOrganizationAdmin,
  readOrganizationVoterAdmission,
  readOrganizationVoterPolicy,
  waitForOrganizationTransaction,
  type OrganizationGovernanceConfig,
} from '../../adapters/aptos/organizationGovernance'
import { AptosWalletBoundary } from '../../auth/AptosWalletBoundary'
import { useAccountSession } from '../../auth/session'
import { useT } from '../../i18n'
import { sound } from '../../sound/engine'
import { useOrganization } from '../../tenancy/OrganizationContext'
import { Panel } from './index'

const APTOS_ADDRESS = /^0x[0-9a-f]{1,64}$/i
const FULL_APTOS_ADDRESS = /^0x[0-9a-f]{64}$/i

type ChainState = {
  enabled: boolean
  owner: string
}

function shortAddress(value: string) {
  return value.length > 20 ? `${value.slice(0, 10)}…${value.slice(-7)}` : value
}

function V2NotConfigured({ ru }: { ru: boolean }) {
  const organization = useOrganization()
  const { user } = useAccountSession()
  const [network, setNetwork] = useState(organization.config?.aptos.network ?? 'testnet')
  const [moduleAddress, setModuleAddress] = useState(organization.config?.aptos.moduleAddress ?? '')
  const [organizationAddress, setOrganizationAddress] = useState(organization.config?.aptos.organizationAddress ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const canConfigure = user?.isSuperAdmin === true || user?.organizationRole === 'owner'
  const valid = FULL_APTOS_ADDRESS.test(moduleAddress) && FULL_APTOS_ADDRESS.test(organizationAddress)

  async function saveConnection(event: FormEvent) {
    event.preventDefault()
    if (!canConfigure || !user?.csrfToken || !valid) return
    setBusy(true)
    setMessage(null)
    try {
      const response = await fetch('/api/organization/profile', {
        method: 'PATCH',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-Token': user.csrfToken,
        },
        body: JSON.stringify({
          aptosNetwork: network,
          aptosModuleAddress: moduleAddress.toLowerCase(),
          aptosOrganizationAddress: organizationAddress.toLowerCase(),
        }),
      })
      const body = await response.json().catch(() => null) as { error?: string } | null
      if (!response.ok) throw new Error(body?.error ?? `HTTP ${response.status}`)
      setMessage(ru ? 'Адреса сохранены. Проверяем V2-контракт…' : 'Addresses saved. Checking the V2 contract…')
      organization.refresh()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'organization_v2_save_failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title={ru ? 'Подключение Aptos V2' : 'Connect Aptos V2'}>
      <div className="callout yellow">
        <strong>{ru ? 'V2-контракт ещё не связан с этой организацией.' : 'No V2 contract is linked to this organization yet.'}</strong>
        <p>
          {ru
            ? 'Здесь сохраняются только публичные адреса модуля и объекта организации. Приватные ключи сайт не запрашивает.'
            : 'Only the public module and organization object addresses are stored here. The website never requests private keys.'}
        </p>
      </div>
      {canConfigure ? (
        <form className="stack organization-v2-form" onSubmit={saveConnection}>
          <label className="field">
            <span>{ru ? 'Сеть' : 'Network'}</span>
            <select value={network} onChange={(event) => setNetwork(event.target.value as typeof network)}>
              <option value="testnet">Aptos Testnet</option>
              <option value="mainnet">Aptos Mainnet</option>
              <option value="devnet">Aptos Devnet</option>
              <option value="local">Local</option>
            </select>
          </label>
          <label className="field">
            <span>{ru ? 'Адрес опубликованного модуля' : 'Published module address'}</span>
            <input className="mono" value={moduleAddress} onChange={(event) => setModuleAddress(event.target.value.trim())} placeholder="0x…" spellCheck={false} aria-invalid={moduleAddress.length > 0 && !FULL_APTOS_ADDRESS.test(moduleAddress)} />
          </label>
          <label className="field">
            <span>{ru ? 'Адрес объекта организации' : 'Organization object address'}</span>
            <input className="mono" value={organizationAddress} onChange={(event) => setOrganizationAddress(event.target.value.trim())} placeholder="0x…" spellCheck={false} aria-invalid={organizationAddress.length > 0 && !FULL_APTOS_ADDRESS.test(organizationAddress)} />
          </label>
          <div className="row wrap">
            <button className="btn primary" type="submit" disabled={!valid || busy || !user?.csrfToken}>{busy ? (ru ? 'Сохраняем…' : 'Saving…') : (ru ? 'Подключить V2' : 'Connect V2')}</button>
            <Link className="btn" to="/organization/setup">{ru ? 'Основные настройки' : 'General setup'}</Link>
          </div>
          {message && <div className={`callout ${message.includes('сохранены') || message.includes('saved') ? 'lime' : 'red'}`} role="status">{message}</div>}
        </form>
      ) : (
        <p className="muted">{ru ? 'Публичные адреса может сохранить только владелец организации.' : 'Only the organization owner can save the public addresses.'}</p>
      )}
    </Panel>
  )
}

function useVoterAdmissionChain(config: OrganizationGovernanceConfig | null) {
  const { account, connected } = useWallet()
  const [chainState, setChainState] = useState<ChainState | null>(null)
  const [signerIsAdmin, setSignerIsAdmin] = useState(false)
  const [loading, setLoading] = useState(Boolean(config))
  const [error, setError] = useState<string | null>(null)
  const signerAddress = connected ? account?.address.toString().toLowerCase() ?? null : null

  const reload = useCallback(async () => {
    if (!config) {
      setChainState(null)
      setSignerIsAdmin(false)
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const state = await readOrganizationVoterPolicy(config)
      const isAdmin = signerAddress
        ? await readOrganizationAdmin(config, signerAddress)
        : false
      setChainState(state)
      setSignerIsAdmin(isAdmin)
    } catch (cause) {
      setChainState(null)
      setSignerIsAdmin(false)
      setError(cause instanceof Error ? cause.message : 'voter_policy_unavailable')
    } finally {
      setLoading(false)
    }
  }, [config, signerAddress])

  useEffect(() => { void reload() }, [reload])

  return { chainState, signerAddress, signerIsAdmin, loading, error, reload }
}

function VoterAdmissionPolicyContent() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const organization = useOrganization()
  const { signAndSubmitTransaction } = useWallet()
  const config = useMemo(
    () => organizationGovernanceConfig(organization.config?.aptos),
    [organization.config?.aptos],
  )
  const { chainState, signerAddress, signerIsAdmin, loading, error, reload } = useVoterAdmissionChain(config)
  const [target, setTarget] = useState('')
  const [targetAdmission, setTargetAdmission] = useState<boolean | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [explorer, setExplorer] = useState<string | null>(null)
  const validTarget = APTOS_ADDRESS.test(target.trim())

  async function submit(functionName: 'set_new_voters_enabled' | 'set_voter_admission', args: unknown[], action: string) {
    if (!config || !signerAddress || !signerIsAdmin) {
      setMessage(ru
        ? 'Подключите Aptos-кошелёк владельца или администратора этой организации.'
        : 'Connect an Aptos wallet that is the owner or an administrator of this organization.')
      sound.play('warning')
      return
    }

    setBusy(action)
    setMessage(ru ? 'Подтвердите транзакцию в кошельке…' : 'Confirm the transaction in your wallet…')
    setExplorer(null)
    try {
      const result = await signAndSubmitTransaction({
        data: {
          function: organizationGovernanceEntry(config, functionName),
          functionArguments: args as never[],
        },
      })
      await waitForOrganizationTransaction(config, result.hash)
      setExplorer(organizationTransactionExplorer(config, result.hash))
      setMessage(ru ? 'Изменение подтверждено сетью Aptos.' : 'The change is confirmed by Aptos.')
      sound.play('voteSuccess')
      await reload()
      if (functionName === 'set_voter_admission' && validTarget) {
        setTargetAdmission(await readOrganizationVoterAdmission(config, target.trim()))
      }
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'transaction_failed')
      sound.play('warning')
    } finally {
      setBusy(null)
    }
  }

  async function inspectTarget() {
    if (!config || !validTarget) return
    setBusy('inspect')
    setMessage(null)
    try {
      setTargetAdmission(await readOrganizationVoterAdmission(config, target.trim()))
    } catch (cause) {
      setTargetAdmission(null)
      setMessage(cause instanceof Error ? cause.message : 'admission_check_failed')
    } finally {
      setBusy(null)
    }
  }

  if (!config) return <V2NotConfigured ru={ru} />

  return (
    <div className="grid c2 voter-admission-admin">
      <Panel
        title={ru ? 'Новые регистрации' : 'New registrations'}
        hint={chainState ? (chainState.enabled ? (ru ? 'саморегистрация открыта' : 'self-registration open') : (ru ? 'саморегистрация закрыта' : 'self-registration closed')) : undefined}
      >
        {loading && <div className="empty">{ru ? 'Читаем политику из Aptos…' : 'Reading policy from Aptos…'}</div>}
        {!loading && error && (
          <div className="callout red">
            <strong>{ru ? 'Не удалось прочитать V2-состояние.' : 'Could not read V2 state.'}</strong>
            <p className="mono">{error}</p>
            <button className="btn small" type="button" onClick={() => void reload()}>{ru ? 'Повторить' : 'Retry'}</button>
          </div>
        )}
        {chainState && (
          <div className="stack">
            <div className={`callout ${chainState.enabled ? 'lime' : 'yellow'}`}>
              <strong>{chainState.enabled
                ? (ru ? 'Новый пользователь может сам активировать участие.' : 'A new user may activate participation.')
                : (ru ? 'Новые пользователи ждут допуска администратора.' : 'New users require administrator admission.')}</strong>
              <p>
                {ru
                  ? 'Состояние хранится в Aptos. Саморегистрация добавляет адрес в реестр допуска, но не выдаёт квалификацию и не создаёт вес голоса.'
                  : 'The state is stored in Aptos. Self-registration adds an address to the admission registry, but does not grant a qualification or voting weight.'}
              </p>
            </div>
            <button
              className={`btn ${chainState.enabled ? 'danger' : 'primary'}`}
              type="button"
              disabled={busy !== null || !signerIsAdmin}
              onClick={() => void submit('set_new_voters_enabled', [config.organizationAddress, !chainState.enabled], 'policy')}
            >
              {chainState.enabled
                ? (ru ? 'Закрыть саморегистрацию' : 'Close self-registration')
                : (ru ? 'Разрешить саморегистрацию' : 'Open self-registration')}
            </button>
            {!signerAddress && <p className="muted">{ru ? 'Для изменения подключите кошелёк подписи.' : 'Connect a signing wallet to make changes.'}</p>}
            {signerAddress && !signerIsAdmin && <p className="muted">{ru ? 'Подключённый адрес не является on-chain администратором этой организации.' : 'The connected address is not an on-chain administrator of this organization.'}</p>}
            <div className="mono muted">{ru ? 'Владелец' : 'Owner'}: {shortAddress(chainState.owner)}</div>
          </div>
        )}
      </Panel>

      <Panel title={ru ? 'Ручной допуск адреса' : 'Manual address admission'}>
        <div className="stack">
          <label className="field">
            <span>{ru ? 'Aptos-адрес пользователя' : 'User Aptos address'}</span>
            <input
              className="mono"
              value={target}
              onChange={(event) => {
                setTarget(event.target.value.trim())
                setTargetAdmission(null)
                setMessage(null)
              }}
              placeholder="0x…"
              spellCheck={false}
            />
          </label>
          <div className="row wrap">
            <button className="btn" type="button" disabled={!validTarget || busy !== null} onClick={() => void inspectTarget()}>
              {ru ? 'Проверить' : 'Check'}
            </button>
            <button className="btn primary" type="button" disabled={!validTarget || busy !== null || !signerIsAdmin} onClick={() => void submit('set_voter_admission', [config.organizationAddress, target.trim(), true], 'admit')}>
              {ru ? 'Допустить' : 'Admit'}
            </button>
            <button className="btn danger" type="button" disabled={!validTarget || busy !== null || !signerIsAdmin} onClick={() => void submit('set_voter_admission', [config.organizationAddress, target.trim(), false], 'deny')}>
              {ru ? 'Запретить' : 'Deny'}
            </button>
          </div>
          {targetAdmission !== null && (
            <div className={`callout ${targetAdmission ? 'lime' : 'yellow'}`}>
              {targetAdmission ? (ru ? 'Адрес допущен к будущим снимкам.' : 'The address is admitted to future snapshots.') : (ru ? 'Адрес не допущен.' : 'The address is not admitted.')}
            </div>
          )}
          <p className="muted">
            {ru
              ? 'Изменение влияет только на будущие снимки голосований. Уже открытые голосования сохраняют прежний состав.'
              : 'The change affects future election snapshots only. Open elections keep their existing electorate.'}
          </p>
        </div>
      </Panel>

      {message && (
        <div className={`callout ${explorer ? 'lime' : 'cyan'} voter-admission-message`} role="status" aria-live="polite">
          {message}
          {explorer && <> · <a href={explorer} target="_blank" rel="noreferrer">{ru ? 'Транзакция в обозревателе' : 'Open transaction'} ↗</a></>}
        </div>
      )}
    </div>
  )
}

function VoterAdmissionStatusContent() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const organization = useOrganization()
  const { user } = useAccountSession()
  const { connected, account, signAndSubmitTransaction } = useWallet()
  const config = useMemo(() => organizationGovernanceConfig(organization.config?.aptos), [organization.config?.aptos])
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [admitted, setAdmitted] = useState<boolean | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const signerAddress = connected ? account?.address.toString().toLowerCase() ?? null : null
  const votingAddress = user?.activeAptosAddress ?? user?.aptosAddress ?? null
  const accountMatches = Boolean(signerAddress && user && [user.aptosAddress, user.activeAptosAddress]
    .filter(Boolean)
    .some((value) => value?.toLowerCase() === signerAddress))

  const reload = useCallback(async () => {
    if (!config || !votingAddress) return
    try {
      const [policy, admission] = await Promise.all([
        readOrganizationVoterPolicy(config),
        readOrganizationVoterAdmission(config, votingAddress),
      ])
      setEnabled(policy.enabled)
      setAdmitted(admission)
      setMessage(null)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'voter_admission_unavailable')
    }
  }, [config, votingAddress])

  useEffect(() => { void reload() }, [reload])

  if (!config || !user) return null

  async function register() {
    if (!config || !signerAddress || !accountMatches) {
      setMessage(ru ? 'Сначала активируйте способ подтверждения для этого аккаунта.' : 'Activate a signing method for this account first.')
      return
    }
    setBusy(true)
    setMessage(ru ? 'Подтвердите активацию в кошельке…' : 'Confirm activation in your wallet…')
    try {
      const result = await signAndSubmitTransaction({
        data: {
          function: organizationGovernanceEntry(config, 'register_as_voter'),
          functionArguments: [config.organizationAddress],
        },
      })
      await waitForOrganizationTransaction(config, result.hash)
      sound.play('voteSuccess')
      await reload()
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'voter_registration_failed')
      sound.play('warning')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel title={ru ? 'Допуск к голосованиям' : 'Voting admission'}>
      <div className="stack">
        <div className={`callout ${admitted ? 'lime' : 'yellow'}`}>
          <strong>{admitted
            ? (ru ? 'Адрес внесён в реестр допуска.' : 'Your address is in the admission registry.')
            : (ru ? 'Адрес пока не внесён в реестр допуска.' : 'Your address is not yet in the admission registry.')}</strong>
          <p>{ru ? 'Квалификация и вес голоса назначаются отдельно.' : 'Qualification and voting weight are assigned separately.'}</p>
        </div>
        {!admitted && enabled && (
          <button className="btn primary" type="button" disabled={busy || !accountMatches} onClick={() => void register()}>
            {ru ? 'Активировать участие' : 'Activate participation'}
          </button>
        )}
        {!admitted && enabled && !accountMatches && <Link className="inline-link" to="/auth?returnTo=%2Fprofile">{ru ? 'Выбрать способ подтверждения' : 'Choose a signing method'}</Link>}
        {!admitted && enabled === false && <p className="muted">{ru ? 'Саморегистрация закрыта. Допуск может выдать администратор.' : 'Self-registration is closed. An administrator may grant admission.'}</p>}
        {message && <div className="callout cyan" role="status">{message}</div>}
      </div>
    </Panel>
  )
}

export function VoterAdmissionPolicy() {
  return <AptosWalletBoundary><VoterAdmissionPolicyContent /></AptosWalletBoundary>
}

export function VoterAdmissionStatus() {
  return <AptosWalletBoundary><VoterAdmissionStatusContent /></AptosWalletBoundary>
}
