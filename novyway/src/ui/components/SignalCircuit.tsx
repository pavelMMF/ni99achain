import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccountSession } from '../../auth/session'
import { useT } from '../../i18n'
import { sound } from '../../sound/engine'

type GameProfile = {
  score: number
  answeredCount: number
  correctCount: number
  currentStreak: number
  bestStreak: number
}

type ChallengeOrigin = 'documented' | 'life' | 'fiction'
type OriginFilter = ChallengeOrigin
type DifficultyFilter = 'all' | 1 | 2 | 3

type LogicChallenge = {
  id: string
  contextLabel: string
  scenario: string | null
  sourceType: string
  prompt: string
  difficulty: 1 | 2 | 3
  origin: ChallengeOrigin
  segments: string[]
}

type Feedback = {
  correct: boolean
  correctIndex: number
  categoryLabel: string
  points: number
  explanation: string
  recorded: boolean
  source: { title: string; url: string } | null
}

const emptyProfile: GameProfile = { score: 0, answeredCount: 0, correctCount: 0, currentStreak: 0, bestStreak: 0 }

function gameError(code: string, ru: boolean) {
  const messages: Record<string, [string, string]> = {
    logic_round_invalid_or_expired: ['Время ответа истекло. Откройте следующий пример.', 'This round expired. Open the next example.'],
    logic_round_session_mismatch: ['Аккаунт изменился во время игры. Загрузите новый пример.', 'The account changed during the round. Load a new example.'],
    invalid_csrf: ['Сессия обновилась. Закройте игру, войдите снова и продолжите.', 'The session changed. Close the game, sign in again, and continue.'],
    too_many_requests: ['Слишком быстрый темп. Сделайте короткую паузу.', 'Too many requests. Take a short break.'],
  }
  return messages[code]?.[ru ? 0 : 1] ?? (ru ? 'Не удалось загрузить игру. Попробуйте ещё раз.' : 'The game could not be loaded. Try again.')
}

