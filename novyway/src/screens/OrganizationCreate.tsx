import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAccountSession } from '../auth/session'
import { useT } from '../i18n'
import type { OrganizationApplication } from '../tenancy/organizationApplication'
import { OrganizationApplicationApiError, organizationApplicationRequest } from '../tenancy/organizationApplication'
import type { OrganizationVisibility } from '../tenancy/organization'
import { PageHead, Panel } from '../ui/components'

const RESERVED_SLUGS = new Set(['www', 'api', 'admin', 'app', 'assets', 'auth', 'cdn', 'mail', 'novyway', 'status', 'static', 'support', 'operator', 'ops'])
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])$/
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slugFromName(value: string) {
  return [...value.toLowerCase()]
    .map((character) => CYRILLIC_TO_LATIN[character] ?? character)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 63)
    .replace(/-+$/g, '')
}

function hasForbiddenMultilineCharacter(value: string) {
  return [...value].some((character) => {
    const codePoint = character.codePointAt(0) ?? 0
    const forbiddenControl = codePoint <= 8
      || codePoint === 11
      || codePoint === 12
      || (codePoint >= 14 && codePoint <= 31)
      || codePoint === 127
    return forbiddenControl || character === '<' || character === '>'
  })
}

function errorText(error: unknown, ru: boolean) {
  const code = error instanceof Error ? error.message.toLowerCase() : ''
  const issuePath = error instanceof OrganizationApplicationApiError
    ? String(error.details[0]?.path?.[0] ?? '').toLowerCase()
    : ''
  if (issuePath === 'description' || code.includes('invalid_organization_description')) {
    return ru
      ? 'В описании есть недопустимый символ. Переносы строк разрешены; уберите угловые скобки или скрытые управляющие символы.'
      : 'The description contains an unsupported character. Line breaks are allowed; remove angle brackets or hidden control characters.'
  }
  if (issuePath === 'name' || code.includes('invalid_organization_name')) {
    return ru ? 'Проверьте название: нужно от 2 до 120 обычных символов.' : 'Check the name: use 2–120 regular characters.'
  }
  if (issuePath === 'slug' || code.includes('invalid_organization_slug')) {
    return ru ? 'Проверьте адрес: 2–63 латинских символа, цифры или дефисы.' : 'Check the address: use 2–63 Latin letters, digits, or hyphens.'
  }
  if (code.includes('unavailable') || code.includes('duplicate') || code.includes('unique') || code.includes('already')) {
    return ru ? 'Такой адрес уже занят или находится в другой заявке.' : 'That address is already used or reserved by another application.'
  }
  if (code.includes('reserved')) return ru ? 'Этот адрес зарезервирован для служебных страниц.' : 'That address is reserved for platform services.'
  if (code.includes('rate')) return ru ? 'Лимит заявок на сегодня исчерпан. Повторите позже.' : 'The application limit has been reached. Try again later.'
  if (code.includes('csrf') || code.includes('session') || (error instanceof OrganizationApplicationApiError && error.status === 401)) {
    return ru ? 'Сессия устарела. Обновите страницу и войдите снова.' : 'Your session expired. Refresh and sign in again.'
  }
  return ru ? 'Заявку не удалось создать. Проверьте поля и повторите.' : 'The application could not be created. Check the fields and try again.'
}

