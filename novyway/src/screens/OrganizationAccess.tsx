import { useEffect, useMemo, useState } from 'react'
import { useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import {
  saveAccessDelegation,
  saveAccessGrant,
  saveAccessRole,
  saveResourceAccess,
  saveVerifiedExam,
  saveVerifiedQualification,
  useAccessConsole,
  type AccessCondition,
  type AccessConsole,
  type AccessRole,
  type ResourceAudiencePolicy,
  type ResourceScope,
  type ResourceType,
} from '../tenancy/access'
import { PageHead, Panel } from '../ui/components'

const blankRole: AccessRole = {
  key: '',
  name: { ru: '', en: '' },
  description: { ru: '', en: '' },
  enabled: true,
  autoRule: { mode: 'all', conditions: [] },
  capabilities: [],
}

type ResourceDraft = {
  type: ResourceType
  id: string
  policies: Partial<Record<ResourceScope, ResourceAudiencePolicy>>
}

type ResourcePreset = 'public' | 'roles_all' | 'private_public_result' | 'roles_vote_public' | 'public_process_private_subject' | 'public_index_private_content'

const RESOURCE_SCOPES: Record<ResourceType, ResourceScope[]> = {
  election: ['discover', 'subject', 'participate', 'results', 'ballots'],
  document: ['discover', 'content'],
  exam: ['discover', 'content', 'participate', 'results'],
  workspace: ['discover', 'content'],
}

const RESOURCE_SCOPE_COPY: Record<ResourceScope, { ru: string; en: string; ruHint: string; enHint: string }> = {
  discover: { ru: 'Видно в списках', en: 'Visible in lists', ruHint: 'Ресурс появляется в реестрах, графе и поиске.', enHint: 'The resource appears in registries, graph, and search.' },
  subject: { ru: 'Виден предмет решения', en: 'Subject is visible', ruHint: 'Можно прочитать, о чём голосуют, предлагаемый текст и обоснование.', enHint: 'Users can read the subject, proposed text, and rationale.' },
  participate: { ru: 'Можно участвовать', en: 'Participation allowed', ruHint: 'Можно подписать и отправить голос или поддержать запуск.', enHint: 'Users can sign and submit a vote or support launch.' },
  results: { ru: 'Виден итог', en: 'Results are visible', ruHint: 'Показываются итоговое решение, поддержка и кворум.', enHint: 'The final decision, support, and quorum are shown.' },
  ballots: { ru: 'Видно распределение голосов', en: 'Ballot distribution is visible', ruHint: 'Показываются доли «за», «против», «воздержание» и участие.', enHint: 'Yes, no, abstain distribution and participation are shown.' },
  content: { ru: 'Можно читать содержимое', en: 'Content is readable', ruHint: 'Открывается полный текст документа или материала.', enHint: 'The full document or resource content can be opened.' },
}
const BASE_ACCESS_ROLES = [
  { key: 'governance_admin', ru: 'Администратор управления', en: 'Governance administrator' },
  { key: 'qualification_manager', ru: 'Администратор квалификаций', en: 'Qualification manager' },
  { key: 'content_editor', ru: 'Редактор документов', en: 'Content editor' },
  { key: 'member', ru: 'Участник', en: 'Member' },
  { key: 'auditor', ru: 'Аудитор', en: 'Auditor' },
]

function audiencePolicy(audience: ResourceAudiencePolicy['audience'] = 'public', requiredRoles: string[] = []): ResourceAudiencePolicy {
  return { audience, requiredRoles: audience === 'roles' ? requiredRoles : [] }
}

function policyCovers(visibleTo: ResourceAudiencePolicy, actionFor: ResourceAudiencePolicy) {
  if (visibleTo.audience === 'public') return true
  if (visibleTo.audience === 'member') return actionFor.audience !== 'public'
  if (actionFor.audience !== 'roles') return false
  return actionFor.requiredRoles.every((role) => visibleTo.requiredRoles.includes(role))
}
function policiesFor(type: ResourceType, audience: ResourceAudiencePolicy['audience'] = 'public', requiredRoles: string[] = []) {
  return Object.fromEntries(RESOURCE_SCOPES[type].map((scope) => [scope, audiencePolicy(audience, requiredRoles)])) as Partial<Record<ResourceScope, ResourceAudiencePolicy>>
}

function makeResourceDraft(type: ResourceType = 'election'): ResourceDraft {
  return { type, id: '', policies: policiesFor(type) }
}
function nextCondition(kind: AccessCondition['kind']): AccessCondition {
  if (kind === 'tenure_days_at_least') return { kind, days: 30 }
  if (kind === 'verified_exam_passed') return { kind, examId: '', minScoreBps: 7000 }
  return { kind, categoryId: '0', level: 1 }
}

export default function OrganizationAccess() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const { user } = useAccountSession()
  const allowed = Boolean(user?.isSuperAdmin || user?.isAdmin)
  const consoleState = useAccessConsole(allowed)
  const [selectedKey, setSelectedKey] = useState('')
  const [draft, setDraft] = useState<AccessRole>(blankRole)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'green' | 'red'>('green')
  const [busy, setBusy] = useState(false)
  const [grantUserId, setGrantUserId] = useState('')
  const [resource, setResource] = useState<ResourceDraft>(() => makeResourceDraft('election'))
  const [evidenceMemberId, setEvidenceMemberId] = useState('')
  const [examEvidence, setExamEvidence] = useState({ examId: '', scoreBps: 7000 })
  const [qualificationEvidence, setQualificationEvidence] = useState({ categoryId: '0', level: 1, eligible: true })

  const selected = useMemo(
    () => consoleState.data?.roles.find((role) => role.key === selectedKey) ?? null,
    [consoleState.data, selectedKey],
  )
  useEffect(() => {
    if (selected) setDraft(structuredClone(selected))
  }, [selected])
  useEffect(() => {
    if (!selectedKey && consoleState.data?.roles[0]) setSelectedKey(consoleState.data.roles[0].key)
  }, [consoleState.data, selectedKey])

  const roleOptions = useMemo(() => {
    const options = new Map(BASE_ACCESS_ROLES.map((role) => [role.key, { key: role.key, label: ru ? role.ru : role.en }]))
    for (const role of consoleState.data?.roles ?? []) {
      if (role.enabled) options.set(role.key, { key: role.key, label: ru ? role.name.ru : role.name.en })
    }
    return [...options.values()]
  }, [consoleState.data?.roles, ru])
  const resourceScopes = RESOURCE_SCOPES[resource.type]
  const roleScopesWithoutRoles = resourceScopes.filter((scope) => {
    const policy = resource.policies[scope]
    return policy?.audience === 'roles' && policy.requiredRoles.length === 0
  })
  const subjectPolicy = resource.policies.subject
  const participationPolicy = resource.policies.participate
  const participationWithoutSubject = Boolean(
    resource.type === 'election'
    && subjectPolicy
    && participationPolicy
    && !policyCovers(subjectPolicy, participationPolicy),
  )

  if (!allowed) return <div className="callout red">{ru ? 'У вас нет права управлять доступом организации.' : 'You cannot manage organization access.'}</div>

  function updateCondition(index: number, next: AccessCondition) {
    setDraft((current) => ({
      ...current,
      autoRule: {
        mode: current.autoRule?.mode ?? 'all',
        conditions: (current.autoRule?.conditions ?? []).map((condition, position) => position === index ? next : condition),
      },
    }))
  }

  async function run(action: () => Promise<unknown>, success: string) {
    if (!user?.csrfToken) return
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setMessageTone('green')
      setMessage(success)
      await consoleState.refresh()
    } catch (reason) {
      setMessageTone('red')
      setMessage(reason instanceof Error ? reason.message : 'request_failed')
    } finally {
      setBusy(false)
    }
  }

  function loadStoredResource(item: AccessConsole['resources'][number]) {
    const type = item.resource_type
    const discover = item.scope_policies?.discover ?? audiencePolicy(item.audience as ResourceAudiencePolicy['audience'], item.required_roles)
    const policies = Object.fromEntries(RESOURCE_SCOPES[type].map((scope) => {
      const policy = item.scope_policies?.[scope] ?? discover
      return [scope, audiencePolicy(policy.audience, [...policy.requiredRoles])]
    })) as Partial<Record<ResourceScope, ResourceAudiencePolicy>>
    setResource({ type, id: item.resource_id, policies })
    setMessage(null)
  }

  function setResourceType(type: ResourceType) {
    setResource(makeResourceDraft(type))
    setMessage(null)
  }

  function setResourceId(id: string) {
    const stored = consoleState.data?.resources.find((item) => item.resource_type === resource.type && item.resource_id === id)
    if (stored) loadStoredResource(stored)
    else setResource((current) => ({ ...current, id }))
  }

  function setScopeAudience(scope: ResourceScope, audience: ResourceAudiencePolicy['audience']) {
    setResource((current) => ({
      ...current,
      policies: {
        ...current.policies,
        [scope]: audiencePolicy(audience, audience === 'roles' ? (current.policies[scope]?.requiredRoles ?? []) : []),
      },
    }))
  }

  function toggleScopeRole(scope: ResourceScope, role: string) {
    setResource((current) => {
      const policy = current.policies[scope] ?? audiencePolicy('roles')
      const selectedRoles = policy.requiredRoles.includes(role)
        ? policy.requiredRoles.filter((item) => item !== role)
        : [...policy.requiredRoles, role]
      return { ...current, policies: { ...current.policies, [scope]: audiencePolicy('roles', selectedRoles) } }
    })
  }

  function applyResourcePreset(preset: ResourcePreset) {
    const selectedRoles = [...new Set(Object.values(resource.policies).flatMap((policy) => policy?.requiredRoles ?? []))]
    const roles = selectedRoles.length ? selectedRoles : ['governance_admin']
    let policies = policiesFor(resource.type)
    if (preset === 'roles_all') policies = policiesFor(resource.type, 'roles', roles)
    if (preset === 'private_public_result' && resource.type === 'election') {
      policies = policiesFor(resource.type)
      policies.subject = audiencePolicy('roles', roles)
      policies.participate = audiencePolicy('roles', roles)
      policies.ballots = audiencePolicy('roles', roles)
    }
    if (preset === 'roles_vote_public' && resource.type === 'election') {
      policies = policiesFor(resource.type)
      policies.participate = audiencePolicy('roles', roles)
    }
    if (preset === 'public_process_private_subject' && resource.type === 'election') {
      policies = policiesFor(resource.type)
      policies.subject = audiencePolicy('roles', roles)
      policies.participate = audiencePolicy('roles', roles)
    }
    if (preset === 'public_index_private_content' && resource.type !== 'election') {
      policies = policiesFor(resource.type)
      policies.content = audiencePolicy('roles', roles)
    }
    setResource((current) => ({ ...current, policies }))
    setMessage(null)
  }
  const conditions = draft.autoRule?.conditions ?? []
  return <>
    <PageHead
      title={ru ? 'Уровни доступа' : 'Access roles'}
      sub={ru ? 'Роли организации, автоматические условия, ручные назначения и права администраторов.' : 'Organization roles, automatic conditions, manual grants, and delegated administrators.'}
      right={<span className="chip mono">v{consoleState.data?.revision ?? '—'}</span>}
    />
    <div className="callout cyan access-scope-note">
      {ru
        ? 'Эти правила управляют видимостью и действиями на сайте. Записи Aptos остаются публичными и проверяемыми.'
        : 'These rules control website visibility and actions. Aptos records remain public and verifiable.'}
    </div>
    {consoleState.error && <div className="callout red">{consoleState.error}</div>}
    {message && <div className={`callout ${messageTone}`} role="status">{message}</div>}
    <div className="access-console">
      <aside className="access-role-rail" aria-label={ru ? 'Роли' : 'Roles'}>
        <button className="btn primary" onClick={() => { setSelectedKey(''); setDraft(structuredClone(blankRole)) }}>
          + {ru ? 'Новая роль' : 'New role'}
        </button>
        <div className="access-owner-role">
          <strong>{ru ? 'Владелец' : 'Owner'}</strong>
          <span>{ru ? 'системная роль, не изменяется' : 'locked system role'}</span>
        </div>
        {consoleState.data?.roles.map((role) => (
          <button key={role.key} className={`access-role-item ${selectedKey === role.key ? 'active' : ''}`} onClick={() => setSelectedKey(role.key)}>
            <strong>{ru ? role.name.ru : role.name.en}</strong>
            <span>{role.key} · {role.enabled ? (ru ? 'активна' : 'active') : (ru ? 'выключена' : 'disabled')}</span>
          </button>
        ))}
      </aside>
      <main className="access-role-editor">
        <Panel title={ru ? 'Описание роли' : 'Role details'}>
          <div className="grid c2">
            <label className="field"><span>{ru ? 'Ключ' : 'Key'}</span><input value={draft.key} disabled={Boolean(selected)} onChange={(event) => setDraft({ ...draft, key: event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} /></label>
            <label className="check-row"><input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} /><span>{ru ? 'Роль включена' : 'Role enabled'}</span></label>
            <label className="field"><span>Название RU</span><input value={draft.name.ru} onChange={(event) => setDraft({ ...draft, name: { ...draft.name, ru: event.target.value } })} /></label>
            <label className="field"><span>Name EN</span><input value={draft.name.en} onChange={(event) => setDraft({ ...draft, name: { ...draft.name, en: event.target.value } })} /></label>
            <label className="field"><span>Описание RU</span><input value={draft.description.ru} onChange={(event) => setDraft({ ...draft, description: { ...draft.description, ru: event.target.value } })} /></label>
            <label className="field"><span>Description EN</span><input value={draft.description.en} onChange={(event) => setDraft({ ...draft, description: { ...draft.description, en: event.target.value } })} /></label>
          </div>
        </Panel>
        <Panel title={ru ? 'Автоматическое назначение' : 'Automatic assignment'}>
          <div className="row between access-rule-heading">
            <select value={draft.autoRule?.mode ?? 'all'} onChange={(event) => setDraft({ ...draft, autoRule: { mode: event.target.value as 'all' | 'any', conditions } })}>
              <option value="all">{ru ? 'Все условия' : 'All conditions'}</option>
              <option value="any">{ru ? 'Любое условие' : 'Any condition'}</option>
            </select>
            <select defaultValue="" onChange={(event) => {
              if (!event.target.value) return
              setDraft({ ...draft, autoRule: { mode: draft.autoRule?.mode ?? 'all', conditions: [...conditions, nextCondition(event.target.value as AccessCondition['kind'])] } })
              event.target.value = ''
            }}>
              <option value="">{ru ? '+ Добавить условие' : '+ Add condition'}</option>
              <option value="tenure_days_at_least">{ru ? 'Время в проекте' : 'Membership tenure'}</option>
              <option value="verified_exam_passed">{ru ? 'Подтвержденный экзамен' : 'Verified exam'}</option>
              <option value="qualification_level_at_least">{ru ? 'Уровень квалификации' : 'Qualification level'}</option>
            </select>
          </div>
          <div className="stack">
            {conditions.map((condition, index) => (
              <div className="access-condition-row" key={`${condition.kind}-${index}`}>
                {condition.kind === 'tenure_days_at_least' && <>
                  <span>{ru ? 'В проекте не менее' : 'Member for at least'}</span>
                  <input type="number" min="0" max="36500" value={condition.days} onChange={(event) => updateCondition(index, { ...condition, days: Number(event.target.value) })} />
                  <span>{ru ? 'дней' : 'days'}</span>
                </>}
                {condition.kind === 'verified_exam_passed' && <>
                  <span>{ru ? 'Сдан подтвержденный экзамен' : 'Verified exam passed'}</span>
                  <input value={condition.examId} placeholder="exam-id" onChange={(event) => updateCondition(index, { ...condition, examId: event.target.value })} />
                  <input type="number" min="0" max="10000" value={condition.minScoreBps} aria-label={ru ? 'Минимальный балл' : 'Minimum score'} onChange={(event) => updateCondition(index, { ...condition, minScoreBps: Number(event.target.value) })} />
                </>}
                {condition.kind === 'qualification_level_at_least' && <>
                  <span>{ru ? 'Квалификация категории' : 'Qualification category'}</span>
                  <input value={condition.categoryId} onChange={(event) => updateCondition(index, { ...condition, categoryId: event.target.value })} />
                  <select value={condition.level} onChange={(event) => updateCondition(index, { ...condition, level: Number(event.target.value) })}>{[0, 1, 2, 3].map((level) => <option value={level} key={level}>L{level}+</option>)}</select>
                </>}
                <button className="btn icon small" title={ru ? 'Удалить условие' : 'Remove condition'} onClick={() => setDraft({ ...draft, autoRule: { mode: draft.autoRule?.mode ?? 'all', conditions: conditions.filter((_, position) => position !== index) } })}>×</button>
              </div>
            ))}
            {conditions.length === 0 && <div className="empty">{ru ? 'Автоматических условий нет. Роль назначается вручную.' : 'No automatic conditions. This role is assigned manually.'}</div>}
          </div>
        </Panel>
        <div className="access-editor-actions">
          <button className="btn primary" disabled={busy || !draft.key || !draft.name.ru || !draft.name.en} onClick={() => void run(() => saveAccessRole(draft, user!.csrfToken!), ru ? 'Политика роли опубликована.' : 'Role policy published.')}>
            {busy ? (ru ? 'Сохранение…' : 'Saving…') : (ru ? `Опубликовать политику v${(consoleState.data?.revision ?? 0) + 1}` : `Publish policy v${(consoleState.data?.revision ?? 0) + 1}`)}
          </button>
        </div>
      </main>
      <aside className="access-impact">
        <Panel title={ru ? 'Ручное назначение' : 'Manual grant'}>
          <label className="field"><span>{ru ? 'Участник' : 'Member'}</span><select value={grantUserId} onChange={(event) => setGrantUserId(event.target.value)}><option value="">{ru ? 'Выберите участника' : 'Select a member'}</option>{(consoleState.data?.members ?? []).map((member) => <option key={member.user_id} value={member.user_id}>{member.label} · {member.role}</option>)}</select></label>
          <button className="btn small" disabled={busy || !draft.key || !grantUserId} onClick={() => void run(() => saveAccessGrant({ key: draft.key, userId: grantUserId }, user!.csrfToken!), ru ? 'Роль назначена.' : 'Role granted.')}>{ru ? 'Назначить роль' : 'Grant role'}</button>
          <div className="muted access-count">{consoleState.data?.grants.filter((grant) => grant.role_key === draft.key).length ?? 0} {ru ? 'ручных назначений' : 'manual grants'}</div>
        </Panel>
        {consoleState.data?.actorRole === 'owner' && <Panel title={ru ? 'Подтвержденные основания' : 'Verified evidence'}>
          <div className="stack access-evidence-editor">
            <label className="field"><span>{ru ? 'Участник' : 'Member'}</span><select value={evidenceMemberId} onChange={(event) => setEvidenceMemberId(event.target.value)}><option value="">{ru ? 'Выберите участника' : 'Select a member'}</option>{(consoleState.data?.members ?? []).map((member) => <option key={member.user_id} value={member.user_id}>{member.label}</option>)}</select></label>
            <div className="access-evidence-block"><strong>{ru ? 'Экзамен' : 'Exam'}</strong><input value={examEvidence.examId} placeholder="exam-id" onChange={(event) => setExamEvidence({ ...examEvidence, examId: event.target.value })} /><label className="field"><span>{ru ? 'Результат, %' : 'Score, %'}</span><input type="number" min="0" max="100" value={examEvidence.scoreBps / 100} onChange={(event) => setExamEvidence({ ...examEvidence, scoreBps: Math.round(Number(event.target.value) * 100) })} /></label><button className="btn small" disabled={busy || !evidenceMemberId || !examEvidence.examId} onClick={() => void run(() => saveVerifiedExam({ userId: evidenceMemberId, ...examEvidence }, user!.csrfToken!), ru ? 'Результат экзамена подтвержден.' : 'Exam result verified.')}>{ru ? 'Подтвердить экзамен' : 'Verify exam'}</button></div>
            <div className="access-evidence-block"><strong>{ru ? 'Квалификация' : 'Qualification'}</strong><input value={qualificationEvidence.categoryId} placeholder={ru ? 'ID категории' : 'Category ID'} onChange={(event) => setQualificationEvidence({ ...qualificationEvidence, categoryId: event.target.value })} /><select value={qualificationEvidence.level} onChange={(event) => setQualificationEvidence({ ...qualificationEvidence, level: Number(event.target.value) })}>{[0, 1, 2, 3].map((level) => <option key={level} value={level}>L{level}</option>)}</select><button className="btn small" disabled={busy || !evidenceMemberId} onClick={() => void run(() => saveVerifiedQualification({ userId: evidenceMemberId, ...qualificationEvidence }, user!.csrfToken!), ru ? 'Квалификация подтверждена.' : 'Qualification verified.')}>{ru ? 'Подтвердить уровень' : 'Verify level'}</button></div>
            <small className="muted">{ru ? 'Самостоятельно отправленные результаты не дают доступ. Здесь фиксируются только проверенные организацией основания.' : 'Self-reported results never grant access. Only organization-verified evidence is recorded here.'}</small>
          </div>
        </Panel>}
        {consoleState.data?.actorRole === 'owner' && <Panel title={ru ? 'Делегирование администратору' : 'Delegate to administrator'}>
          {(consoleState.data.administrators ?? []).filter((admin) => admin.role === 'governance_admin').map((admin) => {
            const current = consoleState.data!.delegations.find((item) => item.role_key === draft.key && item.administrator_user_id === admin.user_id)
            return <div className="access-admin-row" key={admin.user_id}>
              <strong>{admin.label}</strong>
              <label><input type="checkbox" checked={current?.can_grant ?? false} onChange={(event) => void run(() => saveAccessDelegation({ key: draft.key, administratorUserId: admin.user_id, canGrant: event.target.checked, canEditRules: current?.can_edit_rules ?? false }, user!.csrfToken!), ru ? 'Право обновлено.' : 'Permission updated.')} /> {ru ? 'назначать' : 'grant'}</label>
              <label><input type="checkbox" checked={current?.can_edit_rules ?? false} onChange={(event) => void run(() => saveAccessDelegation({ key: draft.key, administratorUserId: admin.user_id, canGrant: current?.can_grant ?? false, canEditRules: event.target.checked }, user!.csrfToken!), ru ? 'Право обновлено.' : 'Permission updated.')} /> {ru ? 'менять автоматику' : 'edit rules'}</label>
            </div>
          })}
          {consoleState.data.administrators.filter((admin) => admin.role === 'governance_admin').length === 0 && <div className="empty">{ru ? 'Администраторов пока нет.' : 'No administrators yet.'}</div>}
        </Panel>}
      </aside>
    </div>
    {consoleState.data?.actorRole === 'owner' && <section className="access-resource-section" aria-label={ru ? 'Доступ к ресурсам' : 'Resource access'}>
      <Panel title={ru ? 'Доступ к голосованиям, решениям и документам' : 'Election, decision, and document access'}>
        <div className="access-resource-editor">
          <div className="access-resource-toolbar">
            <label className="field">
              <span>{ru ? 'Тип ресурса' : 'Resource type'}</span>
              <select value={resource.type} onChange={(event) => setResourceType(event.target.value as ResourceType)}>
                <option value="election">{ru ? 'Голосование и решение' : 'Election and decision'}</option>
                <option value="document">{ru ? 'Документ' : 'Document'}</option>
                <option value="exam">{ru ? 'Экзамен' : 'Exam'}</option>
                <option value="workspace">{ru ? 'Пространство' : 'Workspace'}</option>
              </select>
            </label>
            <label className="field">
              <span>{ru ? 'Идентификатор' : 'Identifier'}</span>
              <input value={resource.id} placeholder={ru ? 'Например, e-107 или document-id' : 'For example, e-107 or document-id'} onChange={(event) => setResourceId(event.target.value)} />
            </label>
          </div>

          {(consoleState.data.resources ?? []).length > 0 && <div className="access-resource-saved" aria-label={ru ? 'Настроенные ресурсы' : 'Configured resources'}>
            <span className="muted">{ru ? 'Уже настроены:' : 'Configured:'}</span>
            {(consoleState.data.resources ?? []).map((item) => <button type="button" className={`chip ${resource.type === item.resource_type && resource.id === item.resource_id ? 'active' : ''}`} key={`${item.resource_type}:${item.resource_id}`} onClick={() => loadStoredResource(item)}>{item.resource_type} · {item.resource_id}</button>)}
          </div>}

          <div className="access-resource-presets">
            <span className="muted">{ru ? 'Быстрый сценарий' : 'Quick preset'}</span>
            <div className="access-preset-buttons">
              <button type="button" className="btn small" onClick={() => applyResourcePreset('public')}>{ru ? 'Полностью публично' : 'Fully public'}</button>
              <button type="button" className="btn small" onClick={() => applyResourcePreset('roles_all')}>{ru ? 'Только выбранным ролям' : 'Selected roles only'}</button>
              {resource.type === 'election' && <>
                <button type="button" className="btn small" onClick={() => applyResourcePreset('private_public_result')}>{ru ? 'Скрытый предмет и голоса, публичный итог' : 'Hidden subject and ballots, public result'}</button>
                <button type="button" className="btn small" onClick={() => applyResourcePreset('roles_vote_public')}>{ru ? 'Всё видно, голосуют выбранные' : 'Public view, selected roles vote'}</button>
                <button type="button" className="btn small" onClick={() => applyResourcePreset('public_process_private_subject')}>{ru ? 'Процесс виден, предмет скрыт' : 'Visible process, hidden subject'}</button>
              </>}
              {resource.type !== 'election' && <button type="button" className="btn small" onClick={() => applyResourcePreset('public_index_private_content')}>{ru ? 'В списке всем, текст выбранным' : 'Public listing, restricted content'}</button>}
            </div>
          </div>

          <div className="access-policy-matrix">
            {resourceScopes.map((scope) => {
              const copy = RESOURCE_SCOPE_COPY[scope]
              const policy = resource.policies[scope] ?? audiencePolicy()
              return <section className="access-policy-row" key={scope}>
                <div className="access-policy-copy">
                  <strong>{ru ? copy.ru : copy.en}</strong>
                  <small>{ru ? copy.ruHint : copy.enHint}</small>
                </div>
                <label className="field access-policy-audience">
                  <span>{ru ? 'Кому' : 'Audience'}</span>
                  <select value={policy.audience} onChange={(event) => setScopeAudience(scope, event.target.value as ResourceAudiencePolicy['audience'])}>
                    <option value="public">{ru ? 'Всем посетителям' : 'Everyone'}</option>
                    <option value="member">{ru ? 'Участникам организации' : 'Organization members'}</option>
                    <option value="roles">{ru ? 'Выбранным ролям' : 'Selected roles'}</option>
                  </select>
                </label>
                {policy.audience === 'roles' && <fieldset className="access-policy-roles">
                  <legend>{ru ? 'Достаточно любой выбранной роли' : 'Any selected role is sufficient'}</legend>
                  <div className="access-role-checks">
                    {roleOptions.map((role) => <label className="check-row" key={`${scope}:${role.key}`}><input type="checkbox" checked={policy.requiredRoles.includes(role.key)} onChange={() => toggleScopeRole(scope, role.key)} /><span>{role.label}</span><code>{role.key}</code></label>)}
                  </div>
                </fieldset>}
              </section>
            })}
          </div>

          {roleScopesWithoutRoles.length > 0 && <div className="callout red">{ru ? 'Для каждой области «Выбранным ролям» отметьте хотя бы одну роль.' : 'Select at least one role for every “Selected roles” scope.'}</div>}
          {participationWithoutSubject && <div className="callout red">{ru ? 'Нельзя разрешить участие людям, которым не виден предмет решения. Расширьте видимость предмета или сузьте участие.' : 'Participation cannot be broader than subject visibility. Broaden subject access or narrow participation.'}</div>}
          <div className="callout cyan access-chain-warning">
            {ru
              ? 'Ограничения действуют только в интерфейсе и API Novyway. Транзакции, адреса, события и другие данные, записанные в Aptos, остаются публичными. Настройки «Участникам» и «Ролям» не делают данные в сети приватными.'
              : 'Restrictions apply only to the Novyway interface and API. Transactions, addresses, events, and other Aptos data remain public. Member and role settings do not make on-chain data private.'}
          </div>
          <div className="access-resource-footer">
            <small className="muted">{ru
              ? 'Принятый текст настраивается как отдельный документ: так закрытое голосование может выпустить публичный документ, не раскрывая рабочий процесс на сайте.'
              : 'Configure the accepted text as a separate document, so a private election can publish a public output without exposing its working process on the site.'}</small>
            <button className="btn primary" disabled={busy || !resource.id.trim() || roleScopesWithoutRoles.length > 0 || participationWithoutSubject} onClick={() => void run(() => {
              const discover = resource.policies.discover ?? audiencePolicy()
              return saveResourceAccess({ type: resource.type, id: resource.id.trim(), audience: discover.audience, requiredRoles: discover.requiredRoles, policies: resource.policies }, user!.csrfToken!)
            }, ru ? 'Политика доступа опубликована.' : 'Access policy published.')}>{busy ? (ru ? 'Сохранение…' : 'Saving…') : (ru ? 'Сохранить правила доступа' : 'Save access rules')}</button>
          </div>
        </div>
      </Panel>
    </section>}
  </>
}
