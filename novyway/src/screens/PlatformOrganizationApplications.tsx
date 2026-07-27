import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import {
  applicationStatusLabel,
  applicationStatusTone,
  organizationApplicationRequest,
  organizationWorkspaceUrl,
  type OrganizationApplication,
  type OrganizationApplicationStatus,
} from '../tenancy/organizationApplication'
import { PageHead, Panel } from '../ui/components'

type ReviewFilter = 'all' | OrganizationApplicationStatus

function dateTime(value: string | null, ru: boolean) {
  if (!value) return '—'
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toLocaleString(ru ? 'ru-RU' : 'en-GB') : '—'
}

export default function PlatformOrganizationApplications() {
  const { lang } = useT()
  const { user } = useAccountSession()
  const ru = lang === 'ru'
  const [filter, setFilter] = useState<ReviewFilter>('submitted')
  const [applications, setApplications] = useState<OrganizationApplication[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const selected = useMemo(
    () => applications.find((application) => application.id === selectedId) ?? applications[0] ?? null,
    [applications, selectedId],
  )

  const load = useCallback(async (signal?: AbortSignal) => {
    const query = filter === 'all' ? '' : '?status=' + encodeURIComponent(filter)
    const body = await organizationApplicationRequest<{ applications: OrganizationApplication[] }>(
      '/api/platform/organization-applications' + query,
      { signal },
    )
    setApplications(body.applications)
    setSelectedId((current) => body.applications.some((item) => item.id === current) ? current : (body.applications[0]?.id ?? ''))
  }, [filter])

  useEffect(() => {
    if (!user?.isSuperAdmin) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    load(controller.signal)
      .then(() => setError(''))
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setError(ru ? 'Не удалось загрузить защищённую очередь.' : 'The protected queue could not be loaded.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [load, ru, user?.isSuperAdmin])

  async function decide(decision: 'approve' | 'changes_requested' | 'reject') {
    if (!selected || !user?.csrfToken || busy) return
    if (decision !== 'approve' && message.trim().length < 4) {
      setError(ru ? 'Для возврата или отклонения напишите конкретную причину.' : 'Provide a specific reason for revision or rejection.')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await organizationApplicationRequest<{ application: OrganizationApplication }>(
        '/api/platform/organization-applications/' + selected.id + '/review',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': user.csrfToken,
          },
          body: JSON.stringify({
            expectedRevision: selected.revision,
            decision,
            message: message.trim(),
          }),
        },
      )
      setMessage('')
      setNotice(decision === 'approve'
        ? (ru ? 'Организация одобрена и создана.' : 'Organization approved and created.')
        : decision === 'changes_requested'
          ? (ru ? 'Заявка возвращена автору.' : 'Application returned to its creator.')
          : (ru ? 'Заявка отклонена. Автор больше не имеет к ней доступа.' : 'Application rejected. The creator no longer has access.'))
      await load()
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : ''
      setError(code.includes('revision_conflict')
        ? (ru ? 'Заявка изменилась. Очередь обновлена.' : 'The application changed. The queue has been refreshed.')
        : (ru ? 'Решение не сохранено.' : 'The decision could not be saved.'))
      await load().catch(() => {})
    } finally {
      setBusy(false)
    }
  }

  if (!user?.isSuperAdmin) {
    return <>
      <PageHead title={ru ? 'Проверка организаций' : 'Organization review'} />
      <Panel>
        <p className="muted">{ru ? 'Этот раздел доступен только защищённому суперадминистратору платформы.' : 'This section is restricted to the protected platform super-administrator.'}</p>
        <Link className="btn" to="/">{ru ? 'На главную' : 'Home'}</Link>
      </Panel>
    </>
  }

  return <>
    <PageHead
      title={ru ? 'Заявки организаций' : 'Organization applications'}
      right={<Link className="btn small" to="/admin">{ru ? 'Управление Советом' : 'Council administration'}</Link>}
    />

    <div className="callout cyan">
      {ru
        ? 'Это отдельная платформенная очередь. Одобрение атомарно создаёт организацию, владельца, настройки и проверенный субдомен. Здесь нет доступа к паролям, приватным ключам или данным других организаций.'
        : 'This is a separate platform queue. Approval atomically creates the organization, owner, settings, and verified subdomain. It exposes no passwords, private keys, or data from other organizations.'}
    </div>

    <div className="platform-review-toolbar">
      <label className="field">
        <span>{ru ? 'Статус' : 'Status'}</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value as ReviewFilter)}>
          <option value="submitted">{ru ? 'На рассмотрении' : 'Under review'}</option>
          <option value="changes_requested">{ru ? 'На доработке' : 'Changes requested'}</option>
          <option value="approved">{ru ? 'Одобрены' : 'Approved'}</option>
          <option value="rejected">{ru ? 'Отклонены' : 'Rejected'}</option>
          <option value="draft">{ru ? 'Черновики' : 'Drafts'}</option>
          <option value="all">{ru ? 'Все' : 'All'}</option>
        </select>
      </label>
      <button className="btn" type="button" disabled={loading} onClick={() => void load()}>{ru ? 'Обновить' : 'Refresh'}</button>
    </div>

    {loading && <div className="route-loading" role="status"><span /></div>}
    {error && <div className="callout red" role="alert">{error}</div>}
    {notice && <div className="callout green" role="status">{notice}</div>}

    {!loading && applications.length === 0 && <Panel className="empty"><p>{ru ? 'В этой очереди заявок нет.' : 'There are no applications in this queue.'}</p></Panel>}

    {applications.length > 0 && <div className="platform-review-layout">
      <aside className="platform-review-list" aria-label={ru ? 'Список заявок' : 'Application list'}>
        {applications.map((application) => <button
          type="button"
          key={application.id}
          className={application.id === selected?.id ? 'active' : ''}
          onClick={() => {
            setSelectedId(application.id)
            setMessage('')
            setError('')
            setNotice('')
          }}
        >
          <span className={'chip ' + applicationStatusTone(application.status)}><span className="dot" aria-hidden />{applicationStatusLabel(application.status, ru)}</span>
          <strong>{application.name}</strong>
          <code>{application.slug}.novyway.com</code>
          <small>{application.creator?.email || application.creator?.displayName || application.creator?.id}</small>
        </button>)}
      </aside>

      {selected && <main className="platform-review-detail">
        <Panel title={selected.name} hint={'rev ' + selected.revision}>
          <div className="platform-review-heading">
            <div><code>{selected.slug}.novyway.com</code><p>{selected.description || (ru ? 'Описание не добавлено.' : 'No description provided.')}</p></div>
            <dl>
              <div><dt>{ru ? 'Автор' : 'Creator'}</dt><dd>{selected.creator?.email || selected.creator?.displayName || selected.creator?.id}</dd></div>
              <div><dt>{ru ? 'Отправлена' : 'Submitted'}</dt><dd>{dateTime(selected.submittedAt, ru)}</dd></div>
              <div><dt>{ru ? 'Видимость' : 'Visibility'}</dt><dd>{selected.visibility}</dd></div>
            </dl>
          </div>
        </Panel>

        <div className="grid c2 platform-review-facts">
          <Panel title={ru ? 'Участники и правила' : 'Members and rules'}>
            <dl className="organization-application-summary">
              <div><dt>{ru ? 'Модель' : 'Model'}</dt><dd>{{
                'expert-weighted': ru ? 'Экспертно-взвешенная' : 'Expert weighted',
                'equal-member': ru ? 'Равные участники' : 'Equal members',
                'simple-committee': ru ? 'Комитет' : 'Committee',
              }[selected.setup.templateId]}</dd></div>
              <div><dt>{ru ? 'Ожидается участников' : 'Expected members'}</dt><dd>{selected.setup.people.memberEstimate}</dd></div>
              <div><dt>{ru ? 'Первичное приглашение' : 'Initial invitation'}</dt><dd>{{
                'secure-link': ru ? 'Защищённая ссылка' : 'Secure link',
                'email-review': ru ? 'Список почт с проверкой' : 'Reviewed email list',
                manual: ru ? 'Вручную' : 'Manual',
              }[selected.setup.people.invitationMode]}</dd></div>
              <div><dt>{ru ? 'Минимальное участие' : 'Minimum participation'}</dt><dd>{selected.setup.governance.quorumPercent}%</dd></div>
              <div><dt>{ru ? 'Поддержка для принятия' : 'Support required'}</dt><dd>{selected.setup.governance.approvalPercent}%</dd></div>
              {selected.setup.templateId === 'simple-committee' && <div><dt>{ru ? 'Размер комитета' : 'Committee size'}</dt><dd>{selected.setup.governance.committeeSize}</dd></div>}
            </dl>
          </Panel>
          <Panel title={ru ? 'Решения' : 'Decisions'}>
            <div className="organization-review-tags">
              {selected.setup.governance.decisionCategories.map((category) => <span className="chip muted" key={category}>{{
                document_change: ru ? 'Изменение документов' : 'Document changes',
                budget: ru ? 'Бюджет' : 'Budget',
                project: ru ? 'Проекты' : 'Projects',
                personnel: ru ? 'Кадровые решения' : 'Personnel',
                election: ru ? 'Выборы' : 'Elections',
                rule_change: ru ? 'Изменение правил' : 'Rule changes',
                advisory: ru ? 'Консультативные опросы' : 'Advisory polls',
              }[category]}</span>)}
              {selected.setup.governance.customDecisionCategory && <span className="chip cyan">{selected.setup.governance.customDecisionCategory}</span>}
            </div>
          </Panel>
          <Panel title={ru ? 'Оформление' : 'Branding'}>
            <dl className="organization-application-summary">
              <div><dt>{ru ? 'Полное название' : 'Full name'}</dt><dd>{selected.setup.branding.displayName}</dd></div>
              <div><dt>{ru ? 'Короткое название' : 'Short name'}</dt><dd>{selected.setup.branding.shortName}</dd></div>
              <div><dt>{ru ? 'Цветовой акцент' : 'Accent color'}</dt><dd><span className="organization-review-accent" style={{ backgroundColor: selected.setup.branding.accentColor }} aria-hidden />{selected.setup.branding.accentColor}</dd></div>
              <div><dt>{ru ? 'Логотип' : 'Logo'}</dt><dd>{selected.setup.branding.logoUrl ? <a href={selected.setup.branding.logoUrl} target="_blank" rel="noreferrer">{ru ? 'Открыть' : 'Open'}</a> : '—'}</dd></div>
            </dl>
          </Panel>
          <Panel title={ru ? 'Адрес и ссылки' : 'Address and links'}>
            <dl className="organization-application-summary">
              <div><dt>{ru ? 'Физический адрес' : 'Physical address'}</dt><dd>{selected.setup.address.hasPhysicalAddress
                ? [selected.setup.address.addressLine, selected.setup.address.city, selected.setup.address.region, selected.setup.address.postalCode, selected.setup.address.country].filter(Boolean).join(', ')
                : (ru ? 'Организация работает онлайн' : 'Online organization')}</dd></div>
              <div><dt>{ru ? 'Публикация адреса' : 'Address visibility'}</dt><dd>{selected.setup.address.publishAddress ? (ru ? 'Публично' : 'Public') : (ru ? 'Не публиковать' : 'Private')}</dd></div>
              <div><dt>{ru ? 'Сайт проекта' : 'Project website'}</dt><dd>{selected.setup.contacts.projectUrl ? <a href={selected.setup.contacts.projectUrl} target="_blank" rel="noreferrer">{selected.setup.contacts.projectUrl}</a> : '—'}</dd></div>
            </dl>
            {selected.setup.contacts.links.length > 0 && <div className="organization-review-links">
              {selected.setup.contacts.links.map((link) => <a href={link.url} target="_blank" rel="noreferrer" key={link.id}>{link.kind === 'other' ? link.label : link.kind}</a>)}
            </div>}
          </Panel>
        </div>

        {selected.reviewMessage && <div className="callout yellow"><strong>{ru ? 'Предыдущее решение' : 'Previous decision'}</strong><span>{selected.reviewMessage}</span></div>}

        {selected.status === 'submitted' ? <Panel title={ru ? 'Решение по заявке' : 'Review decision'}>
          <label className="field">
            <span>{ru ? 'Комментарий автору' : 'Message to creator'}</span>
            <textarea rows={5} maxLength={4000} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={ru ? 'Для возврата или отклонения укажите, что именно нужно исправить.' : 'For revision or rejection, explain what must change.'} />
          </label>
          <div className="platform-review-actions">
            <button className="btn primary" type="button" disabled={busy} onClick={() => void decide('approve')}>{ru ? 'Одобрить и открыть' : 'Approve and open'}</button>
            <button className="btn" type="button" disabled={busy || message.trim().length < 4} onClick={() => void decide('changes_requested')}>{ru ? 'Вернуть на доработку' : 'Request changes'}</button>
            <button className="btn danger" type="button" disabled={busy || message.trim().length < 4} onClick={() => void decide('reject')}>{ru ? 'Отклонить' : 'Reject'}</button>
          </div>
        </Panel> : selected.status === 'approved' ? (
          <a className="btn primary" href={organizationWorkspaceUrl(selected.slug)}>{ru ? 'Открыть созданную организацию' : 'Open created organization'}</a>
        ) : selected.status === 'rejected' ? (
          <div className="callout red">{ru ? 'Автор больше не видит заявку. Полная запись будет удалена после ' : 'The creator can no longer see this application. The full record will be deleted after '}{dateTime(selected.rejectedPurgeAt ?? null, ru)}.</div>
        ) : null}
      </main>}
    </div>}
  </>
}
