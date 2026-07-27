import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import {
  applyOrganizationApplicationTemplate,
  normalizeOrganizationApplicationSetup,
  ORGANIZATION_APPLICATION_STEPS,
  ORGANIZATION_APPLICATION_TEMPLATES,
  ORGANIZATION_DECISION_CATEGORIES,
  ORGANIZATION_LINK_KINDS,
  organizationApplicationSetupIsReady,
  validateOrganizationApplicationStep,
  type OrganizationApplicationSetupDraft,
  type OrganizationApplicationSetupErrorCode,
  type OrganizationApplicationSetupErrors,
  type OrganizationApplicationTemplateId,
  type OrganizationContactLink,
  type OrganizationDecisionCategory,
  type OrganizationLinkKind,
} from '../tenancy/organizationApplicationDraft'
import {
  applicationStatusLabel,
  applicationStatusTone,
  organizationApplicationRequest,
  organizationWorkspaceUrl,
  type OrganizationApplication,
} from '../tenancy/organizationApplication'
import { PageHead, Panel } from '../ui/components'
import { OrganizationTelegramBot } from '../ui/components/OrganizationTelegramBot'

const EDITABLE_STEPS = [0, 1, 2, 3] as const

const STEP_COPY = {
  ru: ['Модель', 'Участники', 'Правила', 'Организация', 'Проверка'],
  en: ['Model', 'Participants', 'Rules', 'Organization', 'Review'],
} as const

const STEP_DESCRIPTION = {
  ru: [
    'Выберите, как в организации будут учитывать мнения участников.',
    'Оцените размер сообщества и способ первичного приглашения.',
    'Задайте пороги голосования и темы будущих решений.',
    'Укажите название, оформление, контакты и, при необходимости, адрес.',
    'Проверьте заявку перед отправкой супер-администратору платформы.',
  ],
  en: [
    'Choose how participant opinions will be counted.',
    'Estimate community size and choose the initial invitation method.',
    'Set voting thresholds and future decision categories.',
    'Add the name, visual identity, contacts, and optional address.',
    'Review the application before sending it to the platform super administrator.',
  ],
} as const

const TEMPLATE_COPY: Record<OrganizationApplicationTemplateId, {
  ru: { title: string; text: string }
  en: { title: string; text: string }
}> = {
  'expert-weighted': {
    ru: {
      title: 'Экспертно-взвешенная',
      text: 'Вес голоса зависит от подтверждённой квалификации участника в теме решения.',
    },
    en: {
      title: 'Expert-weighted',
      text: 'Voting weight follows verified subject qualification.',
    },
  },
  'equal-member': {
    ru: {
      title: 'Равные участники',
      text: 'Каждый допущенный участник получает один голос одинакового веса.',
    },
    en: {
      title: 'Equal members',
      text: 'Every admitted member receives one vote of equal weight.',
    },
  },
  'simple-committee': {
    ru: {
      title: 'Комитет',
      text: 'Решения принимает заранее определённый состав, а не все участники организации.',
    },
    en: {
      title: 'Committee',
      text: 'Decisions are made by a defined committee rather than every organization member.',
    },
  },
}

const DECISION_COPY: Record<OrganizationDecisionCategory, { ru: string; en: string }> = {
  document_change: { ru: 'Документы и положения', en: 'Documents and policies' },
  budget: { ru: 'Бюджет и расходы', en: 'Budget and spending' },
  project: { ru: 'Проекты и работа', en: 'Projects and operations' },
  personnel: { ru: 'Участники и доступ', en: 'Membership and access' },
  election: { ru: 'Выборы и назначения', en: 'Elections and appointments' },
  rule_change: { ru: 'Правила организации', en: 'Organization rules' },
  advisory: { ru: 'Консультативные опросы', en: 'Advisory polls' },
}

const LINK_COPY: Record<OrganizationLinkKind, { ru: string; en: string }> = {
  telegram: { ru: 'Telegram', en: 'Telegram' },
  instagram: { ru: 'Instagram', en: 'Instagram' },
  vk: { ru: 'ВКонтакте', en: 'VK' },
  youtube: { ru: 'YouTube', en: 'YouTube' },
  discord: { ru: 'Discord', en: 'Discord' },
  other: { ru: 'Другая ссылка', en: 'Other link' },
}

function applicationErrorText(code: string, ru: boolean) {
  if (code.includes('revision_conflict')) {
    return ru
      ? 'Заявка изменилась в другой вкладке. Загружена её свежая версия.'
      : 'The application changed in another tab. Its latest version was loaded.'
  }
  if (code.includes('not_editable') || code.includes('not_submittable')) {
    return ru
      ? 'Сейчас заявка закрыта для редактирования.'
      : 'The application is currently locked for editing.'
  }
  if (code.includes('incomplete')) {
    return ru
      ? 'Перед отправкой завершите четыре раздела заявки.'
      : 'Complete all four application sections before submission.'
  }
  if (code.includes('not_found')) {
    return ru
      ? 'Заявка не найдена или больше недоступна.'
      : 'The application was not found or is no longer available.'
  }
  return ru
    ? 'Не удалось сохранить изменения. Повторите попытку.'
    : 'Changes could not be saved. Try again.'
}

function fieldErrorText(code: OrganizationApplicationSetupErrorCode, ru: boolean) {
  const map = ru ? {
    required: 'Заполните это поле.',
    invalid: 'Проверьте значение.',
    invalid_email: 'Проверьте адреса электронной почты.',
    invalid_url: 'Укажите полную ссылку, начинающуюся с https://.',
    too_many: 'Можно указать не более 50 адресов.',
    too_short: 'Значение слишком короткое.',
    out_of_range: 'Значение выходит за допустимый диапазон.',
    incomplete: 'Сначала завершите обязательные разделы.',
  } : {
    required: 'Complete this field.',
    invalid: 'Check this value.',
    invalid_email: 'Check the email addresses.',
    invalid_url: 'Enter a full URL starting with https://.',
    too_many: 'You can enter no more than 50 addresses.',
    too_short: 'This value is too short.',
    out_of_range: 'This value is outside the allowed range.',
    incomplete: 'Complete the required sections first.',
  }
  return map[code]
}