export default function OrganizationCreate() {
  const { lang } = useT()
  const { user } = useAccountSession()
  const navigate = useNavigate()
  const ru = lang === 'ru'
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<OrganizationVisibility>('members_only')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedSlug = slug.trim().toLowerCase()
  const slugValid = SLUG_PATTERN.test(normalizedSlug) && !RESERVED_SLUGS.has(normalizedSlug)
  const descriptionValid = !hasForbiddenMultilineCharacter(description)
  const valid = name.trim().length >= 2 && name.trim().length <= 120 && slugValid && description.trim().length <= 2000 && descriptionValid
  const domain = normalizedSlug ? normalizedSlug + '.novyway.com' : (ru ? 'название.novyway.com' : 'name.novyway.com')

  const visibilityOptions = useMemo(() => ([
    {
      id: 'members_only' as const,
      title: ru ? 'Только участникам' : 'Members only',
      body: ru ? 'Рабочие документы и голосования видят активные участники.' : 'Only active members see working documents and votes.',
    },
    {
      id: 'unlisted' as const,
      title: ru ? 'По ссылке' : 'Unlisted',
      body: ru ? 'Пространство не показывается в каталоге, но открывается по прямой ссылке.' : 'The workspace stays out of the directory but opens by direct link.',
    },
    {
      id: 'public' as const,
      title: ru ? 'Открытая' : 'Public',
      body: ru ? 'Опубликованные разделы видны всем посетителям.' : 'Published sections are visible to every visitor.',
    },
  ]), [ru])

  if (!user) {
    return <>
      <PageHead title={ru ? 'Заявка на организацию' : 'Organization application'} />
      <Panel className="organization-create-auth">
        <div className="callout cyan">
          {ru
            ? 'Сначала войдите. Черновик будет виден только вам и суперадминистратору платформы.'
            : 'Sign in first. The draft will be visible only to you and the platform super-administrator.'}
        </div>
        <Link className="btn primary" to="/auth?returnTo=%2Forganizations%2Fnew">{ru ? 'Войти и продолжить' : 'Sign in and continue'}</Link>
      </Panel>
    </>
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !user?.csrfToken || busy) return
    setBusy(true)
    setError(null)
    try {
      const body = await organizationApplicationRequest<{ application: OrganizationApplication }>('/api/organization-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': user.csrfToken,
        },
        body: JSON.stringify({
          slug: normalizedSlug,
          name: name.trim(),
          description: description.trim(),
          visibility,
        }),
      })
      navigate('/organizations/applications/' + body.application.id + '/setup')
    } catch (caught) {
      setError(errorText(caught, ru))
      setBusy(false)
    }
  }

  return <>
    <PageHead
      title={ru ? 'Заявка на новую организацию' : 'New organization application'}
      right={<Link className="btn small" to="/organizations/applications">{ru ? 'Мои заявки' : 'My applications'}</Link>}
    />

    <div className="callout cyan organization-application-privacy" role="note">
      <strong>{ru ? 'До одобрения ничего не публикуется.' : 'Nothing is published before approval.'}</strong>{' '}
      {ru
        ? 'У заявки нет публичного субдомена. Её содержание доступно только вашему аккаунту и защищённой очереди проверки Нового Пути.'
        : 'The application has no public subdomain. Its contents are available only to your account and the protected New Path review queue.'}
    </div>

    <form className="organization-create-grid" onSubmit={submit} noValidate>
      <Panel title={ru ? 'Основные данные' : 'Organization details'}>
        <div className="stack organization-create-fields">
          <label className="field">
            <span>{ru ? 'Название' : 'Name'}</span>
            <input
              value={name}
              minLength={2}
              maxLength={120}
              autoFocus
              autoComplete="organization"
              onChange={(event) => {
                const next = event.target.value
                setName(next)
                if (!slugEdited) setSlug(slugFromName(next))
              }}
              placeholder={ru ? 'Например, Городская мастерская' : 'For example, Civic Workshop'}
            />
          </label>

          <label className="field">
            <span>{ru ? 'Будущий адрес' : 'Future address'}</span>
            <div className={'organization-domain-input ' + (normalizedSlug && !slugValid ? 'invalid' : '')}>
              <input
                value={slug}
                minLength={2}
                maxLength={63}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="url"
                onChange={(event) => {
                  setSlugEdited(true)
                  setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                }}
                aria-invalid={Boolean(normalizedSlug && !slugValid)}
              />
              <span className="organization-domain-suffix">.novyway.com</span>
            </div>
            <small>{ru ? 'Адрес резервируется только после одобрения заявки.' : 'The address is reserved only after approval.'}</small>
            {normalizedSlug && !slugValid && <small className="field-error" role="alert">
              {RESERVED_SLUGS.has(normalizedSlug)
                ? (ru ? 'Этот адрес служебный.' : 'This address is reserved.')
                : (ru ? 'Нужно от 2 до 63 символов без дефиса в начале или конце.' : 'Use 2–63 characters with no leading or trailing hyphen.')}
            </small>}
          </label>

          <label className="field">
            <span>{ru ? 'Короткое описание' : 'Short description'}</span>
            <textarea
              rows={5}
              maxLength={2000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              aria-invalid={!descriptionValid}
              placeholder={ru ? 'Чем занимается организация и какие решения планирует принимать.' : 'What the organization does and which decisions it plans to make.'}
            />
            <small className="organization-character-count">{description.length}/2000</small>
            {!descriptionValid && <small className="field-error" role="alert">
              {ru
                ? 'Переносы строк разрешены. Уберите угловые скобки или скрытые управляющие символы.'
                : 'Line breaks are allowed. Remove angle brackets or hidden control characters.'}
            </small>}
          </label>

          <fieldset className="organization-visibility">
            <legend>{ru ? 'Видимость после одобрения' : 'Visibility after approval'}</legend>
            {visibilityOptions.map((option) => <label key={option.id} className={'check-row ' + (visibility === option.id ? 'selected' : '')}>
              <input type="radio" name="visibility" value={option.id} checked={visibility === option.id} onChange={() => setVisibility(option.id)} />
              <span><strong>{option.title}</strong><small>{option.body}</small></span>
            </label>)}
          </fieldset>

          {error && <div className="callout red" role="alert">{error}</div>}
          <button className="btn primary organization-create-submit" type="submit" disabled={!valid || busy}>
            {busy ? (ru ? 'Создаём черновик…' : 'Creating draft…') : (ru ? 'Продолжить настройку' : 'Continue setup')}
          </button>
        </div>
      </Panel>

      <Panel title={ru ? 'Как это работает' : 'How it works'} className="organization-create-preview">
        <div className="organization-domain-preview" aria-live="polite"><strong>{domain}</strong></div>
        <ol className="organization-create-checklist">
          <li>{ru ? 'Вы настраиваете модель голосования, состав, темы решений, оформление и контакты.' : 'You configure the voting model, membership, decision categories, branding, and contacts.'}</li>
          <li>{ru ? 'Суперадминистратор проверяет заявку и либо одобряет её, либо возвращает с замечаниями.' : 'The platform super-administrator approves the application or returns it with comments.'}</li>
          <li>{ru ? 'После одобрения создаются отдельные записи PostgreSQL, роль владельца и проверенный субдомен.' : 'Approval creates isolated PostgreSQL records, the owner role, and a verified subdomain.'}</li>
          <li>{ru ? 'После одобрения владелец отдельно подключает Aptos и Telegram-бота; приватные ключи и токены в заявку не входят.' : 'After approval, the owner connects Aptos and a Telegram bot separately; private keys and tokens never enter the application.'}</li>
        </ol>
        <div className="callout yellow organization-onchain-note">
          {ru
            ? 'Ограничения видимости относятся к сайту. Опубликованные позже доказательства Aptos остаются публичными.'
            : 'Visibility restrictions apply to the website. Aptos proofs published later remain public.'}
        </div>
      </Panel>
    </form>
  </>
}
