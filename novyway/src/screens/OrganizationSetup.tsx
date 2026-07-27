import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { hasWebsiteGovernanceAccess, useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import {
  applyOrganizationTemplate,
  loadOrganizationSetupDraft,
  ORGANIZATION_SETUP_STEPS,
  ORGANIZATION_TEMPLATES,
  organizationSetupIsReady,
  saveOrganizationSetupDraft,
  validateOrganizationSetupStep,
  type OrganizationSetupDraft,
  type OrganizationTemplateId,
  type SetupErrorCode,
  type SetupErrors,
} from '../tenancy/setupDraft'
import { normalizeAccentColor, normalizeLogoUrl } from '../tenancy/organization'
import { useOrganization } from '../tenancy/OrganizationContext'
import { PageHead } from '../ui/components'

const TEMPLATE_COPY: Record<OrganizationTemplateId, {
  ru: { title: string; description: string }
  en: { title: string; description: string }
}> = {
  'expert-weighted': {
    ru: { title: 'Экспертно-взвешенная', description: 'Вес решения зависит от подтверждённой квалификации участника.' },
    en: { title: 'Expert-weighted', description: 'Decision weight follows each member’s verified qualification.' },
  },
  'equal-member': {
    ru: { title: 'Равные участники', description: 'Один подтверждённый участник получает один голос.' },
    en: { title: 'Equal member', description: 'Every verified member receives one vote.' },
  },
  'simple-committee': {
    ru: { title: 'Простой комитет', description: 'Решения принимает ограниченный состав с явным кворумом.' },
    en: { title: 'Simple committee', description: 'A bounded committee decides with an explicit quorum.' },
  },
}

const STEP_COPY = {
  ru: ['Шаблон', 'Люди', 'Правила', 'Бренд и адрес', 'Первое решение', 'Публикация'],
  en: ['Template', 'People', 'Governance', 'Brand and address', 'First decision', 'Publish'],
} as const

function FieldError({ field, errors, ru }: { field: string; errors: SetupErrors; ru: boolean }) {
  const code = errors[field]
  if (!code) return null
  const messages: Record<SetupErrorCode, { ru: string; en: string }> = {
    required: { ru: 'Заполните это поле.', en: 'Complete this field.' },
    invalid: { ru: 'Проверьте формат и допустимые символы.', en: 'Check the format and allowed characters.' },
    invalid_email: { ru: 'Проверьте адреса электронной почты.', en: 'Check the email addresses.' },
    too_many: { ru: 'Можно добавить не более 50 адресов.', en: 'Add no more than 50 addresses.' },
    too_short: { ru: 'Добавьте больше конкретики.', en: 'Add more specific detail.' },
    out_of_range: { ru: 'Значение выходит за допустимый диапазон.', en: 'The value is outside the allowed range.' },
    incomplete: { ru: 'Завершите предыдущие шаги.', en: 'Complete the previous steps.' },
  }
  return <span id={`${field}-error`} className="field-error" role="alert">{ru ? messages[code].ru : messages[code].en}</span>
}

function fieldState(field: string, errors: SetupErrors) {
  return {
    'aria-invalid': Boolean(errors[field]),
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
  } as const
}

export default function OrganizationSetup() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const { user, loading: sessionLoading } = useAccountSession()
  const organization = useOrganization()
  const [draft, setDraft] = useState<OrganizationSetupDraft>(() => (
    loadOrganizationSetupDraft(organization.orgSlug, organization.branding)
  ))
  const [errors, setErrors] = useState<SetupErrors>({})
  const [storageState, setStorageState] = useState<'saved' | 'error'>('saved')
  const [actionNotice, setActionNotice] = useState('')
  const stepLabels = ru ? STEP_COPY.ru : STEP_COPY.en
  const currentStep = Math.min(ORGANIZATION_SETUP_STEPS.length - 1, Math.max(0, draft.currentStep))
  const canEdit = !sessionLoading && hasWebsiteGovernanceAccess(user)
  const readyToPublish = organizationSetupIsReady(draft)
  const currentTemplate = useMemo(
    () => ORGANIZATION_TEMPLATES.find((template) => template.id === draft.templateId) ?? ORGANIZATION_TEMPLATES[0],
    [draft.templateId],
  )
  const templateCopy = TEMPLATE_COPY[currentTemplate.id][ru ? 'ru' : 'en']
  const accentColor = normalizeAccentColor(draft.branding.accentColor) ?? '#E64232'
  const logoUrl = normalizeLogoUrl(draft.branding.logoUrl)
  const firstIncompleteStep = [0, 1, 2, 3, 4].find((step) => !draft.completedSteps.includes(step)) ?? 5

  useEffect(() => {
    setStorageState(saveOrganizationSetupDraft(draft) ? 'saved' : 'error')
  }, [draft])

  function updateAtStep(step: number, updater: (current: OrganizationSetupDraft) => OrganizationSetupDraft) {
    setActionNotice('')
    setErrors({})
    setDraft((current) => ({
      ...updater(current),
      completedSteps: current.completedSteps.filter((completedStep) => completedStep < step),
      updatedAt: new Date().toISOString(),
    }))
  }

  function moveToStep(step: number) {
    if (step < 0 || step > firstIncompleteStep || step >= ORGANIZATION_SETUP_STEPS.length) return
    setErrors({})
    setActionNotice('')
    setDraft((current) => ({ ...current, currentStep: step, updatedAt: new Date().toISOString() }))
  }

  function continueSetup(event: FormEvent) {
    event.preventDefault()
    if (!canEdit || currentStep >= 5) return
    const nextErrors = validateOrganizationSetupStep(draft, currentStep)
    setErrors(nextErrors)
    const firstError = Object.keys(nextErrors)[0]
    if (firstError) {
      requestAnimationFrame(() => document.getElementById(firstError)?.focus())
      return
    }

    setDraft((current) => ({
      ...current,
      completedSteps: [...new Set([...current.completedSteps, currentStep])].sort(),
      currentStep: Math.min(5, currentStep + 1),
      updatedAt: new Date().toISOString(),
    }))
    setActionNotice('')
  }

  function showPlaceholder(kind: 'invitations' | 'policy' | 'address' | 'decision' | 'publication') {
    if (!canEdit) return
    const notices = ru ? {
      invitations: 'Приглашения подготовлены только в черновике. Отправка на сервер не выполнялась.',
      policy: 'Параметры сохранены локально. Политика управления не опубликована.',
      address: 'Адрес сохранён в черновике. Серверная проверка не выполнялась.',
      decision: 'Первое решение сохранено в черновике. Голосование не создано.',
      publication: 'Запрос подготовлен локально. Организация остаётся неопубликованной до серверной проверки и отдельного подтверждения администратора.',
    } : {
      invitations: 'Invitations are prepared in the draft only. Nothing was sent to the server.',
      policy: 'Parameters are stored locally. No governance policy was published.',
      address: 'The address is stored in the draft. No server verification was performed.',
      decision: 'The first decision is stored in the draft. No election was created.',
      publication: 'The request is prepared locally. The organization remains unpublished until server verification and a separate administrator confirmation.',
    }
    setActionNotice(notices[kind])
  }

  const verificationMessage = (() => {
    if (organization.verificationStatus === 'loading') return ru ? 'Проверяем конфигурацию организации…' : 'Checking organization configuration…'
    if (organization.verificationStatus === 'verified') {
      return ru
        ? `Конфигурация подтверждена сервером. Статус организации: ${organization.publicationStatus === 'published' ? 'опубликована' : 'не опубликована'}.`
        : `Configuration is server-verified. Organization status: ${organization.publicationStatus === 'published' ? 'published' : 'unpublished'}.`
    }
    if (organization.verificationStatus === 'unverified') return ru ? 'Сервер вернул неподтверждённую конфигурацию. Её брендинг и статус не применены.' : 'The server returned an unverified configuration. Its branding and status were not applied.'
    if (organization.verificationStatus === 'invalid') return ru ? 'Ответ конфигурации не прошёл проверку формата. Используется безопасный базовый профиль.' : 'The configuration response failed validation. A safe baseline profile is in use.'
    return ru ? 'Подтверждённая серверная конфигурация пока недоступна. Черновик можно продолжить на этом устройстве.' : 'A verified server configuration is not available yet. You can continue the draft on this device.'
  })()

  return (
    <div className="organization-setup">
      <PageHead
        title={ru ? 'Настройка организации' : 'Organization setup'}
        sub={ru ? `Контекст: ${organization.orgSlug}` : `Context: ${organization.orgSlug}`}
        right={<span className="chip warn organization-draft-chip"><span className="dot" aria-hidden />{ru ? 'Черновик · не опубликован' : 'Draft · unpublished'}</span>}
      />

      <div className={`callout organization-verification ${organization.verificationStatus === 'verified' ? 'lime' : organization.verificationStatus === 'invalid' ? 'red' : 'yellow'}`} role="status">
        <span>{verificationMessage}</span>
        {organization.verificationStatus !== 'loading' && organization.verificationStatus !== 'verified' && (
          <button type="button" className="btn small" onClick={organization.refresh}>{ru ? 'Проверить снова' : 'Check again'}</button>
        )}
      </div>

      {!sessionLoading && !user && (
        <div className="callout red organization-access-note">
          <span>{ru ? 'Изменять черновик может только администратор организации.' : 'Only an organization administrator can edit this draft.'}</span>
          <Link className="btn primary" to="/auth?returnTo=%2Forganization%2Fsetup">{ru ? 'Войти' : 'Sign in'}</Link>
        </div>
      )}
      {!sessionLoading && user && !hasWebsiteGovernanceAccess(user) && (
        <div className="callout yellow organization-access-note" role="note">
          {ru ? 'Доступ только для просмотра: текущая сессия не имеет роли администратора.' : 'View only: the current session does not have an administrator role.'}
        </div>
      )}
      {canEdit && (
        <div className="callout organization-access-note" role="note">
          {ru ? 'Изменения автоматически сохраняются как локальный черновик. Сервер и Aptos не изменяются.' : 'Changes are automatically stored as a local draft. The server and Aptos are not changed.'}
        </div>
      )}
      {storageState === 'error' && <div className="callout red" role="alert">{ru ? 'Не удалось сохранить черновик в этом браузере.' : 'The draft could not be saved in this browser.'}</div>}

      <nav className="organization-stepper" aria-label={ru ? 'Шаги настройки организации' : 'Organization setup steps'}>
        <div className="organization-progress-copy">
          <span>{ru ? `Шаг ${currentStep + 1} из 6` : `Step ${currentStep + 1} of 6`}</span>
          <span>{storageState === 'saved' ? (ru ? 'Черновик сохранён' : 'Draft saved') : (ru ? 'Не сохранено' : 'Not saved')}</span>
        </div>
        <div className="organization-progress" role="progressbar" aria-valuemin={1} aria-valuemax={6} aria-valuenow={currentStep + 1} aria-label={ru ? 'Ход настройки' : 'Setup progress'}>
          <span style={{ width: `${((currentStep + 1) / 6) * 100}%` }} />
        </div>
        <ol>
          {stepLabels.map((label, index) => {
            const complete = draft.completedSteps.includes(index)
            const locked = index > firstIncompleteStep
            return (
              <li key={ORGANIZATION_SETUP_STEPS[index]}>
                <button
                  type="button"
                  className={`${index === currentStep ? 'current' : ''} ${complete ? 'complete' : ''}`}
                  aria-current={index === currentStep ? 'step' : undefined}
                  aria-label={`${index + 1}. ${label}${complete ? (ru ? ', завершено' : ', complete') : ''}`}
                  disabled={locked}
                  onClick={() => moveToStep(index)}
                >
                  <span className="organization-step-number" aria-hidden>{index + 1}</span>
                  <span>{label}</span>
                  <small>{complete ? (ru ? 'Готово' : 'Complete') : index === currentStep ? (ru ? 'Сейчас' : 'Current') : ''}</small>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <form className="organization-setup-stage" noValidate onSubmit={continueSetup}>
        <header className="organization-stage-head">
          <span className="mono">{String(currentStep + 1).padStart(2, '0')} / 06</span>
          <div>
            <h2 id="organization-stage-title">{stepLabels[currentStep]}</h2>
            <p>{[
              ru ? 'Выберите основу правил. Значения можно уточнить на следующих шагах.' : 'Choose the starting rule set. You can refine its values in later steps.',
              ru ? 'Определите начальный состав и безопасный способ приглашения.' : 'Define the initial membership and invitation method.',
              ru ? 'Зафиксируйте кворум и порог принятия решений.' : 'Set quorum and approval thresholds.',
              ru ? 'Укажите только проверяемые поля бренда и юридического адреса.' : 'Enter only validated branding and legal address fields.',
              ru ? 'Подготовьте первое конкретное решение для организации.' : 'Prepare the organization’s first concrete decision.',
              ru ? 'Проверьте черновик. Публикация остаётся отдельным серверным действием.' : 'Review the draft. Publication remains a separate server action.',
            ][currentStep]}</p>
          </div>
        </header>

        <div className="organization-stage-body" aria-labelledby="organization-stage-title">
          {currentStep === 0 && (
            <div id="template-options" className="organization-template-options" role="radiogroup" aria-label={ru ? 'Шаблон организации' : 'Organization template'} tabIndex={errors['template-options'] ? -1 : undefined}>
              {ORGANIZATION_TEMPLATES.map((template) => {
                const copy = TEMPLATE_COPY[template.id][ru ? 'ru' : 'en']
                return (
                  <label key={template.id} className={draft.templateId === template.id ? 'selected' : ''}>
                    <input
                      type="radio"
                      name="organization-template"
                      value={template.id}
                      checked={draft.templateId === template.id}
                      disabled={!canEdit}
                      onChange={() => updateAtStep(0, (current) => applyOrganizationTemplate(current, template.id))}
                    />
                    <span className="organization-template-copy">
                      <strong>{copy.title}</strong>
                      <span>{copy.description}</span>
                      <code>{template.id}</code>
                    </span>
                  </label>
                )
              })}
              <FieldError field="template-options" errors={errors} ru={ru} />
            </div>
          )}

          {currentStep === 1 && (
            <div className="organization-form-stack">
              <div className="organization-form-grid two">
                <label className="field" htmlFor="people-member-estimate">
                  <span>{ru ? 'Ожидаемое число участников' : 'Expected member count'}</span>
                  <input
                    id="people-member-estimate"
                    type="number"
                    min="1"
                    max="100000"
                    inputMode="numeric"
                    value={draft.people.memberEstimate}
                    disabled={!canEdit}
                    {...fieldState('people-member-estimate', errors)}
                    onChange={(event) => updateAtStep(1, (current) => ({ ...current, people: { ...current.people, memberEstimate: event.target.value } }))}
                  />
                  <FieldError field="people-member-estimate" errors={errors} ru={ru} />
                </label>
                <label className="field" htmlFor="people-invitation-mode">
                  <span>{ru ? 'Способ присоединения' : 'Joining method'}</span>
                  <select
                    id="people-invitation-mode"
                    value={draft.people.invitationMode}
                    disabled={!canEdit}
                    onChange={(event) => updateAtStep(1, (current) => ({
                      ...current,
                      people: { ...current.people, invitationMode: event.target.value as OrganizationSetupDraft['people']['invitationMode'] },
                    }))}
                  >
                    <option value="secure-link">{ru ? 'Защищённая ссылка' : 'Secure link'}</option>
                    <option value="email-review">{ru ? 'Email с проверкой администратора' : 'Email with administrator review'}</option>
                    <option value="manual">{ru ? 'Ручное добавление' : 'Manual enrollment'}</option>
                  </select>
                </label>
              </div>
              <label className="field" htmlFor="people-invitees">
                <span>{ru ? 'Email для первого приглашения · до 50, по одному в строке' : 'Initial invitation emails · up to 50, one per line'}</span>
                <textarea
                  id="people-invitees"
                  rows={5}
                  value={draft.people.invitees}
                  disabled={!canEdit}
                  {...fieldState('people-invitees', errors)}
                  onChange={(event) => updateAtStep(1, (current) => ({ ...current, people: { ...current.people, invitees: event.target.value } }))}
                />
                <FieldError field="people-invitees" errors={errors} ru={ru} />
              </label>
              <button type="button" className="btn organization-placeholder-action" disabled={!canEdit} onClick={() => showPlaceholder('invitations')}>
                {ru ? 'Подготовить приглашения' : 'Prepare invitations'}
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="organization-form-stack">
              <div className="organization-template-summary">
                <span>{ru ? 'Модель' : 'Model'}</span>
                <strong>{templateCopy.title}</strong>
                <code>{currentTemplate.id}</code>
              </div>
              <div className="organization-form-grid three">
                <label className="field" htmlFor="governance-quorum">
                  <span>{ru ? 'Кворум, %' : 'Quorum, %'}</span>
                  <input id="governance-quorum" type="number" min="1" max="100" inputMode="numeric" value={draft.governance.quorumPercent} disabled={!canEdit} {...fieldState('governance-quorum', errors)} onChange={(event) => updateAtStep(2, (current) => ({ ...current, governance: { ...current.governance, quorumPercent: event.target.value } }))} />
                  <FieldError field="governance-quorum" errors={errors} ru={ru} />
                </label>
                <label className="field" htmlFor="governance-approval">
                  <span>{ru ? 'Порог принятия, %' : 'Approval threshold, %'}</span>
                  <input id="governance-approval" type="number" min="50" max="100" inputMode="numeric" value={draft.governance.approvalPercent} disabled={!canEdit} {...fieldState('governance-approval', errors)} onChange={(event) => updateAtStep(2, (current) => ({ ...current, governance: { ...current.governance, approvalPercent: event.target.value } }))} />
                  <FieldError field="governance-approval" errors={errors} ru={ru} />
                </label>
                {draft.templateId === 'simple-committee' && (
                  <label className="field" htmlFor="governance-committee-size">
                    <span>{ru ? 'Размер комитета' : 'Committee size'}</span>
                    <input id="governance-committee-size" type="number" min="3" max="99" inputMode="numeric" value={draft.governance.committeeSize} disabled={!canEdit} {...fieldState('governance-committee-size', errors)} onChange={(event) => updateAtStep(2, (current) => ({ ...current, governance: { ...current.governance, committeeSize: event.target.value } }))} />
                    <FieldError field="governance-committee-size" errors={errors} ru={ru} />
                  </label>
                )}
              </div>
              <button type="button" className="btn organization-placeholder-action" disabled={!canEdit} onClick={() => showPlaceholder('policy')}>
                {ru ? 'Подготовить политику' : 'Prepare policy'}
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="organization-form-stack">
              <section className="organization-fields-section" aria-labelledby="organization-brand-heading">
                <h3 id="organization-brand-heading">{ru ? 'Бренд' : 'Brand'}</h3>
                <div className="organization-form-grid two">
                  <label className="field" htmlFor="branding-display-name"><span>{ru ? 'Название' : 'Display name'}</span><input id="branding-display-name" type="text" maxLength={80} value={draft.branding.displayName} disabled={!canEdit} {...fieldState('branding-display-name', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, branding: { ...current.branding, displayName: event.target.value } }))} /><FieldError field="branding-display-name" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="branding-short-name"><span>{ru ? 'Короткое название' : 'Short name'}</span><input id="branding-short-name" type="text" maxLength={24} value={draft.branding.shortName} disabled={!canEdit} {...fieldState('branding-short-name', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, branding: { ...current.branding, shortName: event.target.value } }))} /><FieldError field="branding-short-name" errors={errors} ru={ru} /></label>
                  <label className="field organization-color-field" htmlFor="branding-accent-color"><span>{ru ? 'Акцентный цвет' : 'Accent color'}</span><input id="branding-accent-color" type="color" value={accentColor} disabled={!canEdit} {...fieldState('branding-accent-color', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, branding: { ...current.branding, accentColor: event.target.value } }))} /><FieldError field="branding-accent-color" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="branding-logo-url"><span>{ru ? 'HTTPS или локальный URL логотипа' : 'HTTPS or local logo URL'}</span><input id="branding-logo-url" type="url" maxLength={512} value={draft.branding.logoUrl} disabled={!canEdit} {...fieldState('branding-logo-url', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, branding: { ...current.branding, logoUrl: event.target.value } }))} /><FieldError field="branding-logo-url" errors={errors} ru={ru} /></label>
                </div>
                <div className="organization-brand-preview" style={{ borderLeftColor: accentColor }}>
                  {typeof logoUrl === 'string' && <img src={logoUrl} alt="" width="48" height="48" />}
                  <span><strong>{draft.branding.displayName || (ru ? 'Название организации' : 'Organization name')}</strong><small>{draft.branding.shortName || organization.orgSlug}</small></span>
                </div>
              </section>
              <section className="organization-fields-section" aria-labelledby="organization-address-heading">
                <h3 id="organization-address-heading">{ru ? 'Юридический адрес' : 'Legal address'}</h3>
                <div className="organization-form-grid two">
                  <label className="field organization-field-wide" htmlFor="address-line"><span>{ru ? 'Улица и номер' : 'Street and number'}</span><input id="address-line" type="text" maxLength={120} autoComplete="street-address" value={draft.address.addressLine} disabled={!canEdit} {...fieldState('address-line', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, address: { ...current.address, addressLine: event.target.value } }))} /><FieldError field="address-line" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="address-city"><span>{ru ? 'Город' : 'City'}</span><input id="address-city" type="text" maxLength={80} autoComplete="address-level2" value={draft.address.city} disabled={!canEdit} {...fieldState('address-city', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, address: { ...current.address, city: event.target.value } }))} /><FieldError field="address-city" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="address-region"><span>{ru ? 'Регион · необязательно' : 'Region · optional'}</span><input id="address-region" type="text" maxLength={80} autoComplete="address-level1" value={draft.address.region} disabled={!canEdit} {...fieldState('address-region', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, address: { ...current.address, region: event.target.value } }))} /><FieldError field="address-region" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="address-postal-code"><span>{ru ? 'Почтовый индекс' : 'Postal code'}</span><input id="address-postal-code" type="text" maxLength={20} autoComplete="postal-code" value={draft.address.postalCode} disabled={!canEdit} {...fieldState('address-postal-code', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, address: { ...current.address, postalCode: event.target.value } }))} /><FieldError field="address-postal-code" errors={errors} ru={ru} /></label>
                  <label className="field" htmlFor="address-country"><span>{ru ? 'Страна' : 'Country'}</span><input id="address-country" type="text" maxLength={80} autoComplete="country-name" value={draft.address.country} disabled={!canEdit} {...fieldState('address-country', errors)} onChange={(event) => updateAtStep(3, (current) => ({ ...current, address: { ...current.address, country: event.target.value } }))} /><FieldError field="address-country" errors={errors} ru={ru} /></label>
                </div>
              </section>
              <button type="button" className="btn organization-placeholder-action" disabled={!canEdit} onClick={() => showPlaceholder('address')}>{ru ? 'Проверить адрес' : 'Verify address'}</button>
            </div>
          )}

          {currentStep === 4 && (
            <div className="organization-form-stack">
              <div className="organization-form-grid two">
                <label className="field" htmlFor="decision-kind"><span>{ru ? 'Тип решения' : 'Decision type'}</span><select id="decision-kind" value={draft.firstDecision.kind} disabled={!canEdit} onChange={(event) => updateAtStep(4, (current) => ({ ...current, firstDecision: { ...current.firstDecision, kind: event.target.value as OrganizationSetupDraft['firstDecision']['kind'] } }))}><option value="resolution">{ru ? 'Резолюция' : 'Resolution'}</option><option value="policy">{ru ? 'Политика' : 'Policy'}</option><option value="election">{ru ? 'Выбор' : 'Election'}</option></select></label>
                <label className="field" htmlFor="decision-closes"><span>{ru ? 'Срок, дней' : 'Closes in days'}</span><input id="decision-closes" type="number" min="1" max="90" inputMode="numeric" value={draft.firstDecision.closesInDays} disabled={!canEdit} {...fieldState('decision-closes', errors)} onChange={(event) => updateAtStep(4, (current) => ({ ...current, firstDecision: { ...current.firstDecision, closesInDays: event.target.value } }))} /><FieldError field="decision-closes" errors={errors} ru={ru} /></label>
              </div>
              <label className="field" htmlFor="decision-title"><span>{ru ? 'Заголовок решения' : 'Decision title'}</span><input id="decision-title" type="text" maxLength={120} value={draft.firstDecision.title} disabled={!canEdit} {...fieldState('decision-title', errors)} onChange={(event) => updateAtStep(4, (current) => ({ ...current, firstDecision: { ...current.firstDecision, title: event.target.value } }))} /><FieldError field="decision-title" errors={errors} ru={ru} /></label>
              <label className="field" htmlFor="decision-summary"><span>{ru ? 'Суть и ожидаемый результат' : 'Purpose and expected outcome'}</span><textarea id="decision-summary" rows={7} maxLength={1000} value={draft.firstDecision.summary} disabled={!canEdit} {...fieldState('decision-summary', errors)} onChange={(event) => updateAtStep(4, (current) => ({ ...current, firstDecision: { ...current.firstDecision, summary: event.target.value } }))} /><FieldError field="decision-summary" errors={errors} ru={ru} /></label>
              <button type="button" className="btn organization-placeholder-action" disabled={!canEdit} onClick={() => showPlaceholder('decision')}>{ru ? 'Подготовить решение' : 'Prepare decision'}</button>
            </div>
          )}

          {currentStep === 5 && (
            <div className="organization-publish-review">
              <div className="organization-unpublished-state" role="status">
                <span className="chip warn"><span className="dot" aria-hidden />{ru ? 'Не опубликовано' : 'Unpublished'}</span>
                <div><strong>{draft.branding.displayName}</strong><span className="mono">https://{organization.orgSlug}.novyway.com</span></div>
              </div>
              <dl>
                <div><dt>{ru ? 'Шаблон' : 'Template'}</dt><dd>{templateCopy.title}</dd></div>
                <div><dt>{ru ? 'Участники' : 'Members'}</dt><dd>{draft.people.memberEstimate}</dd></div>
                <div><dt>{ru ? 'Кворум / принятие' : 'Quorum / approval'}</dt><dd>{draft.governance.quorumPercent}% / {draft.governance.approvalPercent}%</dd></div>
                <div><dt>{ru ? 'Адрес' : 'Address'}</dt><dd>{[draft.address.addressLine, draft.address.city, draft.address.country].filter(Boolean).join(', ') || '—'}</dd></div>
                <div><dt>{ru ? 'Первое решение' : 'First decision'}</dt><dd>{draft.firstDecision.title || '—'}</dd></div>
                <div><dt>{ru ? 'Конфигурация' : 'Configuration'}</dt><dd>{organization.verificationStatus === 'verified' ? (ru ? 'Подтверждена' : 'Verified') : (ru ? 'Не подтверждена' : 'Not verified')}</dd></div>
              </dl>
              <ul className="organization-readiness-list" aria-label={ru ? 'Готовность к публикации' : 'Publication readiness'}>
                {[0, 1, 2, 3, 4].map((step) => {
                  const complete = draft.completedSteps.includes(step) && Object.keys(validateOrganizationSetupStep(draft, step)).length === 0
                  return <li key={ORGANIZATION_SETUP_STEPS[step]} className={complete ? 'ready' : 'missing'}><span aria-hidden>{complete ? '✓' : '–'}</span><span>{stepLabels[step]}</span><strong>{complete ? (ru ? 'готово' : 'ready') : (ru ? 'не завершено' : 'incomplete')}</strong></li>
                })}
              </ul>
              {errors['setup-incomplete'] && <FieldError field="setup-incomplete" errors={errors} ru={ru} />}
              <div className="callout yellow" id="organization-publication-note">
                {ru ? 'Кнопка ниже готовит только локальный placeholder. Настоящая публикация должна повторно проверить администратора, конфигурацию и серверное состояние.' : 'The button below prepares a local placeholder only. Real publication must re-check the administrator, configuration, and server state.'}
              </div>
              <button type="button" className="btn primary organization-publish-action" disabled={!canEdit || !readyToPublish} aria-describedby="organization-publication-note" onClick={() => showPlaceholder('publication')}>{ru ? 'Подготовить запрос публикации' : 'Prepare publication request'}</button>
            </div>
          )}
        </div>

        <div className="organization-action-notice" aria-live="polite">{actionNotice}</div>
        <footer className="organization-stage-actions">
          <button type="button" className="btn" disabled={currentStep === 0} onClick={() => moveToStep(currentStep - 1)}>{ru ? 'Назад' : 'Back'}</button>
          <Link className="btn ghost" to="/">{ru ? 'Сохранить и выйти' : 'Save and exit'}</Link>
          {currentStep < 5 && <button type="submit" className="btn primary" disabled={!canEdit}>{ru ? 'Продолжить' : 'Continue'}</button>}
        </footer>
      </form>
    </div>
  )
}