function safeDraft(application: OrganizationApplication) {
  const current = application.setup as unknown as {
    branding?: Partial<OrganizationApplicationSetupDraft['branding']>
  }
  return normalizeOrganizationApplicationSetup(application.setup, application.slug, {
    displayName: current.branding?.displayName || application.name,
    shortName: current.branding?.shortName || application.name.slice(0, 24),
    accentColor: current.branding?.accentColor || '#f04438',
    logoUrl: current.branding?.logoUrl || '',
  })
}

function RequiredLabel({ children, optional, ru }: {
  children: ReactNode
  optional?: boolean
  ru: boolean
}) {
  return <span className="application-field-label">
    {children}
    {optional
      ? <small>{ru ? 'необязательно' : 'optional'}</small>
      : <b className="required-mark" aria-label={ru ? 'обязательное поле' : 'required'}>*</b>}
  </span>
}

function FieldError({ id, code, ru }: {
  id: string
  code?: OrganizationApplicationSetupErrorCode
  ru: boolean
}) {
  if (!code) return null
  return <span id={`${id}-error`} className="application-field-error">{fieldErrorText(code, ru)}</span>
}

function fieldA11y(id: string, errors: OrganizationApplicationSetupErrors) {
  return errors[id]
    ? { 'aria-invalid': true as const, 'aria-describedby': `${id}-error` }
    : {}
}

