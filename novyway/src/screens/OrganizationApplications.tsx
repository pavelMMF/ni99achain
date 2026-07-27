import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import {
  applicationStatusLabel,
  applicationStatusTone,
  organizationApplicationRequest,
  organizationWorkspaceUrl,
  type OrganizationApplication,
} from '../tenancy/organizationApplication'
import { PageHead, Panel } from '../ui/components'

function formatDate(value: string | null, lang: 'ru' | 'en') {
  if (!value) return '—'
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return '—'
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export default function OrganizationApplications() {
  const { lang } = useT()
  const { user, loading: sessionLoading } = useAccountSession()
  const userId = user?.id ?? null
  const ru = lang === 'ru'
  const [applications, setApplications] = useState<OrganizationApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (sessionLoading) return
    if (!userId) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    organizationApplicationRequest<{ applications: OrganizationApplication[] }>('/api/organization-applications', {
      signal: controller.signal,
    })
      .then((body) => {
        setApplications(body.applications)
        setError('')
      })
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setError(ru ? 'Не удалось загрузить заявки.' : 'Applications could not be loaded.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [ru, sessionLoading, userId])

  if (!sessionLoading && !user) {
    return <>
      <PageHead title={ru ? 'Мои организации' : 'My organizations'} />
      <Panel>
        <p className="muted">{ru ? 'Войдите, чтобы открыть свои черновики и решения по заявкам.' : 'Sign in to open your drafts and application decisions.'}</p>
        <Link className="btn primary" to="/auth?returnTo=%2Forganizations%2Fapplications">{ru ? 'Войти' : 'Sign in'}</Link>
      </Panel>
    </>
  }

  return <>
    <PageHead
      title={ru ? 'Мои организации' : 'My organizations'}
      right={<Link className="btn primary small" to="/organizations/new">{ru ? 'Новая заявка' : 'New application'}</Link>}
    />

    <div className="callout organization-application-privacy">
      {ru
        ? 'Черновики и возвращённые на доработку заявки видите только вы и суперадминистратор платформы. Отклонённая заявка сразу исчезает из этого списка.'
        : 'Drafts and applications returned for revision are visible only to you and the platform super-administrator. Rejected applications disappear from this list immediately.'}
    </div>

    {loading && <div className="route-loading" role="status" aria-label={ru ? 'Загрузка' : 'Loading'}><span /></div>}
    {error && <div className="callout red" role="alert">{error}</div>}
    {!loading && !error && applications.length === 0 && (
      <Panel className="empty">
        <h2>{ru ? 'Заявок пока нет' : 'No applications yet'}</h2>
        <p>{ru ? 'Начните с названия и будущего адреса. До отправки всё останется закрытым черновиком.' : 'Start with a name and future address. Everything remains a private draft until submission.'}</p>
        <Link className="btn primary" to="/organizations/new">{ru ? 'Создать черновик' : 'Create draft'}</Link>
      </Panel>
    )}

    <div className="organization-application-list">
      {applications.map((application) => {
        const statusClass = applicationStatusTone(application.status)
        return <article className="panel organization-application-card" key={application.id}>
          <header>
            <div>
              <span className={'chip ' + statusClass}><span className="dot" aria-hidden />{applicationStatusLabel(application.status, ru)}</span>
              <h2>{application.name}</h2>
              <code>{application.slug}.novyway.com</code>
            </div>
            <span className="mono muted">{ru ? 'обновлено ' : 'updated '}{formatDate(application.updatedAt, lang)}</span>
          </header>
          {application.description && <p>{application.description}</p>}
          {application.reviewMessage && (
            <div className={'callout ' + (application.status === 'changes_requested' ? 'yellow' : 'cyan')}>
              <strong>{ru ? 'Комментарий проверки' : 'Review note'}</strong>
              <span>{application.reviewMessage}</span>
            </div>
          )}
          <footer>
            {application.status === 'approved' && application.approvedHostname
              ? <a className="btn primary" href={organizationWorkspaceUrl(application.slug)}>{ru ? 'Открыть организацию' : 'Open organization'}</a>
              : <Link className={'btn ' + (application.canEdit ? 'primary' : '')} to={'/organizations/applications/' + application.id + '/setup'}>
                  {application.canEdit ? (ru ? 'Продолжить' : 'Continue') : (ru ? 'Открыть статус' : 'Open status')}
                </Link>}
            <span className="muted">
              {application.status === 'submitted'
                ? (ru ? 'Редактирование закрыто до решения.' : 'Editing is locked until review.')
                : application.status === 'approved'
                  ? (ru ? 'Рабочее пространство создано.' : 'Workspace created.')
                  : (ru ? 'Можно сохранить и вернуться позже.' : 'You can save and return later.')}
            </span>
          </footer>
        </article>
      })}
    </div>
  </>
}
