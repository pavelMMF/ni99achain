import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { hasWebsiteGovernanceAccess, useAccountSession } from '../../auth/session'
import { readGovernanceAdminState, type GovernanceAdminState } from '../../adapters/aptos/adminAccess'
import { useT } from '../../i18n'
import { useOrganization } from '../../tenancy/OrganizationContext'
import { DEFAULT_ORGANIZATION_SLUG } from '../../tenancy/organization'
import { PageHead, Panel } from './index'

export type GovernanceAdminContextState = GovernanceAdminState & {
  siteSuperAdmin: boolean
  governanceSignerActive: boolean
  creatorSignerActive: boolean
  legacyAvailable: boolean
  legacyLoading: boolean
  legacyError: string | null
  retryLegacy: () => void
}

const AdminContext = createContext<GovernanceAdminContextState | null>(null)

function GovernancePageHead({ ru }: { ru: boolean }) {
  return (
    <PageHead
      title={ru ? 'Управление Советом' : 'Council governance'}
      sub={ru
        ? 'Роли, правила и голосования организации. Серверная панель остаётся отдельным локальным приложением.'
        : 'Organization roles, rules, and elections. Server operations remain in the separate local application.'}
    />
  )
}

export function GovernanceAdminGate({ children }: { children: ReactNode }) {
  const { lang } = useT()
  const ru = lang === 'ru'
  const { user, loading: sessionLoading } = useAccountSession()
  const { orgSlug } = useOrganization()
  const hasSiteAccess = hasWebsiteGovernanceAccess(user)
  const usesLegacyGovernance = orgSlug === DEFAULT_ORGANIZATION_SLUG
  const [state, setState] = useState<GovernanceAdminState | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const accountAddress = user?.aptosAddress
    if (!hasSiteAccess || !accountAddress || !usesLegacyGovernance) {
      setState(null)
      setLoading(false)
      setError(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)
    readGovernanceAdminState(accountAddress)
      .then((next) => {
        if (active) setState(next)
      })
      .catch((cause) => {
        if (active) {
          setState(null)
          setError(cause instanceof Error ? cause.message : 'admin_check_failed')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [hasSiteAccess, reload, user?.aptosAddress, user?.id, usesLegacyGovernance])

  if (sessionLoading) {
    return <div className="empty">{ru ? 'Загружаем состояние управления из Aptos…' : 'Loading governance state from Aptos…'}</div>
  }

  if (!user) {
    return (
      <>
        <GovernancePageHead ru={ru} />
        <Panel title={ru ? 'Нужна авторизация' : 'Sign-in required'}>
          <p className="muted">
            {ru
              ? 'Войдите в аккаунт администратора организации.'
              : 'Sign in with an organization administrator account.'}
          </p>
          <Link className="btn primary" to="/auth?returnTo=%2Fadmin">{ru ? 'Перейти ко входу' : 'Sign in'}</Link>
        </Panel>
      </>
    )
  }

  if (!hasSiteAccess) {
    return (
      <>
        <GovernancePageHead ru={ru} />
        <Panel title={ru ? 'Доступ закрыт' : 'Access denied'}>
          <p>
            {ru
              ? 'Этот аккаунт не назначен администратором текущей организации.'
              : 'This account is not an administrator of the current organization.'}
          </p>
        </Panel>
      </>
    )
  }

  const accountAddress = user.activeAptosAddress ?? user.aptosAddress
  const effectiveState: GovernanceAdminState = state ?? {
    address: accountAddress,
    creator: accountAddress,
    isCreator: false,
    isAdmin: false,
    administrators: [],
    threshold: 0,
    versions: ['0', '0', '0'],
    counters: ['0', '0', '0', '0', '0', '0', '0', '0'],
  }

  const context: GovernanceAdminContextState = {
    ...effectiveState,
    siteSuperAdmin: user.isSuperAdmin,
    governanceSignerActive: user.governanceSignerActive,
    creatorSignerActive: user.creatorSignerActive,
    legacyAvailable: usesLegacyGovernance && state !== null,
    legacyLoading: usesLegacyGovernance && loading,
    legacyError: usesLegacyGovernance ? error : null,
    retryLegacy: () => setReload((value) => value + 1),
  }

  return (
    <AdminContext.Provider value={context}>
      {usesLegacyGovernance && !state && (
        <div className={`callout ${error ? 'yellow' : 'cyan'} governance-legacy-warning`} role="status">
          <strong>{loading
            ? (ru ? 'Читаем состояние основного Совета из Aptos…' : 'Reading the main Council state from Aptos…')
            : (ru ? 'Старое состояние Совета сейчас недоступно.' : 'The legacy Council state is currently unavailable.')}</strong>{' '}
          {!loading && (
            <>
              {ru
                ? 'Доступ к сайту подтверждён сервером, поэтому V2-настройки остаются доступны. Старые инструменты появятся после успешной проверки сети.'
                : 'Website access is verified by the server, so V2 settings remain available. Legacy tools return after the network check succeeds.'}{' '}
              <button className="btn small" type="button" onClick={context.retryLegacy}>{ru ? 'Повторить' : 'Retry'}</button>
            </>
          )}
        </div>
      )}
      {!user.governanceSignerActive && (
        <div className="callout yellow governance-signer-warning">
          <strong>{ru ? 'Панель доступна, подпись не активна.' : 'Console access is active; signing is not.'}</strong>{' '}
          {ru
            ? 'Вы можете просматривать настройки. Для отправки транзакций подключите Aptos-кошелёк администратора в разделе способов входа.'
            : 'You can inspect settings. Connect an administrator Aptos wallet in sign-in methods before submitting transactions.'}{' '}
          <Link to="/auth?returnTo=%2Fadmin">{ru ? 'Выбрать способ подписи' : 'Choose signing method'}</Link>
        </div>
      )}
      {children}
    </AdminContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useGovernanceAdmin() {
  const state = useContext(AdminContext)
  if (!state) throw new Error('useGovernanceAdmin must be used inside GovernanceAdminGate')
  return state
}