export default function OrganizationApplicationSetup() {
  const { applicationId = '' } = useParams()
  const { lang } = useT()
  const { user, loading: sessionLoading } = useAccountSession()
  const ru = lang === 'ru'
  const userId = user?.id
  const [application, setApplication] = useState<OrganizationApplication | null>(null)
  const [draft, setDraft] = useState<OrganizationApplicationSetupDraft | null>(null)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<OrganizationApplicationSetupErrors>({})
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const didFocusInitialStep = useRef(false)
  const labels = ru ? STEP_COPY.ru : STEP_COPY.en
  const descriptions = ru ? STEP_DESCRIPTION.ru : STEP_DESCRIPTION.en

  const loadApplication = useCallback(async (signal?: AbortSignal) => {
    const body = await organizationApplicationRequest<{ application: OrganizationApplication }>(
      '/api/organization-applications/' + encodeURIComponent(applicationId),
      { signal },
    )
    const nextDraft = safeDraft(body.application)
    setApplication(body.application)
    setDraft(nextDraft)
    setStep(Math.min(4, Math.max(0, nextDraft.currentStep || 0)))
    return body.application
  }, [applicationId])

  useEffect(() => {
    if (sessionLoading) return
    if (!userId || !applicationId) {
      setLoading(false)
      return
    }
    const controller = new AbortController()
    setLoading(true)
    loadApplication(controller.signal)
      .then(() => setError(''))
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setError(applicationErrorText(caught instanceof Error ? caught.message : '', ru))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [applicationId, loadApplication, ru, sessionLoading, userId])

  useEffect(() => {
    stepHeadingRef.current?.focus({ preventScroll: true })
    if (didFocusInitialStep.current) {
      window.requestAnimationFrame(() => {
        stepHeadingRef.current?.closest('.application-wizard-stage')?.scrollIntoView({
          block: 'start',
          behavior: document.documentElement.dataset.motion === 'reduced' ? 'auto' : 'smooth',
        })
      })
    } else {
      didFocusInitialStep.current = true
    }
  }, [step])

  const ready = useMemo(() => draft ? organizationApplicationSetupIsReady(draft) : false, [draft])
  const canEdit = Boolean(application?.canEdit && userId)
  const completedCount = draft
    ? EDITABLE_STEPS.filter((value) => (
      draft.completedSteps.includes(value)
      && Object.keys(validateOrganizationApplicationStep(draft, value)).length === 0
    )).length
    : 0
  const submitted = application?.status === 'submitted' || application?.status === 'approved'
  const progressValue = submitted ? 5 : completedCount

  function updateDraft(
    fieldId: string,
    updater: (current: OrganizationApplicationSetupDraft) => OrganizationApplicationSetupDraft,
  ) {
    if (!canEdit) return
    setNotice('')
    setError('')
    setFieldErrors((current) => {
      if (!current[fieldId]) return current
      const next = { ...current }
      delete next[fieldId]
      return next
    })
    setDraft((current) => {
      if (!current) return current
      const next = updater(current)
      return {
        ...next,
        completedSteps: current.completedSteps.filter((completed) => completed < step),
        currentStep: step,
        updatedAt: new Date().toISOString(),
      }
    })
  }

  async function persist(nextDraft: OrganizationApplicationSetupDraft, successMessage = '') {
    if (!application || !user?.csrfToken || busy) return false
    setBusy(true)
    setError('')
    if (successMessage) setNotice('')
    try {
      const body = await organizationApplicationRequest<{ application: OrganizationApplication }>(
        '/api/organization-applications/' + application.id,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': user.csrfToken,
          },
          body: JSON.stringify({ expectedRevision: application.revision, setup: nextDraft }),
        },
      )
      setApplication(body.application)
      setDraft(safeDraft(body.application))
      if (successMessage) setNotice(successMessage)
      return true
    } catch (caught) {
      const code = caught instanceof Error ? caught.message : ''
      if (code.includes('revision_conflict')) await loadApplication().catch(() => {})
      setError(applicationErrorText(code, ru))
      return false
    } finally {
      setBusy(false)
    }
  }

  function focusFirstError(errors: OrganizationApplicationSetupErrors) {
    const firstId = Object.keys(errors)[0]
    window.setTimeout(() => document.getElementById(firstId)?.focus(), 0)
  }

  async function continueStep(event: FormEvent) {
    event.preventDefault()
    if (!draft || !canEdit || step >= 4) return
    const errors = validateOrganizationApplicationStep(draft, step)
    setFieldErrors(errors)
    if (Object.keys(errors).length) {
      setError(ru ? 'Проверьте отмеченные поля.' : 'Check the marked fields.')
      focusFirstError(errors)
      return
    }
    const nextStep = step + 1
    const nextDraft = {
      ...draft,
      completedSteps: [...new Set([...draft.completedSteps, step])].sort(),
      currentStep: nextStep,
      updatedAt: new Date().toISOString(),
    }
    if (await persist(nextDraft, ru ? 'Раздел сохранён.' : 'Section saved.')) {
      setFieldErrors({})
      setStep(nextStep)
    }
  }

  async function goBack() {
    if (!draft || step === 0) return
    const previous = step - 1
    const nextDraft = { ...draft, currentStep: previous, updatedAt: new Date().toISOString() }
    if (await persist(nextDraft)) {
      setFieldErrors({})
      setStep(previous)
    }
  }

  async function goToStep(target: number) {
    if (!draft || target === step || busy) return
    const allowed = target === 4
      ? ready
      : target < step || draft.completedSteps.includes(target)
    if (!allowed) return
    const nextDraft = { ...draft, currentStep: target, updatedAt: new Date().toISOString() }
    if (await persist(nextDraft)) {
      setFieldErrors({})
      setStep(target)
    }
  }

  async function submitApplication() {
    if (!application || !draft || !user?.csrfToken || busy || !ready) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const body = await organizationApplicationRequest<{ application: OrganizationApplication }>(
        '/api/organization-applications/' + application.id + '/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': user.csrfToken,
          },
          body: JSON.stringify({ expectedRevision: application.revision }),
        },
      )
      setApplication(body.application)
      setDraft(safeDraft(body.application))
      setNotice(ru
        ? 'Заявка отправлена. До решения проверяющего редактирование закрыто.'
        : 'Application submitted. Editing is locked until review.')
    } catch (caught) {
      setError(applicationErrorText(caught instanceof Error ? caught.message : '', ru))
    } finally {
      setBusy(false)
    }
  }

  function addContactLink() {
    const id = typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `link-${Date.now()}`
    updateDraft('contacts-links', (current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        links: [...current.contacts.links, { id, kind: 'telegram', label: '', url: '' }],
      },
    }))
  }

  function updateContactLink(id: string, patch: Partial<OrganizationContactLink>) {
    updateDraft(`contact-link-${id}-url`, (current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        links: current.contacts.links.map((link) => link.id === id ? { ...link, ...patch } : link),
      },
    }))
  }

  function removeContactLink(id: string) {
    updateDraft('contacts-links', (current) => ({
      ...current,
      contacts: {
        ...current.contacts,
        links: current.contacts.links.filter((link) => link.id !== id),
      },
    }))
  }

  function toggleDecisionCategory(category: OrganizationDecisionCategory) {
    updateDraft('governance-decision-categories', (current) => {
      const selected = current.governance.decisionCategories.includes(category)
      return {
        ...current,
        governance: {
          ...current.governance,
          decisionCategories: selected
            ? current.governance.decisionCategories.filter((item) => item !== category)
            : [...current.governance.decisionCategories, category],
        },
      }
    })
  }

  if (!sessionLoading && !user) {
    return <>
      <PageHead title={ru ? 'Заявка организации' : 'Organization application'} />
      <Panel>
        <p className="muted">{ru
          ? 'Войдите под аккаунтом автора заявки.'
          : 'Sign in with the application creator account.'}</p>
        <Link
          className="btn primary"
          to={'/auth?returnTo=' + encodeURIComponent('/organizations/applications/' + applicationId + '/setup')}
        >
          {ru ? 'Войти' : 'Sign in'}
        </Link>
      </Panel>
    </>
  }

  if (loading) {
    return <div className="route-loading" role="status" aria-label={ru ? 'Загрузка' : 'Loading'}><span /></div>
  }

  if (!application || !draft) {
    return <>
      <PageHead title={ru ? 'Заявка недоступна' : 'Application unavailable'} />
      <div className="callout red">{error || (ru ? 'Заявка не найдена.' : 'Application not found.')}</div>
      <Link className="btn" to="/organizations/applications">
        {ru ? 'К моим заявкам' : 'Back to applications'}
      </Link>
    </>
  }

  const statusTone = applicationStatusTone(application.status)
  const templateCopy = TEMPLATE_COPY[draft.templateId][ru ? 'ru' : 'en']
  const committeeSize = Number(draft.governance.committeeSize) || 0
  const committeeQuorum = Math.ceil(committeeSize * (Number(draft.governance.quorumPercent) || 0) / 100)

  return <div className="organization-application-setup">
    <PageHead
      title={application.name}
      right={<div className="admin-head-actions">
        <span className={'chip ' + statusTone}>
          <span className="dot" aria-hidden />
          {applicationStatusLabel(application.status, ru)}
        </span>
        <Link className="btn small" to="/organizations/applications">
          {ru ? 'Все заявки' : 'All applications'}
        </Link>
      </div>}
    />

    <div className="organization-application-meta">
      <code>{application.slug}.novyway.com</code>
      <span>{ru ? 'ревизия ' : 'revision '}{application.revision}</span>
    </div>

    {application.reviewMessage && (
      <div className={'callout ' + (application.status === 'changes_requested' ? 'yellow' : 'cyan')}>
        <strong>{ru ? 'Комментарий проверяющего' : 'Reviewer note'}</strong>
        <span>{application.reviewMessage}</span>
      </div>
    )}
    {application.status === 'submitted' && (
      <div className="callout cyan">
        {ru
          ? 'Заявка находится в закрытой очереди проверки. Редактирование временно остановлено.'
          : 'The application is in the private review queue. Editing is temporarily locked.'}
      </div>
    )}
    {application.status === 'approved' && (
      <div className="callout green organization-approved-callout">
        <span>{ru
          ? 'Организация создана. В рабочем пространстве можно настроить роли, оформление и уведомления.'
          : 'The organization has been created. Configure roles, branding, and notifications in its workspace.'}</span>
        <div className="organization-approved-actions">
          <a className="btn primary" href={organizationWorkspaceUrl(application.slug, '/organization/setup')}>
            {ru ? 'Открыть организацию' : 'Open organization'}
          </a>
          <a className="btn" href="#notification-bot">
            {ru ? 'Настроить уведомления' : 'Configure notifications'}
          </a>
        </div>
      </div>
    )}

    {application.status === 'approved' && (
      <OrganizationTelegramBot applicationId={application.id} csrfToken={user?.csrfToken ?? ''} ru={ru} />
    )}

    {canEdit && (
      <nav className="application-wizard-progress" aria-label={ru ? 'Этапы заявки' : 'Application steps'}>
        <div
          className="application-progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={progressValue}
          aria-valuetext={`${ru ? 'Шаг' : 'Step'} ${step + 1} ${ru ? 'из' : 'of'} 5: ${labels[step]}`}
          style={{ '--application-progress': `${progressValue * 25}%` } as CSSProperties}
        >
          <span />
        </div>
        <ol>
          {labels.map((label, index) => {
            const complete = index < 4 && draft.completedSteps.includes(index)
              && Object.keys(validateOrganizationApplicationStep(draft, index)).length === 0
            const enabled = index <= step || complete || (index === 4 && ready)
            return <li key={ORGANIZATION_APPLICATION_STEPS[index]} className={index === step ? 'current' : ''}>
              <button
                type="button"
                disabled={!enabled || busy}
                aria-current={index === step ? 'step' : undefined}
                aria-label={`${index + 1}. ${label}${complete ? (ru ? ', готово' : ', complete') : ''}`}
                onClick={() => void goToStep(index)}
              >
                <span className={complete ? 'complete' : ''}>{index + 1}</span>
                <b>{label}</b>
              </button>
            </li>
          })}
        </ol>
        <p className="application-mobile-step">{step + 1}. {labels[step]}</p>
      </nav>
    )}

    {canEdit ? (
      <form className="application-wizard-stage" noValidate onSubmit={continueStep} aria-busy={busy}>
        <header className="application-stage-head">
          <span className="mono">{String(step + 1).padStart(2, '0')} / 05</span>
          <div>
            <h2 ref={stepHeadingRef} tabIndex={-1}>{labels[step]}</h2>
            <p>{descriptions[step]}</p>
            {step < 4 && <small><b className="required-mark">*</b> {ru ? 'Обязательные поля' : 'Required fields'}</small>}
          </div>
        </header>

        <div className="application-stage-body">
          {step === 0 && (
            <fieldset className="application-choice-group" aria-describedby="template-options-error">
              <legend>{ru ? 'Как будут считаться голоса?' : 'How will votes be counted?'} <b className="required-mark">*</b></legend>
              {ORGANIZATION_APPLICATION_TEMPLATES.map((template) => {
                const copy = TEMPLATE_COPY[template.id][ru ? 'ru' : 'en']
                return <label key={template.id} className={draft.templateId === template.id ? 'selected' : ''}>
                  <input
                    id={`template-${template.id}`}
                    type="radio"
                    name="application-template"
                    checked={draft.templateId === template.id}
                    onChange={() => updateDraft(
                      'template-options',
                      (current) => applyOrganizationApplicationTemplate(current, template.id),
                    )}
                  />
                  <span className="application-radio-mark" aria-hidden />
                  <span><strong>{copy.title}</strong><small>{copy.text}</small></span>
                </label>
              })}
              <FieldError id="template-options" code={fieldErrors['template-options']} ru={ru} />
            </fieldset>
          )}

          {step === 1 && (
            <div className="application-form-stack">
              <div className="application-form-grid two">
                <label className="field" htmlFor="people-member-estimate">
                  <RequiredLabel ru={ru}>{ru ? 'Ожидаемое число участников' : 'Expected participant count'}</RequiredLabel>
                  <input
                    id="people-member-estimate"
                    type="number"
                    min="1"
                    max="100000"
                    value={draft.people.memberEstimate}
                    {...fieldA11y('people-member-estimate', fieldErrors)}
                    onChange={(event) => updateDraft('people-member-estimate', (current) => ({
                      ...current,
                      people: { ...current.people, memberEstimate: event.target.value },
                    }))}
                  />
                  <small>{ru ? 'Приблизительная оценка, её можно изменить позже.' : 'An estimate that can be changed later.'}</small>
                  <FieldError id="people-member-estimate" code={fieldErrors['people-member-estimate']} ru={ru} />
                </label>
                <label className="field" htmlFor="people-invitation-mode">
                  <RequiredLabel ru={ru}>{ru ? 'Первичное приглашение' : 'Initial invitation method'}</RequiredLabel>
                  <select
                    id="people-invitation-mode"
                    value={draft.people.invitationMode}
                    onChange={(event) => updateDraft('people-invitation-mode', (current) => ({
                      ...current,
                      people: {
                        ...current.people,
                        invitationMode: event.target.value as OrganizationApplicationSetupDraft['people']['invitationMode'],
                      },
                    }))}
                  >
                    <option value="secure-link">{ru ? 'Защищённая ссылка' : 'Secure link'}</option>
                    <option value="email-review">{ru ? 'Почта с ручным подтверждением' : 'Reviewed email'}</option>
                    <option value="manual">{ru ? 'Только вручную' : 'Manual only'}</option>
                  </select>
                  <small>{ru
                    ? 'На этапе заявки приглашения никому не отправляются.'
                    : 'No invitations are sent during the application.'}</small>
                </label>
              </div>
              <label className="field" htmlFor="people-invitees">
                <RequiredLabel optional ru={ru}>
                  {ru ? 'Первые приглашённые, по одному адресу на строку' : 'Initial invitees, one email per line'}
                </RequiredLabel>
                <textarea
                  id="people-invitees"
                  rows={5}
                  maxLength={4000}
                  value={draft.people.invitees}
                  {...fieldA11y('people-invitees', fieldErrors)}
                  onChange={(event) => updateDraft('people-invitees', (current) => ({
                    ...current,
                    people: { ...current.people, invitees: event.target.value },
                  }))}
                />
                <small>{ru ? 'До 50 адресов. Список видите только вы и проверяющий.' : 'Up to 50 addresses. Only you and the reviewer can see this list.'}</small>
                <FieldError id="people-invitees" code={fieldErrors['people-invitees']} ru={ru} />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="application-form-stack">
              <fieldset className="application-fieldset">
                <legend>{ru ? 'Порог голосования' : 'Voting thresholds'}</legend>
                <div className="application-form-grid three">
                  <label className="field" htmlFor="governance-quorum">
                    <RequiredLabel ru={ru}>{ru ? 'Минимальное участие, %' : 'Minimum participation, %'}</RequiredLabel>
                    <input
                      id="governance-quorum"
                      type="number"
                      min="1"
                      max="100"
                      value={draft.governance.quorumPercent}
                      {...fieldA11y('governance-quorum', fieldErrors)}
                      onChange={(event) => updateDraft('governance-quorum', (current) => ({
                        ...current,
                        governance: { ...current.governance, quorumPercent: event.target.value },
                      }))}
                    />
                    <FieldError id="governance-quorum" code={fieldErrors['governance-quorum']} ru={ru} />
                  </label>
                  <label className="field" htmlFor="governance-approval">
                    <RequiredLabel ru={ru}>{ru ? 'Поддержка для принятия, %' : 'Support required, %'}</RequiredLabel>
                    <input
                      id="governance-approval"
                      type="number"
                      min="50"
                      max="100"
                      value={draft.governance.approvalPercent}
                      {...fieldA11y('governance-approval', fieldErrors)}
                      onChange={(event) => updateDraft('governance-approval', (current) => ({
                        ...current,
                        governance: { ...current.governance, approvalPercent: event.target.value },
                      }))}
                    />
                    <FieldError id="governance-approval" code={fieldErrors['governance-approval']} ru={ru} />
                  </label>
                  {draft.templateId === 'simple-committee' && (
                    <label className="field" htmlFor="governance-committee-size">
                      <RequiredLabel ru={ru}>{ru ? 'Мест в комитете' : 'Committee seats'}</RequiredLabel>
                      <input
                        id="governance-committee-size"
                        type="number"
                        min="1"
                        max="99"
                        value={draft.governance.committeeSize}
                        {...fieldA11y('governance-committee-size', fieldErrors)}
                        onChange={(event) => updateDraft('governance-committee-size', (current) => ({
                          ...current,
                          governance: { ...current.governance, committeeSize: event.target.value },
                        }))}
                      />
                      <FieldError id="governance-committee-size" code={fieldErrors['governance-committee-size']} ru={ru} />
                    </label>
                  )}
                </div>
                <div className="application-rule-example">
                  <strong>{ru ? 'Как это работает' : 'How this works'}</strong>
                  <p>{draft.templateId === 'simple-committee'
                    ? (ru
                      ? `В комитете ${committeeSize || '—'} мест. При пороге ${draft.governance.quorumPercent}% должны проголосовать не менее ${committeeQuorum || '—'} человек. Для принятия нужно ${draft.governance.approvalPercent}% поданных голосов.`
                      : `The committee has ${committeeSize || '—'} seats. With a ${draft.governance.quorumPercent}% threshold, at least ${committeeQuorum || '—'} members must vote. Adoption requires ${draft.governance.approvalPercent}% of votes cast.`)
                    : (ru
                      ? `Результат считается состоявшимся, если участвует не менее ${draft.governance.quorumPercent}% доступного веса. Решение принимается при поддержке не менее ${draft.governance.approvalPercent}% поданного веса.`
                      : `The result counts when at least ${draft.governance.quorumPercent}% of available weight participates. Adoption requires at least ${draft.governance.approvalPercent}% of weight cast.`)}</p>
                </div>
              </fieldset>

              <fieldset className="application-fieldset">
                <legend>{ru ? 'Какие решения будут принимать?' : 'What decisions will be made?'} <b className="required-mark">*</b></legend>
                <p className="field-help">{ru
                  ? 'Отметьте все подходящие темы. Это начальная структура, её можно изменить после одобрения.'
                  : 'Select every relevant category. This is a starting structure and can be changed after approval.'}</p>
                <div className="application-category-grid">
                  {ORGANIZATION_DECISION_CATEGORIES.map((category) => (
                    <label key={category} className={draft.governance.decisionCategories.includes(category) ? 'selected' : ''}>
                      <input
                        type="checkbox"
                        checked={draft.governance.decisionCategories.includes(category)}
                        onChange={() => toggleDecisionCategory(category)}
                      />
                      <span aria-hidden />
                      <b>{DECISION_COPY[category][ru ? 'ru' : 'en']}</b>
                    </label>
                  ))}
                </div>
                <label className="field application-custom-category" htmlFor="governance-custom-category">
                  <RequiredLabel optional ru={ru}>{ru ? 'Своя категория' : 'Custom category'}</RequiredLabel>
                  <input
                    id="governance-custom-category"
                    maxLength={60}
                    value={draft.governance.customDecisionCategory}
                    {...fieldA11y('governance-custom-category', fieldErrors)}
                    onChange={(event) => updateDraft('governance-custom-category', (current) => ({
                      ...current,
                      governance: { ...current.governance, customDecisionCategory: event.target.value },
                    }))}
                  />
                  <FieldError id="governance-custom-category" code={fieldErrors['governance-custom-category']} ru={ru} />
                </label>
                <FieldError
                  id="governance-decision-categories"
                  code={fieldErrors['governance-decision-categories']}
                  ru={ru}
                />
              </fieldset>
            </div>
          )}

          {step === 3 && (
            <div className="application-form-stack">
              <fieldset className="application-fieldset">
                <legend>{ru ? 'Название и оформление' : 'Name and appearance'}</legend>
                <div className="application-form-grid two">
                  <label className="field" htmlFor="branding-display-name">
                    <RequiredLabel ru={ru}>{ru ? 'Полное название' : 'Full name'}</RequiredLabel>
                    <input
                      id="branding-display-name"
                      maxLength={80}
                      value={draft.branding.displayName}
                      {...fieldA11y('branding-display-name', fieldErrors)}
                      onChange={(event) => updateDraft('branding-display-name', (current) => ({
                        ...current,
                        branding: { ...current.branding, displayName: event.target.value },
                      }))}
                    />
                    <small>{ru ? 'Показывается в заголовках и каталоге.' : 'Shown in headings and the directory.'}</small>
                    <FieldError id="branding-display-name" code={fieldErrors['branding-display-name']} ru={ru} />
                  </label>
                  <label className="field" htmlFor="branding-short-name">
                    <RequiredLabel ru={ru}>{ru ? 'Короткое название' : 'Short name'}</RequiredLabel>
                    <input
                      id="branding-short-name"
                      maxLength={24}
                      value={draft.branding.shortName}
                      {...fieldA11y('branding-short-name', fieldErrors)}
                      onChange={(event) => updateDraft('branding-short-name', (current) => ({
                        ...current,
                        branding: { ...current.branding, shortName: event.target.value },
                      }))}
                    />
                    <small>{ru ? 'Используется в компактном меню и на мобильных экранах.' : 'Used in compact navigation and on mobile.'}</small>
                    <FieldError id="branding-short-name" code={fieldErrors['branding-short-name']} ru={ru} />
                  </label>
                  <label className="field application-color-field" htmlFor="branding-accent-color">
                    <RequiredLabel ru={ru}>{ru ? 'Акцентный цвет' : 'Accent color'}</RequiredLabel>
                    <span className="application-color-control">
                      <input
                        id="branding-accent-color"
                        type="color"
                        value={draft.branding.accentColor}
                        {...fieldA11y('branding-accent-color', fieldErrors)}
                        onChange={(event) => updateDraft('branding-accent-color', (current) => ({
                          ...current,
                          branding: { ...current.branding, accentColor: event.target.value },
                        }))}
                      />
                      <code>{draft.branding.accentColor.toUpperCase()}</code>
                    </span>
                    <small>{ru ? 'Используется для активных элементов вашего пространства.' : 'Used for active elements in your workspace.'}</small>
                    <FieldError id="branding-accent-color" code={fieldErrors['branding-accent-color']} ru={ru} />
                  </label>
                  <label className="field" htmlFor="branding-logo-url">
                    <RequiredLabel optional ru={ru}>{ru ? 'Ссылка на логотип' : 'Logo URL'}</RequiredLabel>
                    <input
                      id="branding-logo-url"
                      type="url"
                      inputMode="url"
                      maxLength={512}
                      placeholder="https://"
                      value={draft.branding.logoUrl}
                      {...fieldA11y('branding-logo-url', fieldErrors)}
                      onChange={(event) => updateDraft('branding-logo-url', (current) => ({
                        ...current,
                        branding: { ...current.branding, logoUrl: event.target.value },
                      }))}
                    />
                    <FieldError id="branding-logo-url" code={fieldErrors['branding-logo-url']} ru={ru} />
                  </label>
                </div>
                <div className="application-identity-preview" style={{ '--organization-accent': draft.branding.accentColor } as CSSProperties}>
                  <span>{draft.branding.logoUrl ? <img src={draft.branding.logoUrl} alt="" /> : draft.branding.shortName.slice(0, 2).toUpperCase()}</span>
                  <div><strong>{draft.branding.displayName || application.name}</strong><code>{application.slug}.novyway.com</code></div>
                </div>
              </fieldset>

              <fieldset className="application-fieldset">
                <legend>{ru ? 'Сайт и публичные ссылки' : 'Website and public links'}</legend>
                <label className="field" htmlFor="contacts-project-url">
                  <RequiredLabel optional ru={ru}>{ru ? 'Сайт или страница проекта' : 'Website or project page'}</RequiredLabel>
                  <input
                    id="contacts-project-url"
                    type="url"
                    inputMode="url"
                    maxLength={512}
                    placeholder="https://"
                    value={draft.contacts.projectUrl}
                    {...fieldA11y('contacts-project-url', fieldErrors)}
                    onChange={(event) => updateDraft('contacts-project-url', (current) => ({
                      ...current,
                      contacts: { ...current.contacts, projectUrl: event.target.value },
                    }))}
                  />
                  <FieldError id="contacts-project-url" code={fieldErrors['contacts-project-url']} ru={ru} />
                </label>
                <div className="application-link-list">
                  {draft.contacts.links.map((link) => (
                    <div className="application-link-row" key={link.id}>
                      <label className="field" htmlFor={`contact-link-${link.id}-kind`}>
                        <span className="sr-only">{ru ? 'Тип ссылки' : 'Link type'}</span>
                        <select
                          id={`contact-link-${link.id}-kind`}
                          value={link.kind}
                          onChange={(event) => updateContactLink(link.id, { kind: event.target.value as OrganizationLinkKind })}
                        >
                          {ORGANIZATION_LINK_KINDS.map((kind) => (
                            <option key={kind} value={kind}>{LINK_COPY[kind][ru ? 'ru' : 'en']}</option>
                          ))}
                        </select>
                      </label>
                      {link.kind === 'other' && (
                        <label className="field" htmlFor={`contact-link-${link.id}-label`}>
                          <span className="sr-only">{ru ? 'Название ссылки' : 'Link label'}</span>
                          <input
                            id={`contact-link-${link.id}-label`}
                            maxLength={40}
                            placeholder={ru ? 'Название' : 'Label'}
                            value={link.label}
                            {...fieldA11y(`contact-link-${link.id}-label`, fieldErrors)}
                            onChange={(event) => updateContactLink(link.id, { label: event.target.value })}
                          />
                          <FieldError id={`contact-link-${link.id}-label`} code={fieldErrors[`contact-link-${link.id}-label`]} ru={ru} />
                        </label>
                      )}
                      <label className="field application-link-url" htmlFor={`contact-link-${link.id}-url`}>
                        <span className="sr-only">{ru ? 'Адрес ссылки' : 'Link URL'}</span>
                        <input
                          id={`contact-link-${link.id}-url`}
                          type="url"
                          inputMode="url"
                          maxLength={512}
                          placeholder="https://"
                          value={link.url}
                          {...fieldA11y(`contact-link-${link.id}-url`, fieldErrors)}
                          onChange={(event) => updateContactLink(link.id, { url: event.target.value })}
                        />
                        <FieldError id={`contact-link-${link.id}-url`} code={fieldErrors[`contact-link-${link.id}-url`]} ru={ru} />
                      </label>
                      <button
                        className="icon-btn application-remove-link"
                        type="button"
                        title={ru ? 'Удалить ссылку' : 'Remove link'}
                        aria-label={ru ? 'Удалить ссылку' : 'Remove link'}
                        onClick={() => removeContactLink(link.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {draft.contacts.links.length < 8 && (
                    <button className="btn small application-add-link" type="button" onClick={addContactLink}>
                      <span aria-hidden>+</span> {ru ? 'Добавить ссылку' : 'Add link'}
                    </button>
                  )}
                </div>
              </fieldset>

              <fieldset className="application-fieldset">
                <legend>{ru ? 'Физический адрес' : 'Physical address'}</legend>
                <label className="application-switch-row">
                  <input
                    type="checkbox"
                    checked={draft.address.hasPhysicalAddress}
                    onChange={(event) => updateDraft('address-enabled', (current) => ({
                      ...current,
                      address: {
                        ...current.address,
                        hasPhysicalAddress: event.target.checked,
                        publishAddress: event.target.checked ? current.address.publishAddress : false,
                      },
                    }))}
                  />
                  <span aria-hidden />
                  <b>{ru ? 'У организации есть адрес' : 'The organization has a physical address'}</b>
                </label>
                <p className="field-help">{ru
                  ? 'Для полностью онлайн-сообщества этот раздел можно не заполнять.'
                  : 'A fully online community can leave this section disabled.'}</p>
                {draft.address.hasPhysicalAddress && (
                  <div className="application-address-fields">
                    <label className="field full" htmlFor="address-line">
                      <RequiredLabel ru={ru}>{ru ? 'Улица, дом, помещение' : 'Street and building'}</RequiredLabel>
                      <input
                        id="address-line"
                        maxLength={120}
                        value={draft.address.addressLine}
                        {...fieldA11y('address-line', fieldErrors)}
                        onChange={(event) => updateDraft('address-line', (current) => ({
                          ...current,
                          address: { ...current.address, addressLine: event.target.value },
                        }))}
                      />
                      <FieldError id="address-line" code={fieldErrors['address-line']} ru={ru} />
                    </label>
                    <label className="field" htmlFor="address-city">
                      <RequiredLabel ru={ru}>{ru ? 'Город' : 'City'}</RequiredLabel>
                      <input
                        id="address-city"
                        maxLength={80}
                        value={draft.address.city}
                        {...fieldA11y('address-city', fieldErrors)}
                        onChange={(event) => updateDraft('address-city', (current) => ({
                          ...current,
                          address: { ...current.address, city: event.target.value },
                        }))}
                      />
                      <FieldError id="address-city" code={fieldErrors['address-city']} ru={ru} />
                    </label>
                    <label className="field" htmlFor="address-region">
                      <RequiredLabel optional ru={ru}>{ru ? 'Область или регион' : 'State or region'}</RequiredLabel>
                      <input
                        id="address-region"
                        maxLength={80}
                        value={draft.address.region}
                        {...fieldA11y('address-region', fieldErrors)}
                        onChange={(event) => updateDraft('address-region', (current) => ({
                          ...current,
                          address: { ...current.address, region: event.target.value },
                        }))}
                      />
                      <FieldError id="address-region" code={fieldErrors['address-region']} ru={ru} />
                    </label>
                    <label className="field" htmlFor="address-postal-code">
                      <RequiredLabel ru={ru}>{ru ? 'Почтовый индекс' : 'Postal code'}</RequiredLabel>
                      <input
                        id="address-postal-code"
                        maxLength={20}
                        value={draft.address.postalCode}
                        {...fieldA11y('address-postal-code', fieldErrors)}
                        onChange={(event) => updateDraft('address-postal-code', (current) => ({
                          ...current,
                          address: { ...current.address, postalCode: event.target.value },
                        }))}
                      />
                      <FieldError id="address-postal-code" code={fieldErrors['address-postal-code']} ru={ru} />
                    </label>
                    <label className="field" htmlFor="address-country">
                      <RequiredLabel ru={ru}>{ru ? 'Страна' : 'Country'}</RequiredLabel>
                      <input
                        id="address-country"
                        maxLength={80}
                        value={draft.address.country}
                        {...fieldA11y('address-country', fieldErrors)}
                        onChange={(event) => updateDraft('address-country', (current) => ({
                          ...current,
                          address: { ...current.address, country: event.target.value },
                        }))}
                      />
                      <FieldError id="address-country" code={fieldErrors['address-country']} ru={ru} />
                    </label>
                    <label className="application-switch-row full">
                      <input
                        type="checkbox"
                        checked={draft.address.publishAddress}
                        onChange={(event) => updateDraft('address-publish', (current) => ({
                          ...current,
                          address: { ...current.address, publishAddress: event.target.checked },
                        }))}
                      />
                      <span aria-hidden />
                      <b>{ru ? 'Показывать адрес на странице организации' : 'Show the address on the organization page'}</b>
                    </label>
                  </div>
                )}
              </fieldset>
            </div>
          )}

          {step === 4 && (
            <div className="application-review">
              <div className="application-review-identity" style={{ '--organization-accent': draft.branding.accentColor } as CSSProperties}>
                <span>{draft.branding.logoUrl
                  ? <img src={draft.branding.logoUrl} alt="" />
                  : draft.branding.shortName.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{draft.branding.displayName}</strong>
                  <code>{application.slug}.novyway.com</code>
                </div>
              </div>

              <section>
                <header><h3>{ru ? 'Модель' : 'Model'}</h3><button type="button" onClick={() => void goToStep(0)}>{ru ? 'Изменить' : 'Edit'}</button></header>
                <dl>
                  <div><dt>{ru ? 'Подсчёт' : 'Voting model'}</dt><dd>{templateCopy.title}</dd></div>
                </dl>
              </section>
              <section>
                <header><h3>{ru ? 'Участники' : 'Participants'}</h3><button type="button" onClick={() => void goToStep(1)}>{ru ? 'Изменить' : 'Edit'}</button></header>
                <dl>
                  <div><dt>{ru ? 'Ожидается' : 'Expected'}</dt><dd>{draft.people.memberEstimate}</dd></div>
                  <div><dt>{ru ? 'Приглашение' : 'Invitation'}</dt><dd>{{
                    'secure-link': ru ? 'защищённая ссылка' : 'secure link',
                    'email-review': ru ? 'почта с подтверждением' : 'reviewed email',
                    manual: ru ? 'вручную' : 'manual',
                  }[draft.people.invitationMode]}</dd></div>
                  <div><dt>{ru ? 'Первые адреса' : 'Initial emails'}</dt><dd>{draft.people.invitees.split(/\r?\n/).filter((line) => line.trim()).length || (ru ? 'не указаны' : 'not provided')}</dd></div>
                </dl>
              </section>
              <section>
                <header><h3>{ru ? 'Правила' : 'Rules'}</h3><button type="button" onClick={() => void goToStep(2)}>{ru ? 'Изменить' : 'Edit'}</button></header>
                <dl>
                  <div><dt>{ru ? 'Порог участия' : 'Participation threshold'}</dt><dd>{draft.governance.quorumPercent}%</dd></div>
                  <div><dt>{ru ? 'Для принятия' : 'Required support'}</dt><dd>{draft.governance.approvalPercent}%</dd></div>
                  {draft.templateId === 'simple-committee' && <div><dt>{ru ? 'Мест в комитете' : 'Committee seats'}</dt><dd>{draft.governance.committeeSize}</dd></div>}
                  <div className="full"><dt>{ru ? 'Темы решений' : 'Decision categories'}</dt><dd>
                    <span className="organization-review-tags">
                      {draft.governance.decisionCategories.map((category) => (
                        <span className="chip muted" key={category}>{DECISION_COPY[category][ru ? 'ru' : 'en']}</span>
                      ))}
                      {draft.governance.customDecisionCategory && <span className="chip cyan">{draft.governance.customDecisionCategory}</span>}
                    </span>
                  </dd></div>
                </dl>
              </section>
              <section>
                <header><h3>{ru ? 'Организация' : 'Organization'}</h3><button type="button" onClick={() => void goToStep(3)}>{ru ? 'Изменить' : 'Edit'}</button></header>
                <dl>
                  <div><dt>{ru ? 'Короткое название' : 'Short name'}</dt><dd>{draft.branding.shortName}</dd></div>
                  <div><dt>{ru ? 'Акцент' : 'Accent'}</dt><dd><span className="organization-review-accent" style={{ backgroundColor: draft.branding.accentColor }} aria-hidden /><code>{draft.branding.accentColor.toUpperCase()}</code></dd></div>
                  <div><dt>{ru ? 'Сайт' : 'Website'}</dt><dd>{draft.contacts.projectUrl
                    ? <a href={draft.contacts.projectUrl} target="_blank" rel="noreferrer">{draft.contacts.projectUrl}</a>
                    : (ru ? 'не указан' : 'not provided')}</dd></div>
                  <div className="full"><dt>{ru ? 'Публичные ссылки' : 'Public links'}</dt><dd>{draft.contacts.links.length
                    ? <span className="organization-review-links">{draft.contacts.links.map((link) => (
                        <a href={link.url} target="_blank" rel="noreferrer" key={link.id}>
                          {link.kind === 'other' ? link.label : LINK_COPY[link.kind][ru ? 'ru' : 'en']}
                        </a>
                      ))}</span>
                    : (ru ? 'не указаны' : 'not provided')}</dd></div>
                  <div className="full"><dt>{ru ? 'Адрес' : 'Address'}</dt><dd>{draft.address.hasPhysicalAddress
                    ? [draft.address.addressLine, draft.address.city, draft.address.region, draft.address.postalCode, draft.address.country].filter(Boolean).join(', ')
                    : (ru ? 'онлайн-организация, физический адрес не указан' : 'online organization, no physical address')}</dd></div>
                  {draft.address.hasPhysicalAddress && <div className="full"><dt>{ru ? 'Публикация адреса' : 'Address visibility'}</dt><dd>{draft.address.publishAddress
                    ? (ru ? 'Будет показан на странице организации' : 'Shown on the organization page')
                    : (ru ? 'Останется доступен только проверяющему' : 'Visible only to the reviewer')}</dd></div>}
                </dl>
              </section>

              <div className="callout yellow">
                {ru
                  ? 'После отправки поля блокируются до решения проверяющего. Токены ботов, ключи кошельков и пароли в заявку не входят.'
                  : 'Fields lock after submission. Bot tokens, wallet keys, and passwords are never included in the application.'}
              </div>
              <button
                type="button"
                className="btn primary application-submit-action"
                disabled={!ready || busy}
                onClick={() => void submitApplication()}
              >
                {busy
                  ? (ru ? 'Отправляем…' : 'Submitting…')
                  : (ru ? 'Отправить на рассмотрение' : 'Submit for review')}
              </button>
            </div>
          )}
        </div>

        {Object.keys(fieldErrors).length > 0 && (
          <div className="application-error-summary" role="alert">
            <strong>{ru ? 'Нужно исправить:' : 'Please fix:'}</strong>
            <ul>
              {Object.entries(fieldErrors).map(([id, code]) => (
                <li key={id}><button type="button" onClick={() => document.getElementById(id)?.focus()}>
                  {fieldErrorText(code, ru)}
                </button></li>
              ))}
            </ul>
          </div>
        )}
        {error && <div className="callout red" role="alert">{error}</div>}
        {notice && <div className="callout green" role="status">{notice}</div>}

        <footer className="application-stage-actions">
          <button type="button" className="btn" disabled={step === 0 || busy} onClick={() => void goBack()}>
            {ru ? 'Назад' : 'Back'}
          </button>
          <span className="application-save-state" aria-live="polite">
            {busy ? (ru ? 'Сохраняем…' : 'Saving…') : (ru ? 'Сохранится при переходе' : 'Saved when you continue')}
          </span>
          {step < 4 && <button type="submit" className="btn primary" disabled={busy}>
            {busy ? (ru ? 'Сохраняем…' : 'Saving…') : (ru ? 'Сохранить и продолжить' : 'Save and continue')}
          </button>}
        </footer>
      </form>
    ) : (
      <Panel title={ru ? 'Состояние заявки' : 'Application status'}>
        <dl className="organization-application-summary">
          <div><dt>{ru ? 'Модель' : 'Model'}</dt><dd>{templateCopy.title}</dd></div>
          <div><dt>{ru ? 'Будущий адрес' : 'Future address'}</dt><dd>{application.slug}.novyway.com</dd></div>
          <div><dt>{ru ? 'Участие / поддержка' : 'Participation / support'}</dt><dd>{draft.governance.quorumPercent}% / {draft.governance.approvalPercent}%</dd></div>
          <div><dt>{ru ? 'Тем решений' : 'Decision categories'}</dt><dd>{draft.governance.decisionCategories.length + (draft.governance.customDecisionCategory ? 1 : 0)}</dd></div>
        </dl>
      </Panel>
    )}

    <details className="application-history" open={application.status !== 'draft'}>
      <summary>{ru ? 'История заявки' : 'Application activity'} <span>{application.events.length}</span></summary>
      <ol className="organization-application-events">
        {application.events.map((event) => <li key={event.id}>
          <span className="dot" aria-hidden />
          <div>
            <strong>{event.kind}</strong>
            {event.note && <p>{event.note}</p>}
            <time dateTime={event.createdAt}>{new Date(event.createdAt).toLocaleString(ru ? 'ru-RU' : 'en-GB')}</time>
          </div>
        </li>)}
      </ol>
    </details>
  </div>
}
