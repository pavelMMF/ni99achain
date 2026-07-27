import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { organizationApplicationRequest } from '../../tenancy/organizationApplication'

type TelegramIntegration = {
  organizationId: string
  provider: 'telegram'
  botId: string
  botUsername: string
  defaultChatId: string | null
  enabled: boolean
  verifiedAt: string
  updatedAt: string
}

type Props = {
  applicationId: string
  csrfToken: string
  ru: boolean
}

function botErrorText(code: string, ru: boolean) {
  if (code.includes('telegram_bot_request_failed') || code.includes('telegram_bot_identity_invalid')) {
    return ru ? 'Telegram не подтвердил этот токен. Проверьте его в BotFather.' : 'Telegram did not verify this token. Check it in BotFather.'
  }
  if (code.includes('telegram_service_unavailable')) {
    return ru ? 'Telegram сейчас не отвечает. Попробуйте ещё раз позднее.' : 'Telegram is currently unavailable. Try again later.'
  }
  if (code.includes('notification_chat_not_configured')) {
    return ru ? 'Для теста укажите идентификатор чата и сохраните настройки.' : 'Add a chat ID and save before sending a test.'
  }
  return ru ? 'Не удалось сохранить настройку бота.' : 'The bot configuration could not be saved.'
}

export function OrganizationTelegramBot({ applicationId, csrfToken, ru }: Props) {
  const [integration, setIntegration] = useState<TelegramIntegration | null>(null)
  const [token, setToken] = useState('')
  const [chatId, setChatId] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const endpoint = `/api/organization-applications/${encodeURIComponent(applicationId)}/notification-bot`
  const load = useCallback(async (signal?: AbortSignal) => {
    const body = await organizationApplicationRequest<{ integration: TelegramIntegration | null }>(endpoint, { signal })
    setIntegration(body.integration)
    setChatId(body.integration?.defaultChatId ?? '')
  }, [endpoint])

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    load(controller.signal)
      .catch((caught) => {
        if (caught instanceof DOMException && caught.name === 'AbortError') return
        setError(botErrorText(caught instanceof Error ? caught.message : '', ru))
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [load, ru])

  async function connect(event: FormEvent) {
    event.preventDefault()
    if (!csrfToken || !token.trim() || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const body = await organizationApplicationRequest<{ integration: TelegramIntegration }>(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({
          token: token.trim(),
          defaultChatId: chatId.trim() || null,
        }),
      })
      setIntegration(body.integration)
      setChatId(body.integration.defaultChatId ?? '')
      setToken('')
      setNotice(ru ? 'Бот проверен и подключён.' : 'The bot has been verified and connected.')
    } catch (caught) {
      setError(botErrorText(caught instanceof Error ? caught.message : '', ru))
    } finally {
      setBusy(false)
    }
  }

  async function sendTest() {
    if (!csrfToken || busy) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await organizationApplicationRequest<{ sent: true }>(`${endpoint}/test`, {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
      })
      setNotice(ru ? 'Тихое тестовое сообщение отправлено.' : 'A silent test message was sent.')
    } catch (caught) {
      setError(botErrorText(caught instanceof Error ? caught.message : '', ru))
    } finally {
      setBusy(false)
    }
  }

  async function disconnect() {
    if (!csrfToken || busy) return
    const confirmed = window.confirm(ru
      ? 'Отключить Telegram-бота от организации?'
      : 'Disconnect the Telegram bot from this organization?')
    if (!confirmed) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await organizationApplicationRequest<{ removed: true }>(endpoint, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken },
      })
      setIntegration(null)
      setToken('')
      setChatId('')
      setNotice(ru ? 'Бот отключён, сохранённый токен удалён.' : 'The bot was disconnected and its stored token removed.')
    } catch (caught) {
      setError(botErrorText(caught instanceof Error ? caught.message : '', ru))
    } finally {
      setBusy(false)
    }
  }

  return <section className="organization-bot-setup" id="notification-bot" aria-labelledby="notification-bot-title">
    <header>
      <div>
        <span className="mono">{ru ? 'ПОСЛЕ ОДОБРЕНИЯ' : 'AFTER APPROVAL'}</span>
        <h2 id="notification-bot-title">{ru ? 'Telegram-уведомления' : 'Telegram notifications'}</h2>
        <p>{ru
          ? 'Создайте отдельного бота организации в BotFather, затем подключите его здесь. Telegram не позволяет сайту создавать ботов вместо владельца.'
          : 'Create a dedicated organization bot in BotFather, then connect it here. Telegram does not allow a website to create a bot on an owner’s behalf.'}</p>
      </div>
      {integration && <span className="chip live"><span className="dot" aria-hidden />@{integration.botUsername}</span>}
    </header>

    <ol className="organization-bot-steps">
      <li><span>1</span><p>{ru ? 'Откройте BotFather и выполните команду /newbot.' : 'Open BotFather and run /newbot.'}</p></li>
      <li><span>2</span><p>{ru ? 'Скопируйте выданный токен. Не отправляйте его людям и не добавляйте в Git.' : 'Copy the issued token. Never share it or commit it to Git.'}</p></li>
      <li><span>3</span><p>{ru ? 'Если нужен общий чат, добавьте бота туда и укажите идентификатор чата.' : 'For a shared chat, add the bot to it and enter the chat ID.'}</p></li>
    </ol>

    <a className="btn small organization-botfather-link" href="https://t.me/BotFather" target="_blank" rel="noreferrer">
      {ru ? 'Открыть BotFather' : 'Open BotFather'}
    </a>

    {loading ? <div className="route-loading compact" role="status"><span /></div> : <form onSubmit={connect}>
      <div className="application-form-grid two">
        <label className="field" htmlFor="organization-bot-token">
          <span>{integration ? (ru ? 'Новый токен для замены' : 'New replacement token') : (ru ? 'Токен бота' : 'Bot token')} <b className="required-mark">*</b></span>
          <input
            id="organization-bot-token"
            type="password"
            autoComplete="off"
            spellCheck={false}
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="123456789:AA..."
          />
          <small>{ru ? 'После сохранения токен больше не показывается.' : 'The token is never displayed again after saving.'}</small>
        </label>
        <label className="field" htmlFor="organization-bot-chat">
          <span>{ru ? 'Идентификатор чата · необязательно' : 'Chat ID · optional'}</span>
          <input
            id="organization-bot-chat"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={chatId}
            onChange={(event) => setChatId(event.target.value)}
            placeholder="-1001234567890"
          />
          <small>{ru ? 'Нужен для общей рассылки и тестового сообщения.' : 'Required for broadcasts and the test message.'}</small>
        </label>
      </div>
      <div className="organization-bot-actions">
        <button className="btn primary" type="submit" disabled={busy || !token.trim()}>
          {integration ? (ru ? 'Проверить и заменить' : 'Verify and replace') : (ru ? 'Проверить и подключить' : 'Verify and connect')}
        </button>
        {integration && <button className="btn" type="button" disabled={busy || !integration.defaultChatId} onClick={() => void sendTest()}>
          {ru ? 'Отправить тест' : 'Send test'}
        </button>}
        {integration && <button className="btn danger" type="button" disabled={busy} onClick={() => void disconnect()}>
          {ru ? 'Отключить' : 'Disconnect'}
        </button>}
      </div>
    </form>}

    {error && <div className="callout red" role="alert">{error}</div>}
    {notice && <div className="callout green" role="status">{notice}</div>}
    <p className="organization-bot-security">{ru
      ? 'Токен шифруется отдельным серверным ключом. Проверяющий заявки и другие организации его не видят.'
      : 'The token is encrypted with a dedicated server key. Application reviewers and other organizations cannot see it.'}</p>
  </section>
}
