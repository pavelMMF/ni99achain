import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppShell } from './ui/layout/AppShell'
import { PageHead, Panel } from './ui/components'
import { GovernanceAdminGate } from './ui/components/GovernanceAdminGate'
import { useAccountSession } from './auth/session'
import { useT } from './i18n'
import { useOrganization } from './tenancy/OrganizationContext'

const PlatformLanding = lazy(() => import('./screens/PlatformLanding'))
const Overview = lazy(() => import('./screens/Overview'))
const Elections = lazy(() => import('./screens/Elections'))
const ElectionDetail = lazy(() => import('./screens/ElectionDetail'))
const Documents = lazy(() => import('./screens/Documents'))
const DocumentDetail = lazy(() => import('./screens/DocumentDetail'))
const Participants = lazy(() => import('./screens/Participants'))
const Profile = lazy(() => import('./screens/Profile'))
const Exams = lazy(() => import('./screens/Exams'))
const ExamDetail = lazy(() => import('./screens/ExamDetail'))
const Audit = lazy(() => import('./screens/Audit'))
const Settings = lazy(() => import('./screens/Settings'))
const NetworkStatus = lazy(() => import('./screens/NetworkStatus'))
const WeightExplainer = lazy(() => import('./screens/WeightExplainer'))
const SignalGame = lazy(() => import('./screens/SignalGame'))
const Auth = lazy(() => import('./screens/Auth'))
const Admin = lazy(() => import('./screens/Admin'))
const OrganizationSetup = lazy(() => import('./screens/OrganizationSetup'))
const OrganizationAccess = lazy(() => import('./screens/OrganizationAccess'))
const OrganizationCreate = lazy(() => import('./screens/OrganizationCreate'))
const OrganizationApplications = lazy(() => import('./screens/OrganizationApplications'))
const OrganizationApplicationSetup = lazy(() => import('./screens/OrganizationApplicationSetup'))
const PlatformOrganizationApplications = lazy(() => import('./screens/PlatformOrganizationApplications'))

export default function App() {
  const { access, refresh, verificationStatus } = useOrganization()
  const { user } = useAccountSession()
  const location = useLocation()
  const publicPaths = ['/auth', '/settings']
  const organizationLoading = verificationStatus === 'loading'
  const membersOnlyBlocked = access?.memberOnly
    && access.canViewWorkspace === false
    && !publicPaths.includes(location.pathname)

  useEffect(() => {
    refresh()
  }, [refresh, user?.id])

  return (
    <AppShell>
      <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading"><span /></div>}>
        {organizationLoading ? <div className="route-loading" role="status" aria-label="Loading"><span /></div> : membersOnlyBlocked ? <MembersOnlyGate /> : (
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/about" element={<PlatformLanding />} />
            <Route path="/elections" element={<Elections />} />
            <Route path="/elections/:id" element={<ElectionDetail />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/:id" element={<DocumentDetail />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<ExamDetail />} />
            <Route path="/audit" element={<Audit />} />
            <Route path="/graph" element={<Navigate to="/documents?view=graph" replace />} />
            <Route path="/network" element={<NetworkStatus />} />
            <Route path="/weights" element={<WeightExplainer />} />
            <Route path="/signal-game" element={<SignalGame />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<GovernanceAdminGate><Admin /></GovernanceAdminGate>} />
            <Route path="/organization/setup" element={<GovernanceAdminGate><OrganizationSetup /></GovernanceAdminGate>} />
            <Route path="/organization/access" element={<OrganizationAccess />} />
            <Route path="/organizations/new" element={<OrganizationCreate />} />
            <Route path="/organizations/applications" element={<OrganizationApplications />} />
            <Route path="/organizations/applications/:applicationId/setup" element={<OrganizationApplicationSetup />} />
            <Route path="/platform/organization-applications" element={<PlatformSuperAdminGate><PlatformOrganizationApplications /></PlatformSuperAdminGate>} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Overview />} />
          </Routes>
        )}
      </Suspense>
    </AppShell>
  )
}

function PlatformSuperAdminGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAccountSession()
  if (loading) return <div className="route-loading" role="status" aria-label="Loading"><span /></div>
  return user?.isSuperAdmin ? children : <Navigate to="/profile" replace />
}

function MembersOnlyGate() {
  const { lang } = useT()
  const ru = lang === 'ru'
  return (
    <>
      <PageHead
        title={ru ? 'Доступ только для участников' : 'Members only'}
        sub={ru ? 'Эта организация скрывает рабочие разделы сайта от внешних посетителей.' : 'This organization hides workspace screens from visitors outside the member list.'}
        right={<Link className="btn small" to="/auth">{ru ? 'Войти' : 'Sign in'}</Link>}
      />
      <Panel>
        <div className="callout" style={{ marginBottom: 14 }}>
          {ru
            ? 'Ограничение работает на уровне сайта: документы, голосования, участники, экзамены и панель управления показываются только активным участникам организации. Публичные on-chain доказательства в Aptos при этом не шифруются и остаются проверяемыми по хэшу транзакции.'
            : 'This restriction is enforced by the website: documents, elections, participants, exams, and governance screens are shown only to active organization members. Public Aptos on-chain proofs are not encrypted and remain verifiable by transaction hash.'}
        </div>
        <div className="row" style={{ gap: 10 }}>
          <Link className="btn primary" to="/auth">{ru ? 'Войти или подключить кошелёк' : 'Sign in or connect wallet'}</Link>
          <Link className="btn" to="/settings">{ru ? 'Настройки' : 'Settings'}</Link>
        </div>
      </Panel>
    </>
  )
}