export function SignalCircuit() {
  const { lang } = useT()
  const ru = lang === 'ru'
  const { user } = useAccountSession()
  const [profile, setProfile] = useState<GameProfile>(emptyProfile)
  const [guestScore, setGuestScore] = useState(0)
  const [guestAnswered, setGuestAnswered] = useState(0)
  const [total, setTotal] = useState(400)
  const [selectionTotal, setSelectionTotal] = useState(250)
  const [selectionAnswered, setSelectionAnswered] = useState(0)
  const [origin, setOrigin] = useState<OriginFilter>('documented')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')
  const [roundToken, setRoundToken] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<LogicChallenge | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [loading, setLoading] = useState(true)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loadRequestId = useRef(0)
  const feedbackHeadingRef = useRef<HTMLSpanElement>(null)

  const loadRound = useCallback(async () => {
    const requestId = loadRequestId.current + 1
    loadRequestId.current = requestId
    setLoading(true)
    setError(null)
    setSelected(null)
    setFeedback(null)
    setComplete(false)
    setRoundToken(null)
    setChallenge(null)
    try {
      const response = await fetch('/api/logic-game/round', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.csrfToken ? { 'X-CSRF-Token': user.csrfToken } : {}),
        },
        body: JSON.stringify({ lang, origin, difficulty }),
      })
      const body = await response.json() as {
        complete?: boolean
        roundToken?: string
        challenge?: LogicChallenge
        profile?: GameProfile
        totalChallenges?: number
        selectionTotal?: number
        selectionAnswered?: number
        error?: string
      }
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
      if (requestId !== loadRequestId.current) return
      setTotal(body.totalChallenges ?? 400)
      setSelectionTotal(body.selectionTotal ?? body.totalChallenges ?? 400)
      setSelectionAnswered(body.selectionAnswered ?? 0)
      if (body.profile) setProfile(body.profile)
      setComplete(Boolean(body.complete))
      setRoundToken(body.roundToken ?? null)
      setChallenge(body.challenge ?? null)
    } catch (cause) {
      if (requestId === loadRequestId.current) {
        setError(gameError(cause instanceof Error ? cause.message : 'logic_game_unavailable', ru))
      }
    } finally {
      if (requestId === loadRequestId.current) setLoading(false)
    }
  }, [difficulty, lang, origin, ru, user?.csrfToken])

  useEffect(() => {
    setProfile(emptyProfile)
    setGuestScore(0)
    setGuestAnswered(0)
  }, [user?.id])

  useEffect(() => {
    void loadRound()
  }, [loadRound])

  useEffect(() => {
    if (feedback) feedbackHeadingRef.current?.focus()
  }, [feedback])

  async function submitAnswer() {
    if (selected === null || !roundToken || feedback || loading) return
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/logic-game/answer', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.csrfToken ? { 'X-CSRF-Token': user.csrfToken } : {}),
        },
        body: JSON.stringify({ roundToken, selectedIndex: selected }),
      })
      const body = await response.json() as Feedback & { profile?: GameProfile; totalChallenges?: number; error?: string }
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
      setFeedback(body)
      if (body.profile && user) setProfile(body.profile)
      if (!user) {
        setGuestScore((value) => value + body.points)
        setGuestAnswered((value) => value + 1)
      }
      if (body.totalChallenges) setTotal(body.totalChallenges)
      sound.play(body.correct ? 'receipt' : 'warning')
    } catch (cause) {
      setError(gameError(cause instanceof Error ? cause.message : 'logic_game_unavailable', ru))
      sound.play('warning')
    } finally {
      setLoading(false)
    }
  }

  function resetFilters() {
    setOrigin('documented')
    setDifficulty('all')
  }

  const score = user ? profile.score : guestScore
  const answered = user ? profile.answeredCount : guestAnswered
  const correctCount = user ? profile.correctCount : 0
  const originOptions: Array<{ value: OriginFilter; ru: string; en: string }> = [
    { value: 'documented', ru: 'Реальные примеры', en: 'Real examples' },
    { value: 'life', ru: 'Отношения', en: 'Relationships' },
    { value: 'fiction', ru: 'Вымышленные миры', en: 'Fictional worlds' },
  ]
  const difficultyOptions: Array<{ value: DifficultyFilter; ru: string; en: string }> = [
    { value: 'all', ru: 'Любая', en: 'Any' },
    { value: 1, ru: 'Простые', en: 'Easy' },
    { value: 2, ru: 'Средние', en: 'Medium' },
    { value: 3, ru: 'Сложные', en: 'Hard' },
  ]
  const difficultyLabel = difficultyOptions.find((option) => option.value === challenge?.difficulty)

  return <div className="logic-game" aria-busy={loading}>
    <div className="logic-game__head">
      <div>
        <div className="mono logic-game__kicker">{ru ? 'ЛАБОРАТОРИЯ АРГУМЕНТОВ' : 'ARGUMENT LAB'} · {String(answered + 1).padStart(3, '0')}</div>
        <h2 id="logic-game-title">{ru ? 'Найдите разрыв в рассуждении' : 'Find the break in the reasoning'}</h2>
        <p className="muted">{challenge?.prompt ?? (ru ? 'Выберите фрагмент, где вывод перестаёт следовать из оснований.' : 'Choose the fragment where the conclusion stops following from the reasons.')}</p>
      </div>
      <div className="logic-game__metrics" aria-label={ru ? 'Результат игры' : 'Game result'}>
        <span><small>{ru ? 'очки' : 'score'}</small><strong>{score}</strong></span>
        <span><small>{ru ? 'решено' : 'solved'}</small><strong>{answered}/{total}</strong></span>
      </div>
    </div>

    {!user && <div className="logic-game__notice">
      <span>{ru ? 'Гостевой режим: результат действует до закрытия страницы.' : 'Guest mode: progress lasts until this page is closed.'}</span>
      <Link to="/auth?returnTo=%2F">{ru ? 'Войти и сохранять очки' : 'Sign in to save score'}</Link>
    </div>}

    <div className="logic-game__filters" aria-label={ru ? 'Фильтры заданий' : 'Challenge filters'}>
      <fieldset className="logic-filter">
        <legend>{ru ? 'Тип ситуации' : 'Case type'}</legend>
        <div className="logic-filter__options logic-filter__options--origin">
          {originOptions.map((option) => <button
            key={option.value}
            type="button"
            aria-pressed={origin === option.value}
            className={origin === option.value ? 'active' : ''}
            disabled={loading}
            onClick={() => { setOrigin(option.value); sound.play('tap') }}
          >{ru ? option.ru : option.en}</button>)}
        </div>
      </fieldset>
      <fieldset className="logic-filter">
        <legend>{ru ? 'Сложность' : 'Difficulty'}</legend>
        <div className="logic-filter__options logic-filter__options--difficulty">
          {difficultyOptions.map((option) => <button
            key={option.value}
            type="button"
            aria-pressed={difficulty === option.value}
            className={difficulty === option.value ? 'active' : ''}
            disabled={loading}
            onClick={() => { setDifficulty(option.value); sound.play('tap') }}
          >{ru ? option.ru : option.en}</button>)}
        </div>
      </fieldset>
    </div>

    {loading && !challenge && <div className="empty" role="status">{ru ? 'Подбираем пример…' : 'Preparing an example…'}</div>}

    {complete && !loading && <div className="logic-game__complete" role="status">
      <strong>{selectionTotal === 0
        ? (ru ? 'В этой выборке пока нет заданий' : 'There are no challenges in this selection')
        : (ru ? 'Все задания этой выборки разобраны' : 'All challenges in this selection are complete')}</strong>
      {user && selectionTotal > 0 && <p>{ru ? `Разобрано ${selectionAnswered} из ${selectionTotal}. Общий счёт: ${profile.score}.` : `${selectionAnswered} of ${selectionTotal} completed. Total score: ${profile.score}.`}</p>}
      {(origin !== 'documented' || difficulty !== 'all') && <button className="btn" type="button" onClick={resetFilters}>{ru ? 'Вернуться к реальным примерам' : 'Return to real examples'}</button>}
    </div>}

    {challenge && !complete && <>
      <div className="logic-game__round">
        <section className="logic-game__context">
          <div className="logic-game__meta">
            <span>{challenge.origin === 'documented'
              ? (ru ? 'реальный пример' : 'real example')
              : challenge.origin === 'life'
                ? (ru ? 'отношения' : 'relationships')
                : (ru ? 'вымышленный мир' : 'fictional world')} · {challenge.contextLabel}</span>
            <span>{ru ? 'сложность' : 'difficulty'} · {ru ? difficultyLabel?.ru : difficultyLabel?.en}</span>
          </div>
          {challenge.scenario && <p className="logic-game__scenario">{challenge.scenario}</p>}
          {feedback && <div className={`logic-game__feedback ${feedback.correct ? 'correct' : 'wrong'}`} role="status" aria-live="polite">
            <strong ref={feedbackHeadingRef} tabIndex={-1}>{feedback.correct
              ? (ru ? `Точно. +${feedback.points} очков` : `Correct. +${feedback.points} points`)
              : (ru ? 'Не здесь. Ошибочный переход подсвечен.' : 'Not here. The flawed step is highlighted.')}</strong>
            <small>{ru ? `Правильный ответ: ${String(feedback.correctIndex + 1).padStart(2, '0')}` : `Correct answer: ${String(feedback.correctIndex + 1).padStart(2, '0')}`}</small>
            <small className="logic-game__answer-type">{feedback.categoryLabel}</small>
            <p>{feedback.explanation}</p>
            {feedback.source && <a className="logic-game__source" href={feedback.source.url} target="_blank" rel="noreferrer">
              {challenge.id.startsWith('logic-real-')
                ? (ru ? `Официальный источник: ${feedback.source.title}` : `Official source: ${feedback.source.title}`)
                : (ru ? `Источник и контекст: ${feedback.source.title}` : `Source and context: ${feedback.source.title}`)} ↗
            </a>}
            {user && !feedback.recorded && <small>{ru ? 'Этот пример уже учитывался; повторные очки не начислены.' : 'This example was already recorded; no duplicate points were awarded.'}</small>}
          </div>}
        </section>

        <section className="logic-game__answer">
          <div className="logic-game__segments" role="group" aria-label={ru ? 'Фрагменты рассуждения' : 'Reasoning fragments'}>
            {challenge.segments.map((segment, index) => {
              const chosen = selected === index
              const isCorrect = Boolean(feedback && feedback.correctIndex === index)
              const isWrong = Boolean(feedback && chosen && !feedback.correct)
              return <button
                key={`${challenge.id}-${index}`}
                type="button"
                className={`logic-segment ${chosen ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
                aria-pressed={chosen}
                disabled={Boolean(feedback) || loading}
                onClick={() => { setSelected(index); sound.play('tap') }}
              >
                <span className="mono">{String(index + 1).padStart(2, '0')}</span>
                <span>
                  {segment}
                  {feedback && isCorrect && <small className="logic-segment__state">{ru ? 'Правильный ответ' : 'Correct answer'}</small>}
                  {feedback && isWrong && <small className="logic-segment__state">{ru ? 'Ваш выбор' : 'Your choice'}</small>}
                </span>
              </button>
            })}
          </div>

          <div className="logic-game__footer">
            <div className="muted" aria-live="polite">
              {user
                ? (ru ? `Верно: ${correctCount} · серия: ${profile.currentStreak} · лучшая: ${profile.bestStreak}` : `Correct: ${correctCount} · streak: ${profile.currentStreak} · best: ${profile.bestStreak}`)
                : (ru ? 'Гостевой счёт хранится только в этой вкладке.' : 'Guest score is kept only in this tab.')}
            </div>
            {!feedback
              ? <button className="btn primary" disabled={selected === null || loading} onClick={() => void submitAnswer()}>{loading ? (ru ? 'Проверяем…' : 'Checking…') : (ru ? 'Проверить' : 'Check')}</button>
              : <button className="btn primary" disabled={loading} onClick={() => void loadRound()}>{ru ? 'Следующий пример' : 'Next example'}</button>}
          </div>
        </section>
      </div>
    </>}

    {error && <div className="callout red logic-game__error" role="alert">
      <span>{error}</span>
      <button className="btn small" onClick={() => void loadRound()}>{ru ? 'Повторить' : 'Retry'}</button>
    </div>}
  </div>
}
